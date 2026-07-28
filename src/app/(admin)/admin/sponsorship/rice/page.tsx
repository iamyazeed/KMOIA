import type { Metadata } from "next";

import { RiceForm } from "@/app/(admin)/admin/sponsorship/rice/rice-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Food Donation" };

export default async function RiceDonationPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("rice_donation")
    .select("title, quantity_kg, description, is_active")
    .maybeSingle();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Rice Donation"
        description="The single food-donation option on the Sponsor page. Turning it off removes the card from the website."
      />
      <RiceForm
        defaults={{
          title: data?.title ?? "Rice",
          quantity_kg: data?.quantity_kg ?? 25,
          description: data?.description ?? "",
          is_active: data?.is_active ?? true,
        }}
      />
    </div>
  );
}
