import type { Metadata } from "next";

import { GalleryManager } from "@/app/(admin)/admin/gallery/gallery-manager";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import { mediaUrl } from "@/lib/queries/utils";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/types/database";

export const metadata: Metadata = { title: "Gallery" };

type ItemRow = {
  id: string;
  caption: string | null;
  display_order: number;
  status: ContentStatus;
  deleted_at: string | null;
  category_id: string | null;
  media: {
    id: string;
    bucket: string;
    storage_path: string;
    alt_text: string;
  } | null;
};

export default async function AdminGalleryPage() {
  const profile = await requireStaff();
  const supabase = await createClient();

  const [items, categories, media] = await Promise.all([
    supabase
      .from("gallery_items")
      .select(
        "id, caption, display_order, status, deleted_at, category_id, media:media!gallery_items_media_id_fkey(id, bucket, storage_path, alt_text)",
      )
      .order("display_order", { ascending: true })
      .returns<ItemRow[]>(),
    supabase
      .from("gallery_categories")
      .select("id, name")
      .is("deleted_at", null)
      .order("display_order", { ascending: true }),
    supabase
      .from("media")
      .select("id, bucket, storage_path, alt_text")
      .order("created_at", { ascending: false })
      .limit(80),
  ]);

  const rows = (items.data ?? [])
    .filter((row) => row.deleted_at === null && row.media)
    .map((row) => ({
      id: row.id,
      caption: row.caption,
      displayOrder: row.display_order,
      status: row.status,
      categoryId: row.category_id,
      mediaId: row.media!.id,
      url: mediaUrl(row.media!.bucket, row.media!.storage_path),
      alt: row.media!.alt_text,
    }));

  const usedMediaIds = new Set(rows.map((row) => row.mediaId));

  // Only offer images that are not already in the gallery.
  const available = (media.data ?? [])
    .filter((item) => !usedMediaIds.has(item.id))
    .map((item) => ({
      id: item.id,
      url: mediaUrl(item.bucket, item.storage_path),
      alt: item.alt_text,
    }));

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Gallery"
        description="Photographs shown on the public Gallery page. Images come from the Media Library, so each already has a description and the right dimensions."
      />

      {items.error ? (
        <EmptyState
          title="Could not load the gallery"
          description={items.error.message}
        />
      ) : (
        <GalleryManager
          items={rows}
          categories={categories.data ?? []}
          available={available}
          canWrite={canWrite(profile.role)}
        />
      )}
    </div>
  );
}
