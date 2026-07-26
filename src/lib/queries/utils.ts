import "server-only";

import { unstable_cache } from "next/cache";

import { DEFAULT_REVALIDATE, type CacheTag } from "@/lib/cache-tags";

/**
 * Wraps a public data read in the Next.js data cache under a tag.
 *
 * Public pages must never fail to render because the database is briefly
 * unreachable — a section with no data is a far better outcome than a 500 for
 * every visitor. Query functions therefore return empty results and log, rather
 * than throwing. Admin code, where a silent failure would be misleading, uses
 * the Supabase client directly and surfaces errors.
 */
export function cachedQuery<Args extends unknown[], Result>(
  keyParts: string[],
  tags: CacheTag[],
  fn: (...args: Args) => Promise<Result>,
) {
  return unstable_cache(fn, keyParts, {
    tags,
    revalidate: DEFAULT_REVALIDATE,
  });
}

/** Logs a failed public read and falls back to a safe empty value. */
export function fallback<T>(context: string, error: unknown, value: T): T {
  console.error(`[query:${context}]`, error);
  return value;
}

/** Columns selected wherever an image is joined in. */
export const MEDIA_FIELDS =
  "id, bucket, storage_path, alt_text, alt_text_ml, width, height, blurhash";

/** Builds the public URL for a Storage object. */
export function mediaUrl(bucket: string, path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
