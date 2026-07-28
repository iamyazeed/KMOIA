"use server";

import { revalidatePath, updateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getCollection, type CollectionConfig } from "@/lib/admin/collections";
import { createClient } from "@/lib/supabase/server";

export type CollectionState = { error?: string; success?: string } | undefined;

type WriteResult = { error: { message: string; code?: string } | null };

/**
 * Minimal view of a table whose name is only known at runtime.
 *
 * supabase-js derives payload types from a literal table name; given a union
 * it collapses inserts and updates to `never`. Casting once behind this helper
 * keeps that single concession in one place instead of spreading `as never`
 * through every call. RLS still governs all of these writes — the cast affects
 * types only, never permissions.
 */
type DynamicTable = {
  select: (columns: string) => {
    like: (column: string, pattern: string) => Promise<{ data: unknown }>;
  };
  insert: (values: Record<string, unknown>) => Promise<WriteResult>;
  update: (values: Record<string, unknown>) => {
    eq: (column: string, value: string) => Promise<WriteResult>;
  };
};

async function table(config: CollectionConfig): Promise<DynamicTable> {
  const supabase = await createClient();
  return supabase.from(config.table) as unknown as DynamicTable;
}

/** Data-cache tags to purge per collection. */
const TAGS: Record<string, string[]> = {
  hero: [CACHE_TAGS.hero],
  statistics: [CACHE_TAGS.statistics],
  sections: [CACHE_TAGS.pageSections],
  achievements: [CACHE_TAGS.achievements],
  departments: [CACHE_TAGS.departments, CACHE_TAGS.faculty],
  facilities: [CACHE_TAGS.facilities],
  skills: [CACHE_TAGS.skills],
  timeline: [CACHE_TAGS.timeline],
};

function purge(config: CollectionConfig) {
  for (const tag of TAGS[config.slug] ?? []) updateTag(tag);
  // The rendered pages are cached too, not just the data behind them.
  for (const path of config.revalidate) revalidatePath(path);
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || `item-${Date.now()}`
  );
}

/** Reads a form into the shape the table expects, per the field config. */
function readValues(config: CollectionConfig, formData: FormData) {
  const values: Record<string, unknown> = {};

  for (const field of config.fields) {
    const raw = formData.get(field.name);

    if (field.type === "boolean") {
      values[field.name] = raw === "on";
      continue;
    }

    const text = typeof raw === "string" ? raw.trim() : "";

    if (field.type === "number") {
      values[field.name] = text === "" ? null : Number(text);
      continue;
    }

    // Empty means "not set", never an empty string in a UUID column.
    values[field.name] = text === "" ? null : text;
  }

  values.display_order = Number(formData.get("display_order") ?? 0) || 0;
  values.status =
    formData.get("status") === "published" ? "published" : "draft";

  return values;
}

function validate(config: CollectionConfig, values: Record<string, unknown>) {
  for (const field of config.fields) {
    if (!field.required) continue;
    const value = values[field.name];
    if (value === null || value === undefined || value === "") {
      return `${field.label} is required`;
    }
    if (field.type === "number" && Number.isNaN(value as number)) {
      return `${field.label} must be a number`;
    }
  }
  return null;
}

export async function saveCollectionItem(
  collectionSlug: string,
  id: string | null,
  _prev: CollectionState,
  formData: FormData,
): Promise<CollectionState> {
  await requireAdmin();

  const config = getCollection(collectionSlug);
  if (!config) return { error: "Unknown content type." };

  const values = readValues(config, formData);
  const problem = validate(config, values);
  if (problem) return { error: problem };

  const db = await table(config);

  // Tables with a unique slug column get one generated on create.
  if (!id && config.slugFrom) {
    const base = slugify(String(values[config.slugFrom] ?? ""));
    const { data: existing } = await db.select("slug").like("slug", `${base}%`);

    const taken = new Set(
      ((existing ?? []) as { slug: string }[]).map((row) => row.slug),
    );
    let slug = base;
    let suffix = 2;
    while (taken.has(slug)) slug = `${base}-${suffix++}`;
    values.slug = slug;
  }

  const { error } = id
    ? await db.update(values).eq("id", id)
    : await db.insert(values);

  if (error) {
    // Surface the common one in plain language.
    if (error.code === "23505") {
      return { error: "An entry with those details already exists." };
    }
    return { error: error.message };
  }

  purge(config);
  return { success: id ? "Changes saved." : `${config.title} entry added.` };
}

export async function setCollectionStatus(
  collectionSlug: string,
  id: string,
  status: "draft" | "published",
): Promise<CollectionState> {
  await requireAdmin();

  const config = getCollection(collectionSlug);
  if (!config) return { error: "Unknown content type." };

  const { error } = await (await table(config)).update({ status }).eq("id", id);

  if (error) return { error: error.message };

  purge(config);
  return { success: status === "published" ? "Published." : "Unpublished." };
}

/** Soft delete — a mis-click must always be recoverable. */
export async function deleteCollectionItem(
  collectionSlug: string,
  id: string,
): Promise<CollectionState> {
  await requireAdmin();

  const config = getCollection(collectionSlug);
  if (!config) return { error: "Unknown content type." };

  const { error } = await (await table(config))
    .update({ deleted_at: new Date().toISOString(), status: "draft" })
    .eq("id", id);

  if (error) return { error: error.message };

  purge(config);
  return { success: "Moved to trash." };
}

export async function restoreCollectionItem(
  collectionSlug: string,
  id: string,
): Promise<CollectionState> {
  await requireAdmin();

  const config = getCollection(collectionSlug);
  if (!config) return { error: "Unknown content type." };

  const { error } = await (await table(config))
    .update({ deleted_at: null })
    .eq("id", id);

  if (error) return { error: error.message };

  purge(config);
  return { success: "Restored." };
}
