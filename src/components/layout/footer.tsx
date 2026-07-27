import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { footerNav, siteConfig } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <Container size="wide" className="py-s1">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/kmoia-logo.png"
                alt=""
                width={48}
                height={48}
                className="size-11 w-auto object-contain dark:hidden"
              />
              <Image
                src="/brand/kmoia-logo-white.png"
                alt=""
                width={48}
                height={48}
                className="hidden size-11 w-auto object-contain dark:block"
              />
              <span className="font-display text-lg font-semibold">
                {siteConfig.name}
              </span>
            </div>
            <p className="mt-5 leading-relaxed text-muted">
              {siteConfig.tagline}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Managed by {siteConfig.managedBy}. Affiliated to{" "}
              <a
                href={siteConfig.affiliation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline-offset-4 hover:underline dark:text-accent"
              >
                {siteConfig.affiliation.name}
              </a>
              .
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-eyebrow font-sans font-semibold uppercase text-muted">
                  {group.title}
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-[0.9375rem] text-muted transition-colors hover:text-ink"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}, {siteConfig.location}. All rights
            reserved.
          </p>
          <p>Established 1 August 2015</p>
        </div>
      </Container>
    </footer>
  );
}
