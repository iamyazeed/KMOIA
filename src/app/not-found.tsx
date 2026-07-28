import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { mainNav } from "@/config/site";

/**
 * Site-wide 404.
 *
 * Nested `not-found` files only catch `notFound()` thrown inside a matched
 * route; an unmatched URL falls through to this one. Without it, a mistyped
 * address showed Next's unstyled default page — which is what a visitor saw
 * after signing in with a stale `next` parameter.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center bg-paper">
      <Container size="wide" className="py-s2">
        <p className="text-eyebrow uppercase text-faint">404</p>
        <h1 className="text-h1 mt-6 max-w-2xl">
          This page doesn&rsquo;t exist.
        </h1>
        <p className="text-lead mt-6 max-w-[var(--container-prose)] text-muted">
          The address may be mistyped, or the page may have moved.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/">Back to the homepage</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/contact">Contact the academy</Link>
          </Button>
        </div>

        <nav aria-label="Site sections" className="mt-16 border-t border-line pt-8">
          <p className="text-eyebrow uppercase text-faint">Go to</p>
          <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            {mainNav.map((item) => (
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
      </Container>
    </main>
  );
}
