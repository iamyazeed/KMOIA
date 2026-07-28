import type { Metadata } from "next";
import Link from "next/link";

import { PlanEditor } from "@/app/(admin)/admin/sponsorship/plan-editor";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { requireStaff } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/types/database";

export const metadata: Metadata = { title: "Sponsorship Plans" };

export type PlanRecord = {
  id: string;
  name: string;
  amount: number;
  period: "monthly" | "annual" | "one_time";
  description: string | null;
  display_order: number;
  status: ContentStatus;
};

export default async function SponsorshipPlansPage() {
  const profile = await requireStaff();
  const supabase = await createClient();

  const [{ data: plans }, { data: method }] = await Promise.all([
    supabase
      .from("sponsorship_plans")
      .select("id, name, amount, period, description, display_order, status")
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .returns<PlanRecord[]>(),
    supabase
      .from("donation_methods")
      .select("id, label, type")
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Sponsorship Plans"
        description="The giving options shown on the Sponsor page. Amounts appear exactly as entered."
      />

      {/* Where donations actually go — surfaced here because it is the thing
          most likely to be wrong and least likely to be noticed. */}
      <Card variant="elevated">
        <CardBody className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-medium">
              {method
                ? `Active donation method: ${method.label}`
                : "No donation method is configured"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {method
                ? "Every Sponsor button uses these details."
                : "Visitors cannot donate until a method is set up."}
            </p>
          </div>
          <Link
            href="/admin/sponsorship/donation-method"
            className="text-sm text-accent hover:underline"
          >
            {method ? "Review" : "Set up"} →
          </Link>
        </CardBody>
      </Card>

      <PlanEditor plans={plans ?? []} canWrite={canWrite(profile.role)} />
    </div>
  );
}
