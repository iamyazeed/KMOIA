import { z } from "zod";

export const MEDIA_FOLDERS = [
  "general",
  "campus",
  "faculty",
  "gallery",
  "news",
  "achievements",
  "sponsorship",
  "branding",
] as const;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/**
 * Aspect presets offered at upload time.
 *
 * Cropping at upload rather than with CSS is what keeps grids visually even:
 * a stray portrait photo in a 4:5 faculty grid is the most common way these
 * sites start looking untidy after a year of committee edits.
 */
export const ASPECT_PRESETS = [
  { id: "original", label: "Original", ratio: null },
  { id: "square", label: "Square (1:1)", ratio: 1 },
  { id: "portrait", label: "Portrait (4:5) — faculty", ratio: 4 / 5 },
  { id: "landscape", label: "Landscape (16:9)", ratio: 16 / 9 },
  { id: "wide", label: "Wide (21:9) — hero", ratio: 21 / 9 },
] as const;

export const mediaMetadataSchema = z.object({
  // Alt text is required. An empty string is allowed only when the uploader
  // explicitly marks the image decorative, which is a conscious act rather
  // than an omission — this is what keeps the site at WCAG AA over years of
  // committee edits.
  alt_text: z.string().trim().max(300),
  is_decorative: z.boolean().default(false),
  folder: z.enum(MEDIA_FOLDERS).default("general"),
});

export const mediaUploadSchema = mediaMetadataSchema
  .extend({
    filename: z.string().min(1),
    mime_type: z.enum(ACCEPTED_IMAGE_TYPES),
    size_bytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    blurhash: z.string().max(4000).nullish(),
    bucket: z.enum(["public-media", "qr-codes"]).default("public-media"),
  })
  .refine((data) => data.is_decorative || data.alt_text.length >= 3, {
    message: "Describe the image, or mark it decorative",
    path: ["alt_text"],
  });

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
