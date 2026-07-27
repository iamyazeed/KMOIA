"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, Copy, Download, ExternalLink, Smartphone, X } from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { buildUpiDeepLink, buildWhatsAppLink, formatRupees } from "@/lib/utils/upi";
import type { DonationMethod } from "@/types/database";

/**
 * Donation sheet.
 *
 * Modelled on a banking confirmation screen rather than a marketing modal:
 * white surface, one column, monospaced identifiers, labelled rows with copy
 * affordances, and a single primary action. No gradients, no glass behind the
 * QR — a tinted or blurred backdrop measurably hurts scan reliability on
 * low-end camera apps, and this is the one element that must never fail.
 *
 * The five method types each get their own renderer, selected on `type`. Adding
 * a sixth is one enum value, one schema and one renderer — nothing else moves.
 */

type Props = {
  method: DonationMethod | null;
  amount?: number | null;
  context?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DonationModal({
  method,
  amount,
  context,
  open,
  onOpenChange,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[3px] data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl border border-line bg-paper shadow-lg focus:outline-none",
            "data-[state=open]:animate-modal-in data-[state=closed]:animate-fade-out",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div>
              <Dialog.Title className="font-display text-[1.125rem] font-medium tracking-[-0.02em]">
                {amount ? formatRupees(amount) : "Sponsor a student"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[0.875rem] text-muted">
                {context ?? "KMO Islamic Academy, Koduvally"}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close"
              className="-mr-2 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="px-6 py-6">
            {method ? (
              <MethodRenderer method={method} amount={amount} context={context} />
            ) : (
              <NotConfigured />
            )}
          </div>

          {method?.display_note ? (
            <p className="border-t border-line px-6 py-4 text-[0.8125rem] leading-relaxed text-muted">
              {method.display_note}
            </p>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MethodRenderer({
  method,
  amount,
  context,
}: {
  method: DonationMethod;
  amount?: number | null;
  context?: string;
}) {
  switch (method.type) {
    case "upi_deeplink": {
      const link = buildUpiDeepLink(method.config, {
        amount: amount ?? undefined,
        note: context,
      });
      return (
        <div className="flex flex-col gap-6">
          <QrPlate mediaId={method.config.qr_media_id} />
          <DetailRows
            rows={[
              { label: "UPI ID", value: method.config.upi_id, copyable: true },
              { label: "Account name", value: method.config.payee_name },
              ...(method.config.bank_name
                ? [{ label: "Bank", value: method.config.bank_name }]
                : []),
            ]}
          />
          {/* Shown alongside the QR, never instead of it: `upi://` is
              inconsistent on iOS, and several apps ignore a prefilled amount
              on personal accounts. The label promises only to open the app. */}
          <Button asChild size="lg" className="w-full sm:hidden">
            <a href={link}>
              <Smartphone />
              Open in UPI app
            </a>
          </Button>
        </div>
      );
    }

    case "qr_only":
      return (
        <div className="flex flex-col gap-6">
          <QrPlate mediaId={method.config.qr_media_id} />
          <DetailRows
            rows={[
              {
                label: "Account name",
                value: method.config.account_holder_name,
              },
              ...(method.config.upi_id
                ? [
                    {
                      label: "UPI ID",
                      value: method.config.upi_id,
                      copyable: true,
                    },
                  ]
                : []),
              ...(method.config.bank_name
                ? [{ label: "Bank", value: method.config.bank_name }]
                : []),
            ]}
          />
        </div>
      );

    case "bank_transfer":
      return (
        <div className="flex flex-col gap-6">
          <DetailRows
            rows={[
              {
                label: "Account name",
                value: method.config.account_holder_name,
              },
              {
                label: "Account number",
                value: method.config.account_number,
                copyable: true,
                mono: true,
              },
              {
                label: "IFSC",
                value: method.config.ifsc,
                copyable: true,
                mono: true,
              },
              { label: "Bank", value: method.config.bank_name },
              ...(method.config.branch
                ? [{ label: "Branch", value: method.config.branch }]
                : []),
            ]}
          />
        </div>
      );

    case "whatsapp":
      return (
        <div className="flex flex-col gap-6">
          <p className="text-[0.9375rem] leading-relaxed text-muted">
            Message the academy directly and the committee will share the
            current donation details with you.
          </p>
          <Button asChild size="lg" className="w-full">
            <a
              href={buildWhatsAppLink(
                method.config.phone_e164,
                method.config.prefilled_message_template,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Continue on WhatsApp
              <ExternalLink />
            </a>
          </Button>
        </div>
      );

    case "external_url":
      return (
        <div className="flex flex-col gap-6">
          <p className="text-[0.9375rem] leading-relaxed text-muted">
            Donations are handled on a page maintained by the academy.
          </p>
          <Button asChild size="lg" className="w-full">
            <a
              href={method.config.url}
              target={method.config.opens_in_new_tab === false ? undefined : "_blank"}
              rel="noopener noreferrer"
            >
              {method.config.button_label ?? "Continue"}
              <ExternalLink />
            </a>
          </Button>
        </div>
      );
  }
}

function QrPlate({ mediaId }: { mediaId: string }) {
  const src = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/qr-codes/${mediaId}`;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Solid white plate with a quiet zone. Never tinted, never blurred. */}
      <div className="rounded-lg border border-line bg-white p-4">
        <Image
          src={src}
          alt="Scan this QR code with any UPI app to donate"
          width={220}
          height={220}
          priority
          unoptimized
          className="size-[220px] object-contain"
        />
      </div>
      <a
        href={src}
        download
        className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted transition-colors hover:text-ink"
      >
        <Download className="size-3.5" aria-hidden />
        Download QR code
      </a>
    </div>
  );
}

type Row = {
  label: string;
  value: string;
  copyable?: boolean;
  mono?: boolean;
};

function DetailRows({ rows }: { rows: Row[] }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-4 py-3.5"
        >
          <dt className="text-[0.8125rem] text-faint">{row.label}</dt>
          <dd className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "truncate text-[0.9375rem]",
                row.mono && "font-mono tabular-nums tracking-tight",
              )}
            >
              {row.value}
            </span>
            {row.copyable ? <CopyButton value={row.value} label={row.label} /> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          // Clipboard can be blocked by permissions; the value stays visible
          // and selectable, so this is a silent degradation rather than a bug.
        }
      }}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-subtle hover:text-ink"
    >
      {copied ? (
        <Check className="size-4 text-success" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
      <span className="sr-only" role="status">
        {copied ? `${label} copied` : ""}
      </span>
    </button>
  );
}

function NotConfigured(): ReactNode {
  return (
    <div className="py-4">
      <p className="text-[0.9375rem] leading-relaxed text-muted">
        Donation details have not been published yet. Please contact the academy
        directly and the committee will assist you.
      </p>
      <Button asChild variant="secondary" size="lg" className="mt-6 w-full">
        <a href="/contact">Contact the academy</a>
      </Button>
    </div>
  );
}
