"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminIcon } from "@/components/admin/icon";
import { visibleNav } from "@/config/admin-nav";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types/database";

export function SidebarNav({
  role,
  onNavigate,
}: {
  role: UserRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const groups = visibleNav(role);

  return (
    <nav aria-label="Admin" className="flex flex-col gap-7 p-4">
      {groups.map((group) => (
        <div key={group.title}>
          <h2 className="px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            {group.title}
          </h2>
          <ul className="mt-2 flex flex-col gap-0.5">
            {group.items.map((item) => {
              // Exact match for /admin, prefix match elsewhere — otherwise the
              // dashboard would highlight on every child route.
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-accent-soft font-medium text-accent dark:bg-accent-soft dark:text-accent"
                        : "text-muted hover:bg-subtle hover:text-ink",
                    )}
                  >
                    <AdminIcon name={item.icon} className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({ role }: { role: UserRole }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block">
      <div className="sticky top-0 flex h-dvh flex-col">
        <Link
          href="/admin"
          className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-5"
        >
          <Image
            src="/brand/kmoia-logo.png"
            alt=""
            width={32}
            height={32}
            className="size-8 w-auto object-contain dark:hidden"
          />
          <Image
            src="/brand/kmoia-logo-white.png"
            alt=""
            width={32}
            height={32}
            className="hidden size-8 w-auto object-contain dark:block"
          />
          <span className="font-display text-sm font-semibold">
            KMOIA Admin
          </span>
        </Link>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav role={role} />
        </div>
      </div>
    </aside>
  );
}
