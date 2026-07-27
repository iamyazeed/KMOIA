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
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The homepage opens on a dark full-bleed image the header sits over.
  const overHero = pathname === "/" && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-16 transition-[background-color,border-color] duration-300",
        scrolled ? "glass border-b" : "border-b border-transparent",
        overHero && "text-white",
      )}
    >
      <Container size="wide" className="flex h-16 items-center justify-between gap-8">
        <Logo inverted={overHero} />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {mainNav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2 text-[0.875rem] tracking-[-0.01em] transition-colors duration-200",
                      overHero
                        ? active
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                        : active
                          ? "text-ink"
                          : "text-muted hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/contact"
            className={cn(
              "hidden rounded-md px-3 py-2 text-[0.875rem] transition-colors lg:block",
              overHero ? "text-white/70 hover:text-white" : "text-muted hover:text-ink",
            )}
          >
            Contact
          </Link>
          <ThemeToggle
            className={cn(
              "hidden sm:inline-flex",
              overHero && "border-white/25 text-white/80 hover:bg-white/10 hover:text-white",
            )}
          />
          <Button
            asChild
            size="sm"
            variant={overHero ? "onDark" : "primary"}
            className="hidden sm:inline-flex"
          >
            <Link href="/sponsor">Sponsor</Link>
          </Button>
          <MobileNav inverted={overHero} />
        </div>
      </Container>
    </header>
  );
}
