import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { NewsRowActions } from "@/app/(admin)/admin/news/row-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState, StatusBadge } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import type { ContentLanguage, ContentStatus } from "@/types/database";

export const metadata: Metadata = { title: "News" };

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

type Row = {
  id: string;
  title: string | null;
  title_ml: string | null;
  primary_language: ContentLanguage;
  status: ContentStatus;
  published_at: string | null;
  deleted_at: string | null;
  category: { name: string } | null;
};

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const profile = await requireStaff();
  const { view } = await searchParams;
  const showTrash = view === "trash";
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("news_posts")
    .select(
      "id, title, title_ml, primary_language, status, published_at, deleted_at, category:news_categories(name)",
    )
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .returns<Row[]>();

  const all = data ?? [];
  const rows = all.filter((row) =>
    showTrash ? row.deleted_at !== null : row.deleted_at === null,
  );
  const trashCount = all.filter((row) => row.deleted_at !== null).length;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="News"
        description="Announcements and updates. Articles may be written in English or Malayalam and are published exactly as written."
        actions={
          canWrite(profile.role) ? (
            <Button asChild>
              <Link href="/admin/news/new">
                <Plus />
                Write article
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="flex gap-1">
        <ViewTab href="/admin/news" active={!showTrash}>
          Articles ({all.length - trashCount})
        </ViewTab>
        <ViewTab href="/admin/news?view=trash" active={showTrash}>
          Trash ({trashCount})
        </ViewTab>
      </div>

      {error ? (
        <EmptyState title="Could not load articles" description={error.message} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={showTrash ? "Trash is empty" : "No articles yet"}
          description={
            showTrash
              ? "Deleted articles appear here and can be restored."
              : "Write the first announcement — it appears on the News page once published."
          }
          action={
            !showTrash && canWrite(profile.role) ? (
              <Button asChild>
                <Link href="/admin/news/new">Write the first article</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                {["Title", "Language", "Category", "Published", "Status", ""].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isMalayalam = row.primary_language === "ml";
                const title = isMalayalam ? row.title_ml : row.title;

                return (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 hover:bg-subtle/60"
                  >
                    <td
                      className="px-4 py-3 font-medium"
                      lang={isMalayalam ? "ml" : undefined}
                    >
                      {title ?? <span className="italic text-faint">Untitled</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {isMalayalam ? "മലയാളം" : "English"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {row.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {row.published_at
                        ? dateFormat.format(new Date(row.published_at))
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canWrite(profile.role) ? (
                        <NewsRowActions
                          id={row.id}
                          status={row.status}
                          inTrash={row.deleted_at !== null}
                        />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
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
