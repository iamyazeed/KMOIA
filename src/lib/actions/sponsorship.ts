"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createClient } from "@/lib/supabase/server";
import { donationMethodSchema } from "@/lib/validation/donation";

export type SponsorState = { error?: string; success?: string } | undefined;

/* -------------------------------------------------------------------------
   Donation method
   ------------------------------------------------------------------------- */

/**
 * Saves and activates a donation method.
 *
 * The highest-risk edit in the system: a wrong UPI ID silently redirects
 * donations to a stranger. Three protections apply — the zod schema here, the
 * per-type CHECK constraint in the database, and the audit log entry written
 * by trigger. Activation deactivates the previous method first, because a
 * partial unique index permits only one active row.
 */
export async function saveDonationMethod(
  _prev: SponsorState,
  formData: FormData,
): Promise<SponsorState> {
  await requireAdmin();

  const type = String(formData.get("type") ?? "");
  const raw = String(formData.get("config") ?? "{}");

  let config: unknown;
  try {
    config = JSON.parse(raw);
  } catch {
    return { error: "The configuration could not be read. Please try again." };
  }

  const parsed = donationMethodSchema.safeParse({
    type,
    label: formData.get("label"),
    display_note: formData.get("display_note") || null,
    config,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path.at(-1);
    return { error: `${field ? `${String(field)}: ` : ""}${issue?.message}` };
  }

  const supabase = await createClient();

  // Exactly one method may be active; clear the rest before inserting.
  const { error: clearError } = await supabase
    .from("donation_methods")
    .update({ is_active: false })
    .eq("is_active", true);

  if (clearError) return { error: clearError.message };

  const { error } = await supabase.from("donation_methods").insert({
    type: parsed.data.type,
    label: parsed.data.label,
    display_note: parsed.data.display_note ?? null,
    config: parsed.data.config,
    is_active: true,
  });

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.donationMethod);
  return { success: "Donation method saved and made active." };
}

export async function activateDonationMethod(
  id: string,
): Promise<SponsorState> {
  await requireAdmin();
  const supabase = await createClient();

  const { error: clearError } = await supabase
    .from("donation_methods")
    .update({ is_active: false })
    .eq("is_active", true);

  if (clearError) return { error: clearError.message };

  const { error } = await supabase
    .from("donation_methods")
    .update({ is_active: true })
    .eq("id", id);

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.donationMethod);
  return { success: "This method is now active." };
}

export async function deleteDonationMethod(id: string): Promise<SponsorState> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: method } = await supabase
    .from("donation_methods")
    .select("is_active")
    .eq("id", id)
    .maybeSingle();

  // Refuse to leave the site with no way to donate.
  if (method?.is_active) {
    return {
      error:
        "This is the active method. Activate another one before deleting it.",
    };
  }

  const { error } = await supabase.from("donation_methods").delete().eq("id", id);
  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.donationMethod);
  return { success: "Method deleted." };
}

/* -------------------------------------------------------------------------
   Rice donation (singleton)
   ------------------------------------------------------------------------- */

const riceSchema = z.object({
  title: z.string().trim().min(2).max(80),
  quantity_kg: z.coerce.number().int().positive().max(10000),
  description: z.string().trim().max(600).optional().or(z.literal("")),
  is_active: z.coerce.boolean(),
});

export async function saveRiceDonation(
  _prev: SponsorState,
  formData: FormData,
): Promise<SponsorState> {
  await requireAdmin();

  const parsed = riceSchema.safeParse({
    title: formData.get("title"),
    quantity_kg: formData.get("quantity_kg"),
    description: formData.get("description"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("rice_donation").upsert({
    id: true,
    title: parsed.data.title,
    quantity_kg: parsed.data.quantity_kg,
    description: parsed.data.description || null,
    is_active: parsed.data.is_active,
  });

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.rice);
  return { success: "Rice donation updated." };
}

/* -------------------------------------------------------------------------
   Sponsorship plans
   ------------------------------------------------------------------------- */

const planSchema = z.object({
  name: z.string().trim().min(2).max(80),
  amount: z.coerce.number().positive().max(10_000_000),
  period: z.enum(["monthly", "annual", "one_time"]),
  description: z.string().trim().max(600).optional().or(z.literal("")),
  display_order: z.coerce.number().int().min(0).max(999).default(0),
  status: z.enum(["draft", "published"]),
});

export async function savePlan(
  id: string | null,
  _prev: SponsorState,
  formData: FormData,
): Promise<SponsorState> {
  await requireAdmin();

  const parsed = planSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    period: formData.get("period"),
    description: formData.get("description"),
    display_order: formData.get("display_order") || 0,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const supabase = await createClient();
  const values = {
    name: parsed.data.name,
    amount: parsed.data.amount,
    period: parsed.data.period,
    description: parsed.data.description || null,
    display_order: parsed.data.display_order,
    status: parsed.data.status,
  };

  const { error } = id
    ? await supabase.from("sponsorship_plans").update(values).eq("id", id)
    : await supabase.from("sponsorship_plans").insert(values);

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.sponsorship);
  return { success: id ? "Plan updated." : "Plan added." };
}

export async function deletePlan(id: string): Promise<SponsorState> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("sponsorship_plans")
    .update({ deleted_at: new Date().toISOString(), status: "draft" })
    .eq("id", id);

  if (error) return { error: error.message };

  updateTag(CACHE_TAGS.sponsorship);
  return { success: "Plan removed." };
}

/* -------------------------------------------------------------------------
   Donation enquiries
   ------------------------------------------------------------------------- */

export async function setIntentStatus(
  id: string,
  status: "pending" | "confirmed" | "rejected",
): Promise<SponsorState> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("donation_intents")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  return { success: "Enquiry updated." };
}
