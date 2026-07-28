import type { Metadata } from "next";

import { MethodForm } from "@/app/(admin)/admin/sponsorship/donation-method/method-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { mediaUrl } from "@/lib/queries/utils";
import { createClient } from "@/lib/supabase/server";
import type { DonationMethod } from "@/types/database";

export const metadata: Metadata = { title: "Donation Method" };

export default async function DonationMethodPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: active }, { data: media }] = await Promise.all([
    supabase
      .from("donation_methods")
      .select("id, type, label, config, display_note, is_active")
      .eq("is_active", true)
      .maybeSingle<DonationMethod>(),
    supabase
      .from("media")
      .select("id, bucket, storage_path, alt_text")
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  const options = (media ?? []).map((item) => ({
    id: item.id,
    url: mediaUrl(item.bucket, item.storage_path),
    alt: item.alt_text,
  }));

  const activeQrId =
    active && "qr_media_id" in active.config
      ? (active.config.qr_media_id as string | undefined)
      : undefined;

  const qrUrl = options.find((o) => o.id === activeQrId)?.url ?? null;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Donation Method"
        description="How visitors are asked to give. Only one method is active at a time, and it takes effect on the website the moment you save."
      />
      <MethodForm current={active ?? null} qrUrl={qrUrl} media={options} />
    </div>
  );
}
