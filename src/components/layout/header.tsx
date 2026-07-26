"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { mainNav } from "@/config/site";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The homepage opens on a dark campus photograph the header sits over, so
  // until the page scrolls the header renders in a light-on-dark treatment.
  const overHero = pathname === "/" && !scrolled;

  return (
    <header
      data-over-hero={overHero ? "" : undefined}
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "glass border-b shadow-soft"
          : "border-b border-transparent bg-transparent",
        overHero &&
          cn(
            "text-white [&_a]:text-white/85 [&_button]:text-white/85",
            "[&_.logo-name]:text-white [&_.logo-sub]:text-white/70",
            "[&_button]:border-white/30",
          ),
      )}
    >
      <Container size="wide" className="flex h-18 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-sm px-3 py-2 text-[0.9375rem] transition-colors duration-200",
                      active
                        ? "text-brand-600 dark:text-brand-500"
                        : "text-muted hover:text-ink",
                    )}
                  >
                    {item.label}
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 -bottom-0.5 h-px bg-accent-500"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden rounded-sm px-3 py-2 text-[0.9375rem] text-muted transition-colors hover:text-ink lg:block"
          >
            Contact
          </Link>
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/sponsor">Sponsor</Link>
          </Button>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
