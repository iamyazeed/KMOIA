"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SidebarNav } from "@/components/admin/sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { ROLE_LABELS, type SessionProfile } from "@/lib/roles";

export function Topbar({ profile }: { profile: SessionProfile }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur-sm sm:px-6">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger
          aria-label="Open menu"
          className="inline-flex size-10 items-center justify-center rounded-md text-muted transition-colors hover:bg-subtle hover:text-ink lg:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)] overflow-y-auto bg-surface shadow-lg focus:outline-none data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out lg:hidden">
            <VisuallyHidden asChild>
              <Dialog.Title>Admin navigation</Dialog.Title>
            </VisuallyHidden>
            <VisuallyHidden asChild>
              <Dialog.Description>
                Links to every admin section
              </Dialog.Description>
            </VisuallyHidden>
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <span className="font-display text-sm font-semibold">
                KMOIA Admin
              </span>
              <Dialog.Close
                aria-label="Close menu"
                className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-ink"
              >
                <X className="size-4" aria-hidden />
              </Dialog.Close>
            </div>
            <SidebarNav role={profile.role} onNavigate={() => setOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{profile.full_name}</p>
        <p className="truncate text-xs text-muted">{profile.email}</p>
      </div>

      <Badge variant="neutral" className="hidden sm:inline-flex">
        {ROLE_LABELS[profile.role]}
      </Badge>

      <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
        <Link href="/" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="size-4" aria-hidden />
          View site
        </Link>
      </Button>

      <ThemeToggle />

      <form action={signOut}>
        <Button type="submit" variant="secondary" size="sm">
          <LogOut className="size-4" aria-hidden />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </form>
    </header>
  );
}
