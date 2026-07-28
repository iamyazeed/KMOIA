import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CollectionRowActions } from "@/app/(admin)/admin/[collection]/row-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { getCollection } from "@/lib/admin/collections";
import { requireStaff } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection } = await params;
  const config = getCollection(collection);
  return { title: config?.title ?? "Not found" };
}

type Row = Record<string, unknown> & {
  id: string;
  status: ContentStatus;
  deleted_at: string | null;
  display_order: number;
};

export default async function CollectionListPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const profile = await requireStaff();
  const { collection } = await params;
  const { view } = await searchParams;

  // An unknown segment must 404 rather than query a table that does not exist.
  const config = getCollection(collection);
  if (!config) notFound();

  const showTrash = view === "trash";
  const supabase = await createClient();

  const columns = [
    "id",
    "status",
    "deleted_at",
    "display_order",
    config.primaryField,
    ...(config.listFields ?? []).map((field) => field.name),
  ];

  const { data, error } = await supabase
    .from(config.table)
    .select([...new Set(columns)].join(", "))
    .order("display_order", { ascending: true })
    .returns<Row[]>();

  const all = data ?? [];
  const rows = all.filter((row) =>
    showTrash ? row.deleted_at !== null : row.deleted_at === null,
  );
  const trashCount = all.filter((row) => row.deleted_at !== null).length;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={config.title}
        description={config.description}
        actions={
          canWrite(profile.role) ? (
            <Button asChild>
              <Link href={`/admin/${config.slug}/new`}>
                <Plus />
                Add {config.singularLabel}
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="flex gap-1">
        <ViewTab href={`/admin/${config.slug}`} active={!showTrash}>
          Entries ({all.length - trashCount})
        </ViewTab>
        <ViewTab href={`/admin/${config.slug}?view=trash`} active={showTrash}>
          Trash ({trashCount})
        </ViewTab>
      </div>

      {error ? (
        <EmptyState title="Could not load this list" description={error.message} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={showTrash ? "Trash is empty" : `No ${config.title.toLowerCase()} yet`}
          description={
            showTrash
              ? "Deleted entries appear here and can be restored."
              : `Add the first ${config.singularLabel} — it appears on the website once published.`
          }
          action={
            !showTrash && canWrite(profile.role) ? (
              <Button asChild>
                <Link href={`/admin/${config.slug}/new`}>
                  Add {config.singularLabel}
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                <Th>Title</Th>
                {(config.listFields ?? []).map((field) => (
                  <Th key={field.name}>{field.label}</Th>
                ))}
                <Th>Order</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line last:border-0 hover:bg-subtle/60"
                >
                  <td className="px-4 py-3 font-medium">
                    {String(row[config.primaryField] ?? "") || (
                      <span className="italic text-faint">Untitled</span>
                    )}
                  </td>
                  {(config.listFields ?? []).map((field) => (
                    <td key={field.name} className="px-4 py-3 text-muted">
                      {row[field.name] == null ? "—" : String(row[field.name])}
                    </td>
                  ))}
                  <td className="px-4 py-3 tabular-nums text-muted">
                    {row.display_order}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canWrite(profile.role) ? (
                      <CollectionRowActions
                        collection={config.slug}
                        id={row.id}
                        status={row.status}
                        inTrash={row.deleted_at !== null}
                      />
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

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "right";
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}

function ViewTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={
        active
          ? "rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-paper"
          : "rounded-md px-3.5 py-2 text-sm text-muted transition-colors hover:bg-subtle hover:text-ink"
      }
    >
      {children}
    </Link>
  );
}
