import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FacultyRowActions } from "@/app/(admin)/admin/faculty/row-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/types/database";

export const metadata: Metadata = { title: "Faculty" };

type Row = {
  id: string;
  name: string;
  designation: string;
  qualification: string;
  display_order: number;
  status: ContentStatus;
  deleted_at: string | null;
  department: { name: string } | null;
};

export default async function AdminFacultyPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const profile = await requireStaff();
  const { view } = await searchParams;
  const showTrash = view === "trash";
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("faculty")
    .select(
      "id, name, designation, qualification, display_order, status, deleted_at, department:departments(name)",
    )
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })
    .returns<Row[]>();

  const all = data ?? [];
  const rows = all.filter((row) =>
    showTrash ? row.deleted_at !== null : row.deleted_at === null,
  );
  const trashCount = all.filter((row) => row.deleted_at !== null).length;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Faculty"
        description="The teaching staff shown on the public Faculty page. Drag order is set by the Order column; only published members appear on the site."
        actions={
          canWrite(profile.role) ? (
            <Button asChild>
              <Link href="/admin/faculty/new">
                <Plus />
                Add faculty
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="flex gap-1">
        <ViewTab href="/admin/faculty" active={!showTrash}>
          Active ({all.length - trashCount})
        </ViewTab>
        <ViewTab href="/admin/faculty?view=trash" active={showTrash}>
          Trash ({trashCount})
        </ViewTab>
      </div>

      {error ? (
        <EmptyState title="Could not load faculty" description={error.message} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={showTrash ? "Trash is empty" : "No faculty members yet"}
          description={
            showTrash
              ? "Deleted members appear here and can be restored."
              : "Add the academy's teaching staff so they appear on the public Faculty page."
          }
          action={
            !showTrash && canWrite(profile.role) ? (
              <Button asChild>
                <Link href="/admin/faculty/new">Add the first member</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                <Th>Name</Th>
                <Th>Designation</Th>
                <Th hideOnMobile>Department</Th>
                <Th hideOnMobile>Order</Th>
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
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-muted">{row.designation}</td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">
                    {row.department?.name ?? (
                      <span className="italic text-faint">Unassigned</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 tabular-nums text-muted sm:table-cell">
                    {row.display_order}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canWrite(profile.role) ? (
                      <FacultyRowActions
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
  hideOnMobile,
}: {
  children: React.ReactNode;
  align?: "right";
  hideOnMobile?: boolean;
}) {
  return (
    <th
      scope="col"
      className={[
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted",
        align === "right" ? "text-right" : "",
        hideOnMobile ? "hidden sm:table-cell" : "",
      ].join(" ")}
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
