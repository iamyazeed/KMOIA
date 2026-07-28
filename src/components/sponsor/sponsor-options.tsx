"use client";

import { useState } from "react";

import { DonationModal } from "@/components/sponsor/donation-modal";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/utils/upi";
import type { DonationMethod } from "@/types/database";

export type PlanView = {
  id: string;
  name: string;
  amount: number;
  period: "monthly" | "annual" | "one_time";
  description: string | null;
};

export type RiceView = {
  title: string;
  quantity_kg: number;
  description: string | null;
};

const PERIOD_LABEL: Record<PlanView["period"], string> = {
  monthly: "per month",
  annual: "per year",
  one_time: "one time",
};

/**
 * Sponsorship options.
 *
 * Plans are rows on hairlines, not cards: the amount is the object of
 * attention, so it is set at display size and everything else recedes. All
 * three entry points — both plans and the rice donation — open the same sheet,
 * so there is exactly one donation surface to trust and one to maintain.
 */
export function SponsorOptions({
  plans,
  qrUrl,
  rice,
  method,
}: {
  plans: PlanView[];
  qrUrl?: string | null;
  rice: RiceView | null;
  method: DonationMethod | null;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [context, setContext] = useState<string | undefined>();

  function openSheet(nextAmount: number | null, nextContext?: string) {
    setAmount(nextAmount);
    setContext(nextContext);
    setOpen(true);
  }

  return (
    <>
      <ul className="border-t border-line">
        {plans.map((plan) => (
          <li key={plan.id} className="border-b border-line">
            <div className="grid items-baseline gap-5 py-10 md:grid-cols-12 md:gap-8">
              <div className="md:col-span-4">
                <p className="font-display text-[clamp(2.25rem,1.6rem+2vw,3rem)] font-medium leading-none tracking-[-0.04em]">
                  {formatRupees(plan.amount)}
                </p>
                <p className="mt-3 text-[0.875rem] text-faint">
                  {PERIOD_LABEL[plan.period]}
                </p>
              </div>

              <div className="md:col-span-5">
                <h3 className="text-h3">{plan.name}</h3>
                {plan.description ? (
                  <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-muted">
                    {plan.description}
                  </p>
                ) : null}
              </div>

              <div className="md:col-span-3 md:justify-self-end">
                <Button
                  size="lg"
                  onClick={() => openSheet(plan.amount, plan.name)}
                >
                  Sponsor now
                </Button>
              </div>
            </div>
          </li>
        ))}

        {rice ? (
          <li className="border-b border-line">
            <div className="grid items-baseline gap-5 py-10 md:grid-cols-12 md:gap-8">
              <div className="md:col-span-4">
                <p className="font-display text-[clamp(2.25rem,1.6rem+2vw,3rem)] font-medium leading-none tracking-[-0.04em]">
                  {rice.quantity_kg} KG
                </p>
                <p className="mt-3 text-[0.875rem] text-faint">rice</p>
              </div>

              <div className="md:col-span-5">
                <h3 className="text-h3">{rice.title}</h3>
                <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-muted">
                  {rice.description ??
                    `Support students by donating ${rice.quantity_kg} KG of rice for the academy kitchen.`}
                </p>
              </div>

              <div className="md:col-span-3 md:justify-self-end">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() =>
                    openSheet(null, `${rice.quantity_kg} KG rice donation`)
                  }
                >
                  Support rice
                </Button>
              </div>
            </div>
          </li>
        ) : null}
      </ul>

      <DonationModal
        method={method}
        qrUrl={qrUrl}
        amount={amount}
        context={context}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
