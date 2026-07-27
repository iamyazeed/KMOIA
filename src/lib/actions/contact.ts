"use server";

import { z } from "zod";

import { supabasePublic } from "@/lib/supabase/public";

const contactSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(120),
    email: z.email("Enter a valid email address").optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s-]{7,19}$/, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    subject: z.string().trim().max(160).optional(),
    message: z.string().trim().min(10, "Please write a short message").max(4000),
    // Honeypot — bots fill every field they can find. A human never sees this.
    website: z.string().max(0).optional(),
  })
  .refine((data) => Boolean(data.email || data.phone), {
    message: "Please give us an email address or a phone number",
    path: ["email"],
  });

export type ContactState = { error?: string; success?: string } | undefined;

export async function submitContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  // Silently accept honeypot hits: telling a bot it failed just teaches it.
  if (parsed.data.website) {
    return { success: "Thank you — your message has been sent." };
  }

  const { error } = await supabasePublic.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });

  if (error) {
    console.error("[contact.submit]", error);
    return {
      error:
        "Your message could not be sent just now. Please try again, or call the academy directly.",
    };
  }

  return { success: "Thank you — your message has been sent." };
}
