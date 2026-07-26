import "server-only";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { cachedQuery, fallback, MEDIA_FIELDS } from "@/lib/queries/utils";
import { supabasePublic } from "@/lib/supabase/public";
import type { DonationMethod } from "@/types/database";

export const getSponsorshipPlans = cachedQuery(
  ["sponsorship", "plans"],
  [CACHE_TAGS.sponsorship],
  async () => {
    const { data, error } = await supabasePublic
      .from("sponsorship_plans")
      .select(
        `id, name, amount, currency, period, description, icon, benefits,
         is_featured, display_order,
         illustration:media!sponsorship_plans_illustration_media_id_fkey ( ${MEDIA_FIELDS} )`,
      )
      .order("display_order", { ascending: true });

    if (error) return fallback("sponsorship.plans", error, []);
    return data ?? [];
  },
);

export const getSponsorshipProvides = cachedQuery(
  ["sponsorship", "provides"],
  [CACHE_TAGS.sponsorship],
  async () => {
    const { data, error } = await supabasePublic
      .from("sponsorship_provides")
      .select("id, label, icon, display_order")
      .order("display_order", { ascending: true });

    if (error) return fallback("sponsorship.provides", error, []);
    return data ?? [];
  },
);

export const getRiceDonation = cachedQuery(
  ["sponsorship", "rice"],
  [CACHE_TAGS.rice],
  async () => {
    const { data, error } = await supabasePublic
      .from("rice_donation")
      .select(
        `title, quantity_kg, description, is_active,
         illustration:media!rice_donation_illustration_media_id_fkey ( ${MEDIA_FIELDS} )`,
      )
      .maybeSingle();

    if (error) return fallback("sponsorship.rice", error, null);
    return data;
  },
);

/**
 * The single active donation method.
 *
 * Returns `null` when no method is configured — the donation modal must handle
 * that case gracefully rather than rendering an empty QR frame. RLS exposes
 * only the active row, so inactive configurations (old UPI IDs, unused bank
 * details) are never sent to a visitor's browser.
 */
export const getActiveDonationMethod = cachedQuery(
  ["sponsorship", "donation-method"],
  [CACHE_TAGS.donationMethod],
  async () => {
    const { data, error } = await supabasePublic
      .from("donation_methods")
      .select("id, type, label, config, display_note, is_active")
      .eq("is_active", true)
      .maybeSingle();

    if (error) return fallback("sponsorship.donationMethod", error, null);
    return (data as DonationMethod | null) ?? null;
  },
);

export type SponsorshipPlanRecord = Awaited<
  ReturnType<typeof getSponsorshipPlans>
>[number];
