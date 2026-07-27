import { Geist, Inter, Manjari } from "next/font/google";

/**
 * Type system.
 *
 * Geist for headings, Inter for body — the pairing Vercel, Linear and Stripe
 * converged on independently. Both are neutral grotesques, so the hierarchy
 * comes from size, weight and tracking rather than from a change of voice.
 * That restraint is what reads as editorial; a decorative display serif reads
 * as craft, not institution.
 */
export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/**
 * Malayalam face, applied via `:lang(ml)`.
 * `preload: false` keeps the Malayalam subset off English pages entirely.
 */
export const manjari = Manjari({
  subsets: ["malayalam"],
  variable: "--font-malayalam",
  display: "swap",
  weight: ["400", "700"],
  preload: false,
});

export const fontVariables = `${geist.variable} ${inter.variable} ${manjari.variable}`;
