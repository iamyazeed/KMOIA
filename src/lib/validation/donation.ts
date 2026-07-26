import { z } from "zod";

/**
 * Donation method validation.
 *
 * Mirrors the `donation_config_valid` check constraint in migration 0005. The
 * database is the last line of defence; this schema is what gives the admin a
 * useful error message instead of a Postgres one.
 */

const upiId = z
  .string()
  .trim()
  .regex(/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/, "Enter a valid UPI ID, e.g. name@bank");

export const donationConfigSchemas = {
  upi_deeplink: z.object({
    upi_id: upiId,
    payee_name: z.string().trim().min(2).max(120),
    bank_name: z.string().trim().max(120).optional(),
    qr_media_id: z.uuid("Upload a QR code image"),
    default_amount: z.number().positive().optional(),
    note: z.string().trim().max(120).optional(),
  }),

  qr_only: z.object({
    qr_media_id: z.uuid("Upload a QR code image"),
    account_holder_name: z.string().trim().min(2).max(120),
    bank_name: z.string().trim().max(120).optional(),
    upi_id: upiId.optional(),
  }),

  whatsapp: z.object({
    phone_e164: z
      .string()
      .trim()
      .regex(/^\+[1-9]\d{7,14}$/, "Use international format, e.g. +919876543210"),
    prefilled_message_template: z.string().trim().max(500).optional(),
  }),

  external_url: z.object({
    url: z.url("Enter a full URL including https://"),
    button_label: z.string().trim().max(60).optional(),
    opens_in_new_tab: z.boolean().optional(),
  }),

  bank_transfer: z.object({
    account_holder_name: z.string().trim().min(2).max(120),
    account_number: z.string().trim().min(6).max(30),
    ifsc: z
      .string()
      .trim()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code"),
    bank_name: z.string().trim().min(2).max(120),
    branch: z.string().trim().max(120).optional(),
    qr_media_id: z.uuid().optional(),
  }),
} as const;

export const donationMethodSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("upi_deeplink"),
    label: z.string().trim().min(2).max(80),
    display_note: z.string().trim().max(200).nullish(),
    config: donationConfigSchemas.upi_deeplink,
  }),
  z.object({
    type: z.literal("qr_only"),
    label: z.string().trim().min(2).max(80),
    display_note: z.string().trim().max(200).nullish(),
    config: donationConfigSchemas.qr_only,
  }),
  z.object({
    type: z.literal("whatsapp"),
    label: z.string().trim().min(2).max(80),
    display_note: z.string().trim().max(200).nullish(),
    config: donationConfigSchemas.whatsapp,
  }),
  z.object({
    type: z.literal("external_url"),
    label: z.string().trim().min(2).max(80),
    display_note: z.string().trim().max(200).nullish(),
    config: donationConfigSchemas.external_url,
  }),
  z.object({
    type: z.literal("bank_transfer"),
    label: z.string().trim().min(2).max(80),
    display_note: z.string().trim().max(200).nullish(),
    config: donationConfigSchemas.bank_transfer,
  }),
]);

export type DonationMethodInput = z.infer<typeof donationMethodSchema>;

/** Optional "I've sent it" capture. Never handles money. */
export const donationIntentSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(120),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s-]{7,19}$/, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    email: z.email("Enter a valid email address").optional().or(z.literal("")),
    amount: z.coerce.number().positive().optional(),
    type: z.enum(["monthly", "annual", "rice", "custom"]).default("custom"),
    plan_id: z.uuid().optional(),
    message: z.string().trim().max(1000).optional(),
    // Honeypot: must stay empty. Bots fill every field they find.
    website: z.string().max(0).optional(),
  })
  .refine((data) => Boolean(data.phone || data.email), {
    message: "Please provide a phone number or an email address",
    path: ["phone"],
  });

export type DonationIntentInput = z.infer<typeof donationIntentSchema>;
