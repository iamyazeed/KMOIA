"use client";

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { setIntentStatus } from "@/lib/actions/sponsorship";
import type { DonationIntentStatus } from "@/types/database";

export function IntentActions({
  id,
  status,
}: {
  id: string;
  status: DonationIntentStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function update(next: DonationIntentStatus) {
    startTransition(async () => {
      await setIntentStatus(id, next);
      router.refresh();
    });
  }

  if (status !== "pending") {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => update("pending")}
      >
        Reopen
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => update("confirmed")}
      >
        <Check />
        <span className="hidden sm:inline">Confirm</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Reject"
        disabled={pending}
        onClick={() => update("rejected")}
        className="text-danger hover:bg-danger/10"
      >
        <X />
      </Button>
    </div>
  );
}
