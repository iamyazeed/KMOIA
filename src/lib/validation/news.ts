import { z } from "zod";

/**
 * News validation.
 *
 * The language rule is enforced here as well as by a CHECK constraint: an
 * article must carry a title in the language it claims to be written in.
 * Nothing is ever translated — the admin writes in one language and it renders
 * exactly as typed.
 */
export const newsSchema = z
  .object({
    primary_language: z.enum(["en", "ml"]),
    title: z.string().trim().max(200).optional().or(z.literal("")),
    excerpt: z.string().trim().max(500).optional().or(z.literal("")),
    title_ml: z.string().trim().max(200).optional().or(z.literal("")),
    excerpt_ml: z.string().trim().max(500).optional().or(z.literal("")),
    category_id: z.uuid().optional().or(z.literal("")),
    cover_media_id: z.uuid().optional().or(z.literal("")),
    status: z.enum(["draft", "published"]),
    published_at: z.string().optional().or(z.literal("")),
    meta_description: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      data.primary_language === "en"
        ? Boolean(data.title)
        : Boolean(data.title_ml),
    {
      message:
        "Enter a title in the language this article is written in",
      path: ["title"],
    },
  );

export type NewsInput = z.infer<typeof newsSchema>;

export function slugifyTitle(value: string) {
  const ascii = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  // Malayalam titles produce no ASCII, so fall back to a dated slug rather
  // than an empty one.
  return ascii || `post-${Date.now()}`;
}
