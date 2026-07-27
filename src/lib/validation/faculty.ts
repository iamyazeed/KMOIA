import { z } from "zod";

export const facultySchema = z.object({
  name: z.string().trim().min(2, "Enter the full name").max(120),
  designation: z.string().trim().min(2, "Enter a designation").max(120),
  qualification: z.string().trim().min(1, "Enter a qualification").max(160),
  department_id: z.uuid().nullish().or(z.literal("")),
  photo_media_id: z.uuid().nullish().or(z.literal("")),
  biography: z.string().trim().max(4000).optional().or(z.literal("")),
  display_order: z.coerce.number().int().min(0).max(9999).default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type FacultyInput = z.infer<typeof facultySchema>;

/** `Muhammed Ali Musliyar` → `muhammed-ali-musliyar` */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
