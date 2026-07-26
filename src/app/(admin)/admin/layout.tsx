import type { Metadata } from "next";

import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s — KMOIA Admin" },
  robots: { index: false, follow: false },
};

/**
 * Admin shell.
 *
 * This layout is the authorisation boundary for every admin page: nothing below
 * it renders until `requireStaff` resolves, so no child page needs to repeat
 * the check. Pages that additionally require write access call `requireAdmin`.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireStaff();

  return (
    <div className="flex min-h-dvh bg-paper">
      <Sidebar role={profile.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar profile={profile} />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
