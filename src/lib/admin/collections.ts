/**
 * Declarative content collections.
 *
 * The remaining admin screens are the same screen: a list of ordered,
 * publishable rows and a form of plain fields. Writing eight copies would mean
 * eight places to fix every future bug, so they are described here instead and
 * rendered by one list page and one form.
 *
 * Adding a content type later is a config entry, not a new screen — which is
 * also what keeps the admin visually consistent as it grows.
 */

import type { Database } from "@/types/database";

/** Any table in the public schema — keeps .from() type-safe. */
export type TableName = keyof Database["public"]["Tables"];

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "icon"
  | "media"
  | "boolean"
  | "select";

export type CollectionField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  rows?: number;
  /** For `select`. A string means "load options from this table". */
  options?: { value: string; label: string }[] | { fromTable: TableName };
  /** Half-width on wide screens. */
  half?: boolean;
};

export type CollectionConfig = {
  slug: string;
  table: TableName;
  title: string;
  description: string;
  /** Column shown in the first table cell. */
  primaryField: string;
  /** Extra columns in the list view. */
  listFields?: { name: string; label: string }[];
  fields: CollectionField[];
  /** Generate a unique `slug` column from this field on create. */
  slugFrom?: string;
  /** Public page purged after a write. */
  revalidate: string[];
  singularLabel: string;
};

const STATUS_HELP = "Drafts are hidden from the website.";

export const COLLECTIONS: Record<string, CollectionConfig> = {
  hero: {
    slug: "hero",
    table: "hero_slides",
    title: "Hero",
    description:
      "The opening panel of the homepage. Keep the heading short — it is set at display size.",
    primaryField: "heading",
    singularLabel: "slide",
    revalidate: ["/"],
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text", half: true },
      { name: "heading", label: "Heading", type: "text", required: true },
      { name: "subheading", label: "Subheading", type: "textarea", rows: 2 },
      { name: "media_id", label: "Background image", type: "media" },
      { name: "cta_label", label: "Button label", type: "text", half: true },
      { name: "cta_href", label: "Button link", type: "text", half: true },
      {
        name: "secondary_cta_label",
        label: "Second button label",
        type: "text",
        half: true,
      },
      {
        name: "secondary_cta_href",
        label: "Second button link",
        type: "text",
        half: true,
      },
    ],
  },

  statistics: {
    slug: "statistics",
    table: "statistics",
    title: "Statistics",
    description:
      "The figures shown across the site. Enter the number only — the suffix is separate.",
    primaryField: "label",
    listFields: [{ name: "value", label: "Value" }],
    singularLabel: "statistic",
    revalidate: ["/", "/about", "/campus-life"],
    fields: [
      { name: "label", label: "Label", type: "text", required: true },
      { name: "value", label: "Value", type: "number", required: true, half: true },
      {
        name: "suffix",
        label: "Suffix",
        type: "text",
        half: true,
        placeholder: "+ or %",
      },
      {
        name: "number_format",
        label: "Number format",
        type: "select",
        half: true,
        options: [
          { value: "grouped", label: "Grouped — 2,015" },
          { value: "plain", label: "Plain — 2015 (years)" },
        ],
      },
      { name: "icon", label: "Icon", type: "icon", half: true },
    ],
  },

  sections: {
    slug: "sections",
    table: "page_sections",
    title: "Page Sections",
    description:
      "Editable blocks of copy on the public pages. The layout is fixed; only the words change.",
    primaryField: "title",
    listFields: [
      { name: "page_slug", label: "Page" },
      { name: "section_key", label: "Block" },
    ],
    singularLabel: "section",
    revalidate: ["/", "/about", "/legacy", "/academics", "/campus-life"],
    fields: [
      {
        name: "page_slug",
        label: "Page",
        type: "select",
        required: true,
        half: true,
        options: [
          { value: "home", label: "Home" },
          { value: "about", label: "About" },
          { value: "legacy", label: "Legacy" },
          { value: "academics", label: "Academics" },
          { value: "campus-life", label: "Campus Life" },
        ],
      },
      {
        name: "section_key",
        label: "Block key",
        type: "text",
        required: true,
        half: true,
        help: "A short identifier, e.g. intro or vision.",
      },
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "body", label: "Body", type: "textarea", rows: 6 },
      { name: "title_ml", label: "Title (Malayalam)", type: "text" },
      { name: "body_ml", label: "Body (Malayalam)", type: "textarea", rows: 4 },
      { name: "media_id", label: "Image", type: "media" },
    ],
  },

  achievements: {
    slug: "achievements",
    table: "achievements",
    title: "Achievements",
    description:
      "Recognition, academic distinction and milestones. Featured entries also appear on the homepage.",
    primaryField: "title",
    listFields: [{ name: "year", label: "Year" }],
    singularLabel: "achievement",
    revalidate: ["/", "/achievements"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", rows: 3 },
      {
        name: "category_id",
        label: "Category",
        type: "select",
        half: true,
        options: { fromTable: "achievement_categories" },
      },
      { name: "year", label: "Year", type: "number", half: true },
      { name: "icon", label: "Icon", type: "icon", half: true },
      {
        name: "is_featured",
        label: "Show on the homepage",
        type: "boolean",
        half: true,
      },
      { name: "media_id", label: "Image", type: "media" },
    ],
  },

  departments: {
    slug: "departments",
    table: "departments",
    title: "Departments",
    description:
      "Areas of study. These also group the Faculty page, so renaming one updates it there.",
    primaryField: "name",
    singularLabel: "department",
    slugFrom: "name",
    revalidate: ["/academics", "/faculty"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", rows: 3 },
      { name: "head_name", label: "Head of department", type: "text", half: true },
      { name: "icon", label: "Icon", type: "icon", half: true },
    ],
  },

  facilities: {
    slug: "facilities",
    table: "facilities",
    title: "Facilities",
    description: "Campus facilities shown on Campus Life and the homepage.",
    primaryField: "name",
    singularLabel: "facility",
    revalidate: ["/", "/campus-life"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", rows: 3 },
      { name: "icon", label: "Icon", type: "icon", half: true },
      { name: "media_id", label: "Image", type: "media" },
    ],
  },

  skills: {
    slug: "skills",
    table: "skills",
    title: "Student Skills",
    description:
      "Design, media, technology and languages — the practical training shown under Student Excellence.",
    primaryField: "title",
    singularLabel: "skill",
    revalidate: ["/", "/academics", "/campus-life"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", rows: 3 },
      { name: "icon", label: "Icon", type: "icon", half: true },
      { name: "media_id", label: "Image", type: "media" },
    ],
  },

  timeline: {
    slug: "timeline",
    table: "timeline_events",
    title: "Timeline",
    description: "The institution's history, shown on the Legacy page.",
    primaryField: "title",
    listFields: [{ name: "year", label: "Year" }],
    singularLabel: "event",
    revalidate: ["/legacy"],
    fields: [
      { name: "year", label: "Year", type: "number", half: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", rows: 4 },
      { name: "title_ml", label: "Title (Malayalam)", type: "text" },
      {
        name: "description_ml",
        label: "Description (Malayalam)",
        type: "textarea",
        rows: 3,
      },
      { name: "media_id", label: "Image", type: "media" },
    ],
  },
};

export function getCollection(slug: string): CollectionConfig | null {
  return COLLECTIONS[slug] ?? null;
}

export const STATUS_FIELD_HELP = STATUS_HELP;
