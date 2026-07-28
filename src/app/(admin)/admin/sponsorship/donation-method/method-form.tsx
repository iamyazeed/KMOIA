"use client";

import { Eye } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";

import { FormMessage, SubmitButton } from "@/components/admin/ui";
import { DonationModal } from "@/components/sponsor/donation-modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import { saveDonationMethod, type SponsorState } from "@/lib/actions/sponsorship";
import { cn } from "@/lib/utils/cn";
import type { DonationMethod, DonationMethodType } from "@/types/database";

type MediaOption = { id: string; url: string; alt: string };

const TYPES: { value: DonationMethodType; label: string; hint: string }[] = [
  {
    value: "upi_deeplink",
    label: "UPI deep link",
    hint: "QR code, copyable UPI ID, and an “Open in UPI app” button on mobile.",
  },
  {
    value: "qr_only",
    label: "QR code only",
    hint: "Just the QR and the account name. No app hand-off.",
  },
  {
    value: "bank_transfer",
    label: "Bank transfer",
    hint: "Account number, IFSC and bank details with copy buttons.",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    hint: "Sends the donor to a WhatsApp chat with the committee.",
  },
  {
    value: "external_url",
    label: "External page",
    hint: "Sends the donor to a page the academy maintains elsewhere.",
  },
];

/**
 * Donation method editor.
 *
 * The live preview beside the form is the point of this screen: whoever
 * changes the QR or UPI ID sees exactly what a donor will see before saving.
 * A wrong value here does not throw an error — it quietly sends money to the
 * wrong account — so the confirmation step is deliberate friction.
 */
