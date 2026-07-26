/**
 * Cache tags — the contract between reads and writes.
 *
 * Every public query is tagged; every admin mutation revalidates the matching
 * tag. This is what lets the site be statically rendered yet update within a
 * second of the committee pressing Publish, with no rebuild.
 */
export const CACHE_TAGS = {
  settings: "settings",
  contact: "contact",
  hero: "hero",
  pageSections: "page-sections",
  statistics: "statistics",
  ambitions: "ambitions",
  achievements: "achievements",
  departments: "departments",
  faculty: "faculty",
  facilities: "facilities",
  skills: "skills",
  timeline: "timeline",
  news: "news",
  gallery: "gallery",
  sponsorship: "sponsorship",
  donationMethod: "donation-method",
  rice: "rice",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/** Safety-net revalidation window. Tag revalidation is the primary mechanism. */
export const DEFAULT_REVALIDATE = 3600;
