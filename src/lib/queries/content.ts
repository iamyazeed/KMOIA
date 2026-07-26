import "server-only";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { cachedQuery, fallback, MEDIA_FIELDS } from "@/lib/queries/utils";
import { supabasePublic } from "@/lib/supabase/public";

/**
 * Institutional content reads.
 *
 * Every function here returns an empty result on failure rather than throwing:
 * a section that renders its curated default is a far better outcome for a
 * visitor than a 500 for the whole page.
 *
 * Embedded selects use `.returns<T>()` because the hand-written Database type
 * declares no `Relationships`, so supabase-js cannot infer the shape of a
 * joined row on its own. Once `npm run db:types` generates the real types,
 * these annotations become redundant but stay harmless.
 */

/** Shape of a joined `media` row, matching MEDIA_FIELDS. */
export type MediaRef = {
  id: string;
  bucket: string;
  storage_path: string;
  alt_text: string;
  alt_text_ml: string | null;
  width: number | null;
  height: number | null;
  blurhash: string | null;
} | null;

export const getHeroSlides = cachedQuery(
  ["home", "hero"],
  [CACHE_TAGS.hero],
  async () => {
    const { data, error } = await supabasePublic
      .from("hero_slides")
      .select(
        `id, heading, subheading, eyebrow, cta_label, cta_href,
         secondary_cta_label, secondary_cta_href,
         media:media!hero_slides_media_id_fkey ( ${MEDIA_FIELDS} )`,
      )
      .order("display_order", { ascending: true })
      .limit(5);

    if (error) return fallback("home.hero", error, []);
    return data ?? [];
  },
);

export const getStatistics = cachedQuery(
  ["home", "statistics"],
  [CACHE_TAGS.statistics],
  async () => {
    const { data, error } = await supabasePublic
      .from("statistics")
      .select("id, label, value, suffix, number_format, icon")
      .order("display_order", { ascending: true });

    if (error) return fallback("home.statistics", error, []);
    return data ?? [];
  },
);

export const getCoreAmbitions = cachedQuery(
  ["home", "ambitions"],
  [CACHE_TAGS.ambitions],
  async () => {
    const { data, error } = await supabasePublic
      .from("core_ambitions")
      .select("id, title, description, icon")
      .order("display_order", { ascending: true });

    if (error) return fallback("home.ambitions", error, []);
    return data ?? [];
  },
);

/** Editable prose blocks for a page, keyed by `section_key`. */
export const getPageSections = cachedQuery(
  ["page", "sections"],
  [CACHE_TAGS.pageSections],
  async (pageSlug: string) => {
    const { data, error } = await supabasePublic
      .from("page_sections")
      .select(
        `id, section_key, title, title_ml, subtitle, body, body_ml,
         media:media!page_sections_media_id_fkey ( ${MEDIA_FIELDS} )`,
      )
      .eq("page_slug", pageSlug)
      .order("display_order", { ascending: true });

    if (error) return fallback("page.sections", error, []);
    return data ?? [];
  },
);

export const getTimeline = cachedQuery(
  ["legacy", "timeline"],
  [CACHE_TAGS.timeline],
  async () => {
    const { data, error } = await supabasePublic
      .from("timeline_events")
      .select(
        `id, year, event_date, title, title_ml, description, description_ml,
         media:media!timeline_events_media_id_fkey ( ${MEDIA_FIELDS} )`,
      )
      .order("display_order", { ascending: true })
      .order("year", { ascending: true });

    if (error) return fallback("legacy.timeline", error, []);
    return data ?? [];
  },
);

export const getFacilities = cachedQuery(
  ["campus", "facilities"],
  [CACHE_TAGS.facilities],
  async () => {
    const { data, error } = await supabasePublic
      .from("facilities")
      .select(
        `id, name, description, icon,
         media:media!facilities_media_id_fkey ( ${MEDIA_FIELDS} )`,
      )
      .order("display_order", { ascending: true });

    if (error) return fallback("campus.facilities", error, []);
    return data ?? [];
  },
);

export const getSkills = cachedQuery(
  ["campus", "skills"],
  [CACHE_TAGS.skills],
  async () => {
    const { data, error } = await supabasePublic
      .from("skills")
      .select(
        `id, title, description, icon,
         media:media!skills_media_id_fkey ( ${MEDIA_FIELDS} )`,
      )
      .order("display_order", { ascending: true });

    if (error) return fallback("campus.skills", error, []);
    return data ?? [];
  },
);

export const getAchievementCategories = cachedQuery(
  ["achievements", "categories"],
  [CACHE_TAGS.achievements],
  async () => {
    const { data, error } = await supabasePublic
      .from("achievement_categories")
      .select("id, name, slug, description, icon")
      .order("display_order", { ascending: true });

    if (error) return fallback("achievements.categories", error, []);
    return data ?? [];
  },
);

export const getAchievements = cachedQuery(
  ["achievements", "list"],
  [CACHE_TAGS.achievements],
  async () => {
    const { data, error } = await supabasePublic
      .from("achievements")
      .select(
        `id, title, description, icon, year, is_featured, category_id,
         category:achievement_categories ( id, name, slug ),
         media:media!achievements_media_id_fkey ( ${MEDIA_FIELDS} )`,
      )
      .order("display_order", { ascending: true })
      .returns<
        {
          id: string;
          title: string;
          description: string | null;
          icon: string | null;
          year: number | null;
          is_featured: boolean;
          category_id: string | null;
          category: { id: string; name: string; slug: string } | null;
          media: MediaRef;
        }[]
      >();

    if (error) return fallback("achievements.list", error, []);
    return data ?? [];
  },
);

export type AchievementRecord = Awaited<
  ReturnType<typeof getAchievements>
>[number];
