import "server-only";

import { CACHE_TAGS } from "@/lib/cache-tags";
import type { MediaRef } from "@/lib/queries/content";
import { cachedQuery, fallback, MEDIA_FIELDS } from "@/lib/queries/utils";
import { supabasePublic } from "@/lib/supabase/public";
import type { ContentLanguage, RichTextDocument } from "@/types/database";

export type NewsListRow = {
  id: string;
  slug: string;
  title: string | null;
  title_ml: string | null;
  excerpt: string | null;
  excerpt_ml: string | null;
  primary_language: ContentLanguage;
  published_at: string | null;
  category: { id: string; name: string; slug: string } | null;
  cover: MediaRef;
};

export type NewsDetailRow = NewsListRow & {
  body: RichTextDocument | null;
  body_ml: RichTextDocument | null;
  meta_title: string | null;
  meta_description: string | null;
};

const LIST_FIELDS = `
  id, slug, title, title_ml, excerpt, excerpt_ml, primary_language, published_at,
  category:news_categories ( id, name, slug ),
  cover:media!news_posts_cover_media_id_fkey ( ${MEDIA_FIELDS} )
`;

export const getNewsPosts = cachedQuery(
  ["news", "list"],
  [CACHE_TAGS.news],
  async () => {
    const { data, error } = await supabasePublic
      .from("news_posts")
      .select(LIST_FIELDS)
      .order("published_at", { ascending: false })
      .limit(50)
      .returns<NewsListRow[]>();

    if (error) return fallback("news.list", error, []);
    return data ?? [];
  },
);

export const getNewsPost = cachedQuery(
  ["news", "detail"],
  [CACHE_TAGS.news],
  async (slug: string) => {
    const { data, error } = await supabasePublic
      .from("news_posts")
      .select(
        `${LIST_FIELDS}, body, body_ml, meta_title, meta_description`,
      )
      .eq("slug", slug)
      .maybeSingle<NewsDetailRow>();

    if (error) return fallback("news.detail", error, null);
    return data;
  },
);

/**
 * Picks the fields for whichever language an article was written in.
 * Nothing is translated — the admin writes in one language and it renders
 * exactly as written, with the correct `lang` attribute for screen readers
 * and search engines.
 */
export function localiseNews<T extends NewsListRow>(post: T) {
  const isMalayalam = post.primary_language === "ml";

  return {
    lang: isMalayalam ? ("ml" as const) : ("en" as const),
    title: (isMalayalam ? post.title_ml : post.title) ?? post.title ?? "Untitled",
    excerpt: isMalayalam ? post.excerpt_ml : post.excerpt,
  };
}
