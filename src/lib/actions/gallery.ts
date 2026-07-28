"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createClient } from "@/lib/supabase/server";

export type GalleryState = { error?: string; success?: string } | undefined;

const itemSchema = z.object({
  media_id: z.uuid("Choose an image"),
  category_id: z.uuid().optional().or(z.literal("")),
  caption: z.string().trim().max(300).optional().or(z.literal("")),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
  status: z.enum(["draft", "published"]),
});

/** Adds selected media to the gallery in one go. */
export async function addGalleryItems(
  mediaIds: string[],
  categoryId: string | null,
): Promise<GalleryState> {
  await requireAdmin();

  if (mediaIds.length === 0) return { error: "Select at least one image." };

  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").insert(
    mediaIds.map((mediaId, index) => ({
      media_id: mediaId,
      category_id: categoryId,
      display_order: index,
      // Added as published: the admin has already chosen these deliberately,
      // and a gallery of invisible images is a confusing default.
      status: "published" as const,
    })),
  );

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.gallery);
  return {
    success: `${mediaIds.length} image${mediaIds.length === 1 ? "" : "s"} added.`,
  };
}

export async function updateGalleryItem(
  id: string,
  _prev: GalleryState,
  formData: FormData,
): Promise<GalleryState> {
  await requireAdmin();

  const parsed = itemSchema.safeParse({
    media_id: formData.get("media_id"),
    category_id: formData.get("category_id"),
    caption: formData.get("caption"),
    display_order: formData.get("display_order") || 0,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_items")
    .update({
      category_id: parsed.data.category_id || null,
      caption: parsed.data.caption || null,
      display_order: parsed.data.display_order,
      status: parsed.data.status,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.gallery);
  return { success: "Image updated." };
}

/**
 * Removes an image from the gallery.
 *
 * Soft delete: the underlying file stays in the Media Library, so this only
 * takes the image off the public gallery and can be undone.
 */
export async function removeGalleryItem(id: string): Promise<GalleryState> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_items")
    .update({ deleted_at: new Date().toISOString(), status: "draft" })
    .eq("id", id);

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.gallery);
  return { success: "Removed from the gallery." };
}

export async function restoreGalleryItem(id: string): Promise<GalleryState> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_items")
    .update({ deleted_at: null })
    .eq("id", id);

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.gallery);
  return { success: "Restored." };
}
