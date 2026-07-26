import type { DonationConfig } from "@/types/database";

/**
 * Builds a UPI deep link.
 *
 * Two platform limitations worth knowing, neither fixable in code:
 *   1. `upi://` behaves inconsistently on iOS across UPI apps.
 *   2. For personal (P2P) accounts, several apps now ignore the prefilled
 *      amount for fraud-prevention reasons and ask the payer to type it.
 *
 * The donation modal must therefore always show the QR code and a copyable UPI
 * ID alongside this button — never behind it — and the button must promise only
 * to open the app, not to complete a payment.
 */
export function buildUpiDeepLink(
  config: DonationConfig["upi_deeplink"],
  options?: { amount?: number; note?: string },
) {
  const params = new URLSearchParams({
    pa: config.upi_id,
    pn: config.payee_name,
    cu: "INR",
  });

  const amount = options?.amount ?? config.default_amount;
  if (amount && amount > 0) {
    params.set("am", amount.toFixed(2));
  }

  const note = options?.note ?? config.note;
  if (note) {
    params.set("tn", note.slice(0, 50));
  }

  return `upi://pay?${params.toString()}`;
}

/** WhatsApp click-to-chat link with an optional prefilled message. */
export function buildWhatsAppLink(phoneE164: string, message?: string) {
  const digits = phoneE164.replace(/\D/g, "");
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}

/** Formats an amount the way Indian donors expect to read it. */
export function formatRupees(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
