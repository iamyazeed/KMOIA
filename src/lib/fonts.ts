import { Fraunces, Inter, Manjari } from "next/font/google";

/**
 * Display serif — the primary signal of an academic institution rather than a
 * commercial site. Used for headings only.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600"],
});

/** Body sans — humanist geometric, high legibility at small sizes. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Malayalam face, applied via `:lang(ml)`.
 *
 * `preload: false` is deliberate: the Malayalam subset must never be
 * downloaded by visitors reading English pages. It loads only when a
 * Malayalam news article actually renders.
 */
export const manjari = Manjari({
  subsets: ["malayalam"],
  variable: "--font-manjari",
  display: "swap",
  weight: ["400", "700"],
  preload: false,
});

export const fontVariables = `${fraunces.variable} ${inter.variable} ${manjari.variable}`;
