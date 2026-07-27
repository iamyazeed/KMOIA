import "server-only";

import type { MediaOption } from "@/app/(admin)/admin/faculty/faculty-form";
import { mediaUrl } from "@/lib/queries/utils";
import { createClient } from "@/lib/supabase/server";

/**
 * Options shared by the create and edit screens.
 *
 * Portraits are drawn from the `faculty` folder first so the picker shows the
 * relevant images without the whole library getting in the way.
 */
export async function loadFacultyFormOptions() {
  const supabase = await createClient();

  const [departmentsResult, mediaResult] = await Promise.all([
    supabase
      .from("departments")
      .select("id, name")
      .is("deleted_at", null)
      .order("display_order", { ascending: true }),
    supabase
      .from("media")
      .select("id, bucket, storage_path, alt_text, filename, folder")
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  const media: MediaOption[] = (mediaResult.data ?? [])
    .sort((a, b) =>
      a.folder === b.folder ? 0 : a.folder === "faculty" ? -1 : 1,
    )
    .map((item) => ({
      id: item.id,
      url: mediaUrl(item.bucket, item.storage_path),
      alt: item.alt_text,
      filename: item.filename,
    }));

  return {
    departments: departmentsResult.data ?? [],
    media,
  };
}
