"use server";

import { revalidatePath, updateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createClient } from "@/lib/supabase/server";
import { newsSchema, slugifyTitle } from "@/lib/validation/news";
import type { RichTextDocument } from "@/types/database";

export type NewsState = { error?: string; success?: string } | undefined;

/**
 * Purges both caches after a write.
 *
 * `updateTag` clears the data cache, but `/news` is statically rendered with
 * ISR, so the *rendered page* stayed cached until its revalidate window
 * elapsed — a newly published article only appeared an hour later. The route
 * cache has to be purged explicitly as well.
 */
function revalidateNews() {
  updateTag(CACHE_TAGS.news);
  revalidatePath("/news");
  revalidatePath("/news/[slug]", "page");
}

function nullify(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? null : text;
}

function parseBody(raw: FormDataEntryValue | null): RichTextDocument | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  try {
    return JSON.parse(raw) as RichTextDocument;
  } catch {
    return null;
  }
}

function parse(formData: FormData) {
  return newsSchema.safeParse({
    primary_language: formData.get("primary_language") ?? "en",
    title: formData.get("title") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    title_ml: formData.get("title_ml") ?? "",
    excerpt_ml: formData.get("excerpt_ml") ?? "",
    category_id: formData.get("category_id") ?? "",
    cover_media_id: formData.get("cover_media_id") ?? "",
    status: formData.get("status") ?? "draft",
    published_at: formData.get("published_at") ?? "",
    meta_description: formData.get("meta_description") ?? "",
  });
}

function buildValues(formData: FormData, data: ReturnType<typeof parse>) {
  if (!data.success) throw new Error("unreachable");
  const input = data.data;

  return {
    primary_language: input.primary_language,
    title: nullify(formData.get("title")),
    excerpt: nullify(formData.get("excerpt")),
    body: parseBody(formData.get("body")),
    title_ml: nullify(formData.get("title_ml")),
    excerpt_ml: nullify(formData.get("excerpt_ml")),
    body_ml: parseBody(formData.get("body_ml")),
    category_id: nullify(formData.get("category_id")),
    cover_media_id: nullify(formData.get("cover_media_id")),
    meta_description: nullify(formData.get("meta_description")),
    status: input.status,
    // A published article must have a date — the database enforces it too.
    published_at:
      input.status === "published"
        ? nullify(formData.get("published_at")) ?? new Date().toISOString()
        : nullify(formData.get("published_at")),
  };
}

export async function createNews(
  _prev: NewsState,
  formData: FormData,
): Promise<NewsState> {
  await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const supabase = await createClient();
  const values = buildValues(formData, parsed);

  const base = slugifyTitle(values.title ?? values.title_ml ?? "");
  const { data: existing } = await supabase
    .from("news_posts")
    .select("slug")
    .like("slug", `${base}%`);

  const taken = new Set((existing ?? []).map((row) => row.slug));
  let slug = base;
  let suffix = 2;
  while (taken.has(slug)) slug = `${base}-${suffix++}`;

  const { error } = await supabase.from("news_posts").insert({ ...values, slug });
  if (error) return { error: error.message };

  revalidateNews();
  return { success: "Article created." };
}

export async function updateNews(
  id: string,
  _prev: NewsState,
  formData: FormData,
): Promise<NewsState> {
  await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("news_posts")
    .update(buildValues(formData, parsed))
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateNews();
  return { success: "Changes saved." };
}

export async function setNewsStatus(
  id: string,
  status: "draft" | "published",
): Promise<NewsState> {
  await requireAdmin();

  const supabase = await createClient();

  // Publishing without a date violates the check constraint, so supply one.
  const patch =
    status === "published"
      ? { status, published_at: new Date().toISOString() }
      : { status };

  const { error } = await supabase.from("news_posts").update(patch).eq("id", id);
  if (error) return { error: error.message };

  revalidateNews();
  return { success: status === "published" ? "Published." : "Unpublished." };
}

export async function deleteNews(id: string): Promise<NewsState> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("news_posts")
    .update({ deleted_at: new Date().toISOString(), status: "draft" })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateNews();
  return { success: "Moved to trash." };
}

export async function restoreNews(id: string): Promise<NewsState> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("news_posts")
    .update({ deleted_at: null })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateNews();
  return { success: "Restored." };
}
