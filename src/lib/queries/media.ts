import "server-only";

import { mediaUrl } from "@/lib/queries/utils";
import { supabasePublic } from "@/lib/supabase/public";

/**
 * Resolves a media id to its public URL.
 *
 * Config values such as `donation_methods.config.qr_media_id` store a media
 * UUID, not a path. The file lives at the bucket and storage path recorded on
 * its row, so a URL must be built from the row — deriving one from the id
 * produces a 404, which for the donation QR would silently break giving.
 */
export async function resolveMediaUrl(
  mediaId: string | null | undefined,
): Promise<string | null> {
  if (!mediaId) return null;

  const { data, error } = await supabasePublic
    .from("media")
    .select("bucket, storage_path")
    .eq("id", mediaId)
    .maybeSingle();

  if (error || !data) return null;
  return mediaUrl(data.bucket, data.storage_path);
}
