"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { FormMessage, SubmitButton } from "@/components/admin/ui";
import { Input, Label, Textarea } from "@/components/ui/input";
import { saveRiceDonation, type SponsorState } from "@/lib/actions/sponsorship";

export function RiceForm({
  defaults,
}: {
  defaults: {
    title: string;
    quantity_kg: number;
    description: string;
    is_active: boolean;
  };
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<SponsorState, FormData>(
    saveRiceDonation,
    undefined,
  );

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state?.success, router]);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={defaults.title} required />
        </div>
        <div>
          <Label htmlFor="quantity_kg">Quantity (KG)</Label>
          <Input
            id="quantity_kg"
            name="quantity_kg"
            type="number"
            min={1}
            defaultValue={defaults.quantity_kg}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaults.description}
          placeholder="Support students by donating 25 KG of rice for the academy kitchen."
        />
      </div>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={defaults.is_active}
          className="size-4 rounded border-line"
        />
        Show the rice donation card on the Sponsor page
      </label>

      <FormMessage state={state} />

      <div>
        <SubmitButton>Save changes</SubmitButton>
      </div>
    </form>
  );
}
