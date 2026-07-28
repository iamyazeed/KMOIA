import type { Metadata } from "next";

import { IntentActions } from "@/app/(admin)/admin/sponsorship/intents/intent-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { requireStaff } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { formatRupees } from "@/lib/utils/upi";
import type { DonationIntentStatus } from "@/types/database";

export const metadata: Metadata = { title: "Donation Enquiries" };

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function IntentsPage() {
  const profile = await requireStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("donation_intents")
    .select("id, name, phone, email, amount, type, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Donation Enquiries"
        description="People who told us they have sent a donation. No money passes through the website, so this is the only record the committee has — use it to thank donors and issue receipts."
      />

      {error ? (
        <EmptyState title="Could not load enquiries" description={error.message} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No enquiries yet"
          description="When the optional “I've sent it” form is enabled on the Sponsor page, submissions appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[48rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                {["Donor", "Contact", "Amount", "Type", "Received", "Status", ""].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line last:border-0 align-top hover:bg-subtle/60"
                >
                  <td className="px-4 py-3 font-medium">
                    {row.name}
                    {row.message ? (
                      <p className="mt-1 max-w-xs text-xs font-normal text-muted">
                        {row.message}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <span className="flex flex-col gap-0.5">
                      {row.phone ? <span>{row.phone}</span> : null}
                      {row.email ? (
                        <span className="break-all text-xs">{row.email}</span>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {row.amount ? formatRupees(Number(row.amount)) : "—"}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted">{row.type}</td>
                  <td className="px-4 py-3 text-muted">
                    {dateFormat.format(new Date(row.created_at))}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canWrite(profile.role) ? (
                      <IntentActions id={row.id} status={row.status} />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: DonationIntentStatus }) {
  if (status === "confirmed") return <Badge variant="brand">Confirmed</Badge>;
  if (status === "rejected") return <Badge variant="neutral">Rejected</Badge>;
  return <Badge variant="accent">Pending</Badge>;
}
