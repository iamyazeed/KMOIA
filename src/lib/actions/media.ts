"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mediaUploadSchema } from "@/lib/validation/media";

export type ActionState = { error?: string; success?: string } | undefined;

/**
 * Records an uploaded file in the media library.
 *
 * The binary itself is uploaded straight from the browser to Storage (see
 * `upload-dialog.tsx`) — routing 20 MB through a serverless function would be
 * slower and pointlessly expensive. This action writes the row that makes the
 * file usable, and it is where alt text becomes non-negotiable.
 */
export async function registerMedia(input: unknown): Promise<ActionState> {
  await requireAdmin();

  const parsed = mediaUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid image details" };
  }

  const { is_decorative, ...data } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.from("media").insert({
    bucket: data.bucket,
    storage_path: data.filename,
    filename: data.filename,
    mime_type: "image/webp",
    size_bytes: data.size_bytes,
    width: data.width,
    height: data.height,
    blurhash: data.blurhash ?? null,
    // Decorative images get an empty alt so screen readers skip them, which is
    // correct — but it has to be chosen, not defaulted into.
    alt_text: is_decorative ? "" : data.alt_text,
    folder: data.folder,
  });

  if (error) {
    return { error: `Could not save the image: ${error.message}` };
  }

  revalidatePath("/admin/media");
  return { success: "Image added to the library." };
}

export async function updateMediaAltText(
  id: string,
  altText: string,
): Promise<ActionState> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("media")
    .update({ alt_text: altText.trim() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/media");
  return { success: "Description updated." };
}

/**
 * Deletes an image and its stored file.
 *
 * Foreign keys are `ON DELETE SET NULL`, so a referenced image disappearing
 * leaves the content row intact rather than cascading a deletion through the
 * site. Gallery items are the deliberate exception and cascade.
 */
export async function deleteMedia(id: string): Promise<ActionState> {
  await requireAdmin();

  const supabase = await createClient();

  const { data: media, error: fetchError } = await supabase
    .from("media")
    .select("bucket, storage_path")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !media) {
    return { error: "That image no longer exists." };
  }

  const { error: storageError } = await supabase.storage
    .from(media.bucket)
    .remove([media.storage_path]);

  if (storageError) {
    return { error: `Could not remove the file: ${storageError.message}` };
  }

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/media");
  return { success: "Image deleted." };
}
