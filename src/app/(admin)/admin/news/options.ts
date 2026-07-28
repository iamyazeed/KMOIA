import "server-only";

import { mediaUrl } from "@/lib/queries/utils";
import { createClient } from "@/lib/supabase/server";

export async function loadNewsFormOptions() {
  const supabase = await createClient();

  const [categories, media] = await Promise.all([
    supabase
      .from("news_categories")
      .select("id, name")
      .is("deleted_at", null)
      .order("display_order", { ascending: true }),
    supabase
      .from("media")
      .select("id, bucket, storage_path, alt_text")
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  return {
    categories: categories.data ?? [],
    media: (media.data ?? []).map((item) => ({
      id: item.id,
      url: mediaUrl(item.bucket, item.storage_path),
      alt: item.alt_text,
    })),
  };
}
