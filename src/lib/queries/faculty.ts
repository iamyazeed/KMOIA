import "server-only";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { cachedQuery, fallback, MEDIA_FIELDS } from "@/lib/queries/utils";
import type { MediaRef } from "@/lib/queries/content";
import { supabasePublic } from "@/lib/supabase/public";

/**
 * Faculty reads.
 *
 * This module is the reference pattern for every domain query in the app:
 * anonymous client, explicit column list (never `select("*")`), cached under a
 * tag, and an empty-array fallback so a database hiccup degrades one section
 * instead of the whole page.
 */

const FACULTY_FIELDS = `
  id, name, slug, designation, qualification, biography, display_order,
  department:departments ( id, name, slug ),
  photo:media!faculty_photo_media_id_fkey ( ${MEDIA_FIELDS} )
`;

/**
 * Joined faculty row. Declared explicitly because the hand-written Database
 * type carries no `Relationships`, so supabase-js cannot infer embedded shapes
 * on its own. `npm run db:types` makes this redundant.
 */
export type FacultyRow = {
  id: string;
  name: string;
  slug: string;
  designation: string;
  qualification: string;
  biography: string | null;
  display_order: number;
  department: { id: string; name: string; slug: string } | null;
  photo: MediaRef;
};

export const getFaculty = cachedQuery(
  ["faculty", "list"],
  [CACHE_TAGS.faculty, CACHE_TAGS.departments],
  async () => {
    const { data, error } = await supabasePublic
      .from("faculty")
      .select(FACULTY_FIELDS)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true })
      .returns<FacultyRow[]>();

    if (error) return fallback("faculty.list", error, []);
    return data ?? [];
  },
);

export const getFacultyBySlug = cachedQuery(
  ["faculty", "detail"],
  [CACHE_TAGS.faculty],
  async (slug: string) => {
    const { data, error } = await supabasePublic
      .from("faculty")
      .select(FACULTY_FIELDS)
      .eq("slug", slug)
      .maybeSingle();

    if (error) return fallback("faculty.detail", error, null);
    return data;
  },
);

export const getDepartments = cachedQuery(
  ["departments", "list"],
  [CACHE_TAGS.departments],
  async () => {
    const { data, error } = await supabasePublic
      .from("departments")
      .select("id, name, slug, description, head_name, icon, display_order")
      .order("display_order", { ascending: true });

    if (error) return fallback("departments.list", error, []);
    return data ?? [];
  },
);

export type FacultyMember = Awaited<ReturnType<typeof getFaculty>>[number];
export type DepartmentRecord = Awaited<ReturnType<typeof getDepartments>>[number];
