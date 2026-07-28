import type { UserRole } from "@/types/database";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  /** Roles allowed to see this item. Omitted means all staff. */
  roles?: UserRole[];
  /**
   * Whether the screen actually exists yet.
   *
   * Navigation must never advertise a route that has not been built — a link
   * that 404s reads as a broken product, not an unfinished one. Items marked
   * `false` render as disabled with a "Soon" tag until their phase lands.
   */
  ready?: boolean;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

/**
 * Admin navigation.
 *
 * Grouped by what a committee member is trying to do, not by database table —
 * "Manage the homepage" rather than "hero_slides".
 */
export const adminNav: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: "layout-dashboard",
        ready: true,
      },
    ],
  },
  {
    title: "Homepage",
    items: [
      { label: "Hero", href: "/admin/hero", icon: "image", ready: true },
      { label: "Statistics", href: "/admin/statistics", icon: "bar-chart-3", ready: true },
      { label: "Sections", href: "/admin/sections", icon: "layout-template", ready: true },
    ],
  },
  {
    title: "Institution",
    items: [
      { label: "Achievements", href: "/admin/achievements", icon: "award", ready: true },
      { label: "Departments", href: "/admin/departments", icon: "library", ready: true },
      { label: "Faculty", href: "/admin/faculty", icon: "users", ready: true },
      { label: "Facilities", href: "/admin/facilities", icon: "building-2", ready: true },
      { label: "Student Skills", href: "/admin/skills", icon: "sparkles", ready: true },
      { label: "Timeline", href: "/admin/timeline", icon: "milestone", ready: true },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "News",
        href: "/admin/news",
        icon: "newspaper",
        ready: true,
      },
      { label: "Gallery", href: "/admin/gallery", icon: "images", ready: true },
      {
        label: "Media Library",
        href: "/admin/media",
        icon: "folder-open",
        ready: true,
      },
    ],
  },
  {
    title: "Sponsorship",
    items: [
      {
        label: "Plans",
        href: "/admin/sponsorship",
        icon: "heart-handshake",
        ready: true,
      },
      {
        label: "Donation Method",
        href: "/admin/sponsorship/donation-method",
        icon: "qr-code",
        ready: true,
      },
      {
        label: "Rice Donation",
        href: "/admin/sponsorship/rice",
        icon: "wheat",
        ready: true,
      },
      {
        label: "Donation Enquiries",
        href: "/admin/sponsorship/intents",
        icon: "inbox",
        ready: true,
      },
    ],
  },
  {
    title: "Communication",
    items: [{ label: "Messages", href: "/admin/messages", icon: "mail" }],
  },
  {
    title: "Administration",
    items: [
      { label: "Contact Details", href: "/admin/contact", icon: "map-pin" },
      {
        label: "Site Settings",
        href: "/admin/settings",
        icon: "settings",
        roles: ["super_admin"],
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: "shield",
        roles: ["super_admin"],
      },
      {
        label: "Activity Log",
        href: "/admin/activity",
        icon: "history",
        roles: ["super_admin"],
      },
    ],
  },
];

export function visibleNav(role: UserRole): AdminNavGroup[] {
  return adminNav
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || item.roles.includes(role),
      ),
    }))
    .filter((group) => group.items.length > 0);
}
