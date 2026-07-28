"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";

import { FormMessage, StatusBadge, SubmitButton } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import type { PlanRecord } from "@/app/(admin)/admin/sponsorship/page";
import { deletePlan, savePlan, type SponsorState } from "@/lib/actions/sponsorship";
import { formatRupees } from "@/lib/utils/upi";

const PERIODS = [
  { value: "monthly", label: "Per month" },
  { value: "annual", label: "Per year" },
  { value: "one_time", label: "One time" },
];

export function PlanEditor({
  plans,
  canWrite,
}: {
  plans: PlanRecord[];
  canWrite: boolean;
}) {
  const [editing, setEditing] = useState<PlanRecord | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line">
              {["Plan", "Amount", "Period", "Order", "Status", ""].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.id}
                className="border-b border-line last:border-0 hover:bg-subtle/60"
              >
                <td className="px-4 py-3 font-medium">{plan.name}</td>
                <td className="px-4 py-3 tabular-nums">
                  {formatRupees(Number(plan.amount))}
                </td>
                <td className="px-4 py-3 capitalize text-muted">
                  {plan.period.replace("_", " ")}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted">
                  {plan.display_order}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={plan.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {canWrite ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(plan)}
                    >
                      Edit
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
            {plans.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No plans yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {canWrite ? (
        <div>
          <Button onClick={() => setCreating(true)}>
            <Plus />
            Add plan
          </Button>
        </div>
      ) : null}

      {creating ? (
        <PlanDialog plan={null} onClose={() => setCreating(false)} />
      ) : null}
      {editing ? (
        <PlanDialog plan={editing} onClose={() => setEditing(null)} />
      ) : null}
    </>
  );
}

function PlanDialog({
  plan,
  onClose,
}: {
  plan: PlanRecord | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const action = savePlan.bind(null, plan?.id ?? null);
  const [state, formAction] = useActionState<SponsorState, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      onClose();
      router.refresh();
    }
  }, [state?.success, onClose, router]);

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        title={plan ? "Edit plan" : "Add plan"}
        description="Amounts are shown to donors exactly as entered."
        size="lg"
      >
        <form action={formAction} className="flex flex-col gap-5">
          <div>
            <Label htmlFor="plan-name">Name</Label>
            <Input
              id="plan-name"
              name="name"
              required
              defaultValue={plan?.name}
              placeholder="Monthly Sponsorship"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="plan-amount">Amount (₹)</Label>
              <Input
                id="plan-amount"
                name="amount"
                type="number"
                min={1}
                required
                defaultValue={plan ? Number(plan.amount) : 3000}
              />
            </div>
            <div>
              <Label htmlFor="plan-period">Period</Label>
              <select
                id="plan-period"
                name="period"
                defaultValue={plan?.period ?? "monthly"}
                className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="plan-description">Description</Label>
            <Textarea
              id="plan-description"
              name="description"
              rows={3}
              defaultValue={plan?.description ?? ""}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="plan-order">Display order</Label>
              <Input
                id="plan-order"
                name="display_order"
                type="number"
                min={0}
                defaultValue={plan?.display_order ?? 0}
              />
            </div>
            <div>
              <Label htmlFor="plan-status">Status</Label>
              <select
                id="plan-status"
                name="status"
                defaultValue={plan?.status ?? "draft"}
                className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <FormMessage state={state} />

          <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
            {plan ? (
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                className="text-danger hover:bg-danger/10"
                onClick={() =>
                  startTransition(async () => {
                    await deletePlan(plan.id);
                    onClose();
                    router.refresh();
                  })
                }
              >
                <Trash2 />
                Remove
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <SubmitButton>{plan ? "Save changes" : "Add plan"}</SubmitButton>
            </div>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
