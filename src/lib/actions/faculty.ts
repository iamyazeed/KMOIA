"use server";

import { revalidatePath, updateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createClient } from "@/lib/supabase/server";
import { facultySchema, slugify } from "@/lib/validation/faculty";

export type FacultyState = { error?: string; success?: string } | undefined;

/** Empty strings from a form mean "not set", not an empty UUID. */
function nullify(value: unknown) {
  return value === "" || value === undefined ? null : value;
}

function parse(formData: FormData) {
  return facultySchema.safeParse({
    name: formData.get("name"),
    designation: formData.get("designation"),
    qualification: formData.get("qualification"),
    department_id: formData.get("department_id"),
    photo_media_id: formData.get("photo_media_id"),
    biography: formData.get("biography"),
    display_order: formData.get("display_order") || 0,
    status: formData.get("status") || "draft",
  });
}

/**
 * Faculty mutations.
 *
 * Every write revalidates both the faculty tag and departments, because the
 * public directory groups people by department and a change to either
 * invalidates that view.
 */
export async function createFaculty(
  _prev: FacultyState,
  formData: FormData,
): Promise<FacultyState> {
  await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const supabase = await createClient();
  const data = parsed.data;

  // Slugs must stay unique; a second "Muhammed Ali" gets a numeric suffix
  // rather than failing the save with a constraint violation.
  const base = slugify(data.name) || "faculty";
  const { data: existing } = await supabase
    .from("faculty")
    .select("slug")
    .like("slug", `${base}%`);

  const taken = new Set((existing ?? []).map((row) => row.slug));
  let slug = base;
  let suffix = 2;
  while (taken.has(slug)) slug = `${base}-${suffix++}`;

  const { error } = await supabase.from("faculty").insert({
    name: data.name,
    slug,
    designation: data.designation,
    qualification: data.qualification,
    department_id: nullify(data.department_id) as string | null,
    photo_media_id: nullify(data.photo_media_id) as string | null,
    biography: (nullify(data.biography) as string | null) ?? null,
    display_order: data.display_order,
    status: data.status,
  });

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.faculty);
  revalidatePath("/faculty");
  updateTag(CACHE_TAGS.departments);
  return { success: "Faculty member added." };
}

export async function updateFaculty(
  id: string,
  _prev: FacultyState,
  formData: FormData,
): Promise<FacultyState> {
  await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const supabase = await createClient();
  const data = parsed.data;

  const { error } = await supabase
    .from("faculty")
    .update({
      name: data.name,
      designation: data.designation,
      qualification: data.qualification,
      department_id: nullify(data.department_id) as string | null,
      photo_media_id: nullify(data.photo_media_id) as string | null,
      biography: (nullify(data.biography) as string | null) ?? null,
      display_order: data.display_order,
      status: data.status,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.faculty);
  revalidatePath("/faculty");
  updateTag(CACHE_TAGS.departments);
  return { success: "Changes saved." };
}

/**
 * Soft delete.
 *
 * Removing a senior scholar by mis-click must be recoverable, so the row is
 * marked rather than destroyed and stays visible in the admin Trash view.
 */
export async function deleteFaculty(id: string): Promise<FacultyState> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("faculty")
    .update({ deleted_at: new Date().toISOString(), status: "draft" })
    .eq("id", id);

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.faculty);
  revalidatePath("/faculty");
  return { success: "Moved to trash." };
}

export async function restoreFaculty(id: string): Promise<FacultyState> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("faculty")
    .update({ deleted_at: null })
    .eq("id", id);

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.faculty);
  revalidatePath("/faculty");
  return { success: "Restored." };
}

/** Publish / unpublish without opening the editor. */
export async function setFacultyStatus(
  id: string,
  status: "draft" | "published",
): Promise<FacultyState> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("faculty").update({ status }).eq("id", id);

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.faculty);
  revalidatePath("/faculty");
  return { success: status === "published" ? "Published." : "Unpublished." };
}

/** Persists a reordered list in one round trip. */
export async function reorderFaculty(
  ids: string[],
): Promise<FacultyState> {
  await requireAdmin();

  const supabase = await createClient();

  const updates = ids.map((id, index) =>
    supabase.from("faculty").update({ display_order: index }).eq("id", id),
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);

  if (failed?.error) return { error: failed.error.message };

  updateTag(CACHE_TAGS.faculty);
  revalidatePath("/faculty");
  return { success: "Order saved." };
}
