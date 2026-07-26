import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";

/**
 * Inner-page header.
 *
 * Deliberately typographic rather than photographic: only the homepage carries
 * a full-bleed image. Repeating that treatment on every page would slow each
 * one down and flatten the hierarchy between them.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative -mt-18 overflow-hidden border-b border-line bg-surface-2 pt-18",
        className,
      )}
    >
      {/* Soft brand wash — keeps the header from reading as a grey slab. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_28rem_at_15%_-20%,var(--brand-100),transparent)] opacity-70 dark:opacity-30"
      />
      <Container size="wide" className="relative py-section-sm sm:py-section">
        {eyebrow ? (
          <p className="text-eyebrow font-semibold uppercase text-brand-600 dark:text-brand-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-h1 mt-4 max-w-4xl">{title}</h1>
        {description ? (
          <div className="text-lead mt-6 max-w-[var(--container-content)] text-muted">
            {description}
          </div>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </section>
  );
}
