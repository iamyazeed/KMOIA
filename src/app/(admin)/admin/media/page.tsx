import type { Metadata } from "next";
import Image from "next/image";

import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { UploadDialog } from "@/app/(admin)/admin/media/upload-dialog";
import { MediaActions } from "@/app/(admin)/admin/media/media-actions";
import { requireStaff } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/queries/utils";
import { MEDIA_FOLDERS } from "@/lib/validation/media";

export const metadata: Metadata = { title: "Media Library" };

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; q?: string }>;
}) {
  const profile = await requireStaff();
  const { folder, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("media")
    .select(
      "id, bucket, storage_path, filename, alt_text, width, height, blurhash, folder, size_bytes, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(120);

  if (folder && folder !== "all") query = query.eq("folder", folder);
  if (q) query = query.ilike("filename", `%${q}%`);

  const { data: media, error } = await query;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Media Library"
        description="Every image used across the website. Uploads are cropped, resized and converted to WebP automatically, and each one carries a description for screen readers."
        actions={canWrite(profile.role) ? <UploadDialog /> : null}
      />

      <div className="flex flex-wrap items-center gap-2">
        <FolderLink current={folder} value="all" label="All" />
        {MEDIA_FOLDERS.map((name) => (
          <FolderLink key={name} current={folder} value={name} label={name} />
        ))}
      </div>

      {error ? (
        <EmptyState
          title="The library could not be loaded"
          description={error.message}
        />
      ) : !media || media.length === 0 ? (
        <EmptyState
          title="No images yet"
          description="Upload the first image to start building the library. Everything else on the site picks images from here."
          action={canWrite(profile.role) ? <UploadDialog /> : undefined}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {media.map((item) => (
            <li
              key={item.id}
              className="group overflow-hidden rounded-lg border border-line bg-surface"
            >
              <div className="relative aspect-4/3 bg-subtle">
                <Image
                  src={mediaUrl(item.bucket, item.storage_path)}
                  alt={item.alt_text}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
                  className="object-cover"
                  placeholder={item.blurhash ? "blur" : "empty"}
                  blurDataURL={item.blurhash ?? undefined}
                />
              </div>
              <div className="flex flex-col gap-2 p-3">
                <p className="truncate text-xs font-medium" title={item.filename}>
                  {item.filename}
                </p>
                <p className="line-clamp-2 text-xs text-muted">
                  {item.alt_text || (
                    <span className="italic">Decorative — no description</span>
                  )}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="capitalize">
                    {item.folder}
                  </Badge>
                  <span className="text-[0.6875rem] text-muted">
                    {item.width}×{item.height}
                  </span>
                </div>
                {canWrite(profile.role) ? (
                  <MediaActions id={item.id} altText={item.alt_text} />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FolderLink({
  current,
  value,
  label,
}: {
  current?: string;
  value: string;
  label: string;
}) {
  const active = (current ?? "all") === value;

  return (
    <a
      href={`/admin/media?folder=${value}`}
      className={
        active
          ? "rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium capitalize text-white dark:text-accent"
          : "rounded-full border border-line px-3.5 py-1.5 text-xs capitalize text-muted transition-colors hover:text-ink"
      }
    >
      {label}
    </a>
  );
}
