import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionForm } from "@/app/(admin)/admin/[collection]/collection-form";
import { loadCollectionOptions } from "@/app/(admin)/admin/[collection]/options";
import { AdminPageHeader } from "@/components/admin/page-header";
import {
  saveCollectionItem,
  type CollectionState,
} from "@/lib/actions/collections";
import { getCollection } from "@/lib/admin/collections";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}): Promise<Metadata> {
  const { collection, id } = await params;
  const config = getCollection(collection);
  if (!config) return { title: "Not found" };
  return {
    title: id === "new" ? `Add ${config.singularLabel}` : `Edit ${config.singularLabel}`,
  };
}

export default async function CollectionItemPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  await requireAdmin();
  const { collection, id } = await params;

  const config = getCollection(collection);
  if (!config) notFound();

  const isNew = id === "new";
  const options = await loadCollectionOptions(config);

  let defaults: Record<string, unknown> | undefined;

  if (!isNew) {
    const supabase = await createClient();
    const columns = [
      "id",
      "display_order",
      "status",
      ...config.fields.map((field) => field.name),
    ];

    const { data } = await supabase
      .from(config.table)
      .select([...new Set(columns)].join(", "))
      .eq("id", id)
      .maybeSingle<Record<string, unknown>>();

    if (!data) notFound();
    defaults = data;
  }

  // Bind the collection and record id server-side, so the client can never
  // redirect a write at a different table or row.
  async function action(state: CollectionState, formData: FormData) {
    "use server";
    return saveCollectionItem(collection, isNew ? null : id, state, formData);
  }

  const heading = isNew
    ? `Add ${config.singularLabel}`
    : String(defaults?.[config.primaryField] ?? `Edit ${config.singularLabel}`);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={heading}
        description={
          isNew
            ? "New entries are saved as drafts until you publish them."
            : "Changes appear on the website as soon as they are saved, provided the entry is published."
        }
      />
      <CollectionForm
        config={config}
        action={action}
        defaults={defaults}
        media={options.media}
        selectOptions={options.selectOptions}
        submitLabel={isNew ? `Add ${config.singularLabel}` : "Save changes"}
      />
    </div>
  );
}
