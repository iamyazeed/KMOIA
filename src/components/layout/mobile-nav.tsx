"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/site";
import { cn } from "@/lib/utils/cn";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Open menu"
        className="inline-flex size-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-surface-2 lg:hidden"
      >
        <Menu className="size-[18px]" aria-hidden />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px] data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out lg:hidden" />
        <Dialog.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-[min(22rem,88vw)] flex-col bg-surface shadow-lift focus:outline-none lg:hidden",
            "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
          )}
        >
          <VisuallyHidden asChild>
            <Dialog.Title>Site navigation</Dialog.Title>
          </VisuallyHidden>
          <VisuallyHidden asChild>
            <Dialog.Description>
              Primary navigation links for the site
            </Dialog.Description>
          </VisuallyHidden>

          <div className="flex h-18 items-center justify-between border-b border-line px-5">
            <span className="text-eyebrow font-semibold uppercase text-muted">
              Menu
            </span>
            <Dialog.Close
              aria-label="Close menu"
              className="inline-flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <X className="size-[18px]" aria-hidden />
            </Dialog.Close>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="flex flex-col">
              {[...mainNav, { label: "Contact", href: "/contact" }].map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      // Close on navigation directly, rather than reacting to a
                      // pathname change in an effect.
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-md px-4 py-3 font-display text-lg transition-colors",
                        active
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-100 dark:text-brand-800"
                          : "text-ink hover:bg-surface-2",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3 border-t border-line p-5">
            <Button asChild className="flex-1">
              <Link href="/sponsor" onClick={() => setOpen(false)}>
                Sponsor a Student
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
