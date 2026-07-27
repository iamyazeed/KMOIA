import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";

/**
 * Inner-page header.
 *
 * White, left-aligned, no tinted slab and no gradient wash. The page opens on
 * a single large line of type with air around it; the hairline underneath is
 * the only ornament. Restraint here is what makes the content below feel
 * considered.
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
    <header className={cn("-mt-16 bg-paper pt-16", className)}>
      <Container size="wide" className="pb-s1 pt-24 sm:pt-32">
        {eyebrow ? (
          <p className="text-eyebrow uppercase text-faint">{eyebrow}</p>
        ) : null}
        <h1 className={cn("text-h1 max-w-4xl", eyebrow && "mt-6")}>{title}</h1>
        {description ? (
          <div className="text-lead mt-7 max-w-[var(--container-prose)] text-muted">
            {description}
          </div>
        ) : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
      <div aria-hidden className="mx-auto h-px w-full max-w-[88rem] rule-x" />
    </header>
  );
}
