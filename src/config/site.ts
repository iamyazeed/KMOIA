/**
 * Static site configuration.
 *
 * Only structural constants live here — navigation shape, canonical URL,
 * institutional facts that are part of the site's identity rather than its
 * content. Everything editable by the committee comes from Supabase.
 */

export const siteConfig = {
  name: "KMO Islamic Academy",
  shortName: "KMOIA",
  location: "Koduvally",
  tagline: "Teaching · Nurturing · Islamic Propagation",
  description:
    "KMO Islamic Academy Koduvally — a residential Islamic academy affiliated to Darul Huda Islamic University, managed by KMO Koduvally Orphanage. Education, accommodation and food provided free of cost to 240+ students.",
  url: "https://kmoia.in",
  established: "2015-08-01",
  affiliation: {
    name: "Darul Huda Islamic University",
    url: "https://dhiu.in",
  },
  managedBy: "KMO Koduvally Orphanage",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

/** Primary navigation — capped at seven items by design. */
export const mainNav: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Academics", href: "/academics" },
  { label: "Faculty", href: "/faculty" },
  { label: "Campus Life", href: "/campus-life" },
  { label: "Achievements", href: "/achievements" },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/news" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Institution",
    items: [
      { label: "About", href: "/about" },
      { label: "Legacy", href: "/legacy" },
      { label: "Achievements", href: "/achievements" },
    ],
  },
  {
    title: "Academic",
    items: [
      { label: "Academics", href: "/academics" },
      { label: "Faculty", href: "/faculty" },
      { label: "Campus Life", href: "/campus-life" },
    ],
  },
  {
    title: "Engage",
    items: [
      { label: "Gallery", href: "/gallery" },
      { label: "News", href: "/news" },
      { label: "Sponsor a Student", href: "/sponsor" },
      { label: "Contact", href: "/contact" },
    ],
  },
];
