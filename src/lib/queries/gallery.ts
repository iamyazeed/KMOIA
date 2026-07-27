import "server-only";

import { CACHE_TAGS } from "@/lib/cache-tags";
import type { MediaRef } from "@/lib/queries/content";
import { cachedQuery, fallback, MEDIA_FIELDS } from "@/lib/queries/utils";
import { supabasePublic } from "@/lib/supabase/public";

export type GalleryRow = {
  id: string;
  caption: string | null;
  taken_at: string | null;
  category: { id: string; name: string; slug: string } | null;
  media: MediaRef;
};

export const getGalleryItems = cachedQuery(
  ["gallery", "list"],
  [CACHE_TAGS.gallery],
  async () => {
    const { data, error } = await supabasePublic
      .from("gallery_items")
      .select(
        `id, caption, taken_at,
         category:gallery_categories ( id, name, slug ),
         media:media!gallery_items_media_id_fkey ( ${MEDIA_FIELDS} )`,
      )
      .order("display_order", { ascending: true })
      .limit(200)
      .returns<GalleryRow[]>();

    if (error) return fallback("gallery.list", error, []);
    return data ?? [];
  },
);

export const getGalleryCategories = cachedQuery(
  ["gallery", "categories"],
  [CACHE_TAGS.gallery],
  async () => {
    const { data, error } = await supabasePublic
      .from("gallery_categories")
      .select("id, name, slug")
      .order("display_order", { ascending: true });

    if (error) return fallback("gallery.categories", error, []);
    return data ?? [];
  },
);
