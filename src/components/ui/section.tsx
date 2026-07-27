import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type SectionProps = ComponentProps<"section"> & {
  /** Vertical rhythm. Default `s2` = 7.5rem — generous by design. */
  spacing?: "s1" | "s2" | "s3" | "s4";
  /**
   * `subtle` is a near-white wash used at most twice per page. Full-bleed
   * colour bands are gone: they chop a page into slabs and are the fastest
   * way to make a site look like a template.
   */
  tone?: "paper" | "subtle";
  /** Hairline rule above the section instead of a background change. */
  divided?: boolean;
};

const spacings = {
  s1: "py-s1",
  s2: "py-s2",
  s3: "py-s3",
  s4: "py-s4",
};

export function Section({
  className,
  spacing = "s2",
  tone = "paper",
  divided = false,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        spacings[spacing],
        tone === "subtle" ? "bg-subtle" : "bg-paper",
        className,
      )}
      {...props}
    >
      {divided ? (
        <div aria-hidden className="mx-auto mb-s1 h-px w-full max-w-[88rem] rule-x" />
      ) : null}
      {children}
    </section>
  );
}

/**
 * Section heading.
 *
 * One column, left aligned, capped measure. The eyebrow is grey rather than
 * blue — reserving the accent for things a visitor can act on is what keeps
 * colour meaningful.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-eyebrow uppercase text-faint">{eyebrow}</p>
        ) : null}
        <h2 className={cn("text-h2", eyebrow && "mt-5")}>{title}</h2>
        {description ? (
          <p className="text-lead mt-5 max-w-[var(--container-prose)] text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
