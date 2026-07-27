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

/**
 * Mobile navigation.
 *
 * Full-screen rather than a narrow drawer, with the links set at display size.
 * On a phone the menu is the whole experience for that moment — treating it as
 * a page rather than a panel is what makes it feel considered.
 */
export function MobileNav({ inverted = false }: { inverted?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Open menu"
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-md transition-colors lg:hidden",
          inverted
            ? "text-white hover:bg-white/10"
            : "text-ink hover:bg-subtle",
        )}
      >
        <Menu className="size-5" aria-hidden />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-paper focus:outline-none lg:hidden",
            "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
          )}
        >
          <VisuallyHidden asChild>
            <Dialog.Title>Site navigation</Dialog.Title>
          </VisuallyHidden>
          <VisuallyHidden asChild>
            <Dialog.Description>Primary links for the site</Dialog.Description>
          </VisuallyHidden>

          <div className="flex h-16 shrink-0 items-center justify-between px-5 sm:px-8">
            <span className="font-display text-[0.9375rem] font-medium tracking-[-0.02em]">
              KMO Islamic Academy
            </span>
            <Dialog.Close
              aria-label="Close menu"
              className="inline-flex size-10 items-center justify-center rounded-md text-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>

          <nav
            aria-label="Mobile"
            className="flex-1 overflow-y-auto px-5 pt-6 sm:px-8"
          >
            <ul className="flex flex-col">
              {[...mainNav, { label: "Contact", href: "/contact" }].map(
                (item, index) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href} className="border-b border-line">
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-baseline gap-4 py-5 font-display text-[1.75rem] tracking-[-0.03em] transition-colors",
                          active ? "text-accent" : "text-ink",
                        )}
                      >
                        <span className="font-sans text-[0.75rem] tabular-nums text-faint">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                },
              )}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-3 border-t border-line p-5 sm:px-8">
            <Button asChild size="lg" className="flex-1">
              <Link href="/sponsor" onClick={() => setOpen(false)}>
                Sponsor a student
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