export function MethodForm({
  current,
  qrUrl,
  media,
}: {
  current: DonationMethod | null;
  qrUrl: string | null;
  media: MediaOption[];
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<SponsorState, FormData>(
    saveDonationMethod,
    undefined,
  );

  const [type, setType] = useState<DonationMethodType>(
    current?.type ?? "upi_deeplink",
  );
  const [label, setLabel] = useState(current?.label ?? "Primary UPI");
  const [note, setNote] = useState(current?.display_note ?? "");
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const config = (current?.config ?? {}) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(config).map(([k, v]) => [k, String(v ?? "")]),
    );
  });
  const [picking, setPicking] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const set = (key: string, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state?.success, router]);

  const selectedQr = media.find((m) => m.id === fields.qr_media_id) ?? null;
  const previewQrUrl = selectedQr?.url ?? qrUrl;

  // Build the object the server action will validate, so the preview shows
  // the pending edit rather than the saved state.
  const config = useMemo(() => {
    const clean = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== ""),
    );
    if (clean.default_amount) {
      clean.default_amount = String(Number(clean.default_amount));
    }
    return clean;
  }, [fields]);

  const previewMethod = {
    id: "preview",
    type,
    label,
    display_note: note || null,
    config,
    is_active: true,
  } as unknown as DonationMethod;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form action={formAction} className="flex flex-col gap-7">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="config" value={JSON.stringify(config)} />

        <div>
          <Label htmlFor="method-type">Method</Label>
          <div className="flex flex-col gap-2">
            {TYPES.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-colors",
                  type === option.value
                    ? "border-accent bg-accent-soft"
                    : "border-line hover:border-line-strong",
                )}
              >
                <input
                  type="radio"
                  name="method-type-choice"
                  className="mt-1"
                  checked={type === option.value}
                  onChange={() => setType(option.value)}
                />
                <span>
                  <span className="block text-sm font-medium">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {option.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="label">Internal name</Label>
          <Input
            id="label"
            name="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Primary UPI — Federal Bank"
          />
          <p className="mt-2 text-xs text-muted">
            Only shown here, never to donors.
          </p>
        </div>

        {/* Per-type fields */}
        {(type === "upi_deeplink" || type === "qr_only") && (
          <QrField
            selected={selectedQr}
            onPick={() => setPicking(true)}
            onClear={() => set("qr_media_id", "")}
          />
        )}

        {type === "upi_deeplink" && (
          <>
            <Field
              label="UPI ID"
              value={fields.upi_id ?? ""}
              onChange={(v) => set("upi_id", v)}
              placeholder="kmoia@federal"
              mono
            />
            <Field
              label="Payee name"
              value={fields.payee_name ?? ""}
              onChange={(v) => set("payee_name", v)}
              placeholder="KMO Koduvally Orphanage"
            />
            <Field
              label="Bank name (optional)"
              value={fields.bank_name ?? ""}
              onChange={(v) => set("bank_name", v)}
            />
          </>
        )}

        {type === "qr_only" && (
          <>
            <Field
              label="Account holder name"
              value={fields.account_holder_name ?? ""}
              onChange={(v) => set("account_holder_name", v)}
            />
            <Field
              label="UPI ID (optional)"
              value={fields.upi_id ?? ""}
              onChange={(v) => set("upi_id", v)}
              mono
            />
          </>
        )}

        {type === "bank_transfer" && (
          <>
            <Field
              label="Account holder name"
              value={fields.account_holder_name ?? ""}
              onChange={(v) => set("account_holder_name", v)}
            />
            <Field
              label="Account number"
              value={fields.account_number ?? ""}
              onChange={(v) => set("account_number", v)}
              mono
            />
            <Field
              label="IFSC"
              value={fields.ifsc ?? ""}
              onChange={(v) => set("ifsc", v.toUpperCase())}
              placeholder="FDRL0001234"
              mono
            />
            <Field
              label="Bank name"
              value={fields.bank_name ?? ""}
              onChange={(v) => set("bank_name", v)}
            />
            <Field
              label="Branch (optional)"
              value={fields.branch ?? ""}
              onChange={(v) => set("branch", v)}
            />
          </>
        )}

        {type === "whatsapp" && (
          <>
            <Field
              label="Phone number"
              value={fields.phone_e164 ?? ""}
              onChange={(v) => set("phone_e164", v)}
              placeholder="+919876543210"
              mono
            />
            <div>
              <Label htmlFor="wa-msg">Prefilled message (optional)</Label>
              <Textarea
                id="wa-msg"
                rows={3}
                value={fields.prefilled_message_template ?? ""}
                onChange={(e) =>
                  set("prefilled_message_template", e.target.value)
                }
              />
            </div>
          </>
        )}

        {type === "external_url" && (
          <>
            <Field
              label="URL"
              value={fields.url ?? ""}
              onChange={(v) => set("url", v)}
              placeholder="https://…"
            />
            <Field
              label="Button label (optional)"
              value={fields.button_label ?? ""}
              onChange={(v) => set("button_label", v)}
            />
          </>
        )}

        <div>
          <Label htmlFor="display_note">Note to donors (optional)</Label>
          <Textarea
            id="display_note"
            name="display_note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Please mention your name in the payment remarks."
          />
        </div>

        <FormMessage state={state} />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPreviewing(true)}
          >
            <Eye />
            Preview as donor
          </Button>
          <Button type="button" onClick={() => setConfirming(true)}>
            Save and activate
          </Button>
        </div>

        {/* Confirmation is deliberate: a wrong UPI ID fails silently. */}
        <Modal open={confirming} onOpenChange={setConfirming}>
          <ModalContent
            title="Make this the active donation method?"
            description="Every Sponsor button on the website will immediately use these details. Check the UPI ID and QR code carefully — a mistake here sends donations to the wrong account without any error."
            footer={
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </Button>
                <SubmitButton pendingLabel="Saving…">
                  Yes, activate
                </SubmitButton>
              </>
            }
          >
            <dl className="divide-y divide-line border-y border-line text-sm">
              {Object.entries(config).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-faint">{key.replace(/_/g, " ")}</dt>
                  <dd className="truncate font-mono text-xs">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </ModalContent>
        </Modal>
      </form>

      {/* Live preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <p className="text-eyebrow uppercase text-faint">Donor preview</p>
        <p className="mt-3 text-sm text-muted">
          This is the sheet a visitor sees after pressing Sponsor. Open it to
          check the QR scans and the details read correctly.
        </p>
        <div className="mt-6 rounded-lg border border-line bg-subtle p-6">
          {previewQrUrl && (type === "upi_deeplink" || type === "qr_only") ? (
            <div className="mx-auto w-fit rounded-lg border border-line bg-white p-4">
              <Image
                src={previewQrUrl}
                alt="QR code preview"
                width={180}
                height={180}
                unoptimized
                className="size-[180px] object-contain"
              />
            </div>
          ) : (
            <p className="text-center text-sm text-muted">
              No QR selected for this method type.
            </p>
          )}
          <Button
            type="button"
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => setPreviewing(true)}
          >
            Open full preview
          </Button>
        </div>
      </div>

      <DonationModal
        method={previewMethod}
        qrUrl={previewQrUrl}
        amount={3000}
        context="Preview — Monthly sponsorship"
        open={previewing}
        onOpenChange={setPreviewing}
      />

      <Modal open={picking} onOpenChange={setPicking}>
        <ModalContent
          title="Choose the QR code"
          description="Upload the QR under Media Library first, then select it here."
          size="lg"
        >
          {media.length === 0 ? (
            <p className="text-sm text-muted">
              No images yet. Upload the QR image in the Media Library.
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      set("qr_media_id", item.id);
                      setPicking(false);
                    }}
                    className={cn(
                      "relative block aspect-square w-full overflow-hidden rounded-md border bg-white transition-colors",
                      fields.qr_media_id === item.id
                        ? "border-accent ring-2 ring-accent"
                        : "border-line hover:border-line-strong",
                    )}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt}
                      fill
                      sizes="120px"
                      className="object-contain p-1"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={mono ? "font-mono" : undefined}
      />
    </div>
  );
}

function QrField({
  selected,
  onPick,
  onClear,
}: {
  selected: MediaOption | null;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div>
      <Label>QR code image</Label>
      <div className="flex items-center gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-md border border-line bg-white">
          {selected ? (
            <Image
              src={selected.url}
              alt={selected.alt}
              fill
              sizes="96px"
              className="object-contain p-1"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-faint">
              None
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onPick}>
            {selected ? "Change QR" : "Choose QR"}
          </Button>
          {selected ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
