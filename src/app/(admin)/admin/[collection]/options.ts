import "server-only";

import type { MediaOption } from "@/components/admin/media-picker";
import type { CollectionConfig, TableName } from "@/lib/admin/collections";
import { mediaUrl } from "@/lib/queries/utils";
import { createClient } from "@/lib/supabase/server";

/**
 * Loads the media library and any table-backed select options a collection
 * declares, in one place so both the create and edit screens stay identical.
 */
export async function loadCollectionOptions(config: CollectionConfig) {
  const supabase = await createClient();

  const needsMedia = config.fields.some((field) => field.type === "media");

  const lookupTables = config.fields
    .filter(
      (field) =>
        field.type === "select" &&
        field.options &&
        !Array.isArray(field.options),
    )
    .map((field) => ({
      field: field.name,
      table: (field.options as { fromTable: TableName }).fromTable,
    }));

  const [mediaResult, ...lookups] = await Promise.all([
    needsMedia
      ? supabase
          .from("media")
          .select("id, bucket, storage_path, alt_text")
          .order("created_at", { ascending: false })
          .limit(60)
      : Promise.resolve({ data: [] as never[] }),
    ...lookupTables.map((lookup) =>
      supabase
        .from(lookup.table)
        .select("id, name")
        .is("deleted_at", null)
        .order("display_order", { ascending: true }),
    ),
  ]);

  const media: MediaOption[] = (
    (mediaResult.data ?? []) as {
      id: string;
      bucket: string;
      storage_path: string;
      alt_text: string;
    }[]
  ).map((item) => ({
    id: item.id,
    url: mediaUrl(item.bucket, item.storage_path),
    alt: item.alt_text,
  }));

  const selectOptions: Record<string, { value: string; label: string }[]> = {};

  // Static option lists declared in the config.
  for (const field of config.fields) {
    if (field.type === "select" && Array.isArray(field.options)) {
      selectOptions[field.name] = field.options;
    }
  }

  // Options loaded from a table.
  lookupTables.forEach((lookup, index) => {
    const rows = (lookups[index]?.data ?? []) as unknown as {
      id: string;
      name: string;
    }[];
    selectOptions[lookup.field] = rows.map((row) => ({
      value: row.id,
      label: row.name,
    }));
  });

  return { media, selectOptions };
}
