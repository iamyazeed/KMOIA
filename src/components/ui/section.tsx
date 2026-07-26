import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type SectionProps = ComponentProps<"section"> & {
  /** Vertical rhythm. `lg` is the default for major homepage sections. */
  spacing?: "sm" | "md" | "lg" | "xl";
  /** `tint` is the faint blue-grey used to alternate against white. */
  surface?: "paper" | "tint" | "brand";
};

const spacings = {
  sm: "py-section-sm",
  md: "py-section",
  lg: "py-section-lg",
  xl: "py-section-xl",
};

const surfaces = {
  paper: "bg-paper text-ink",
  tint: "bg-surface-2 text-ink",
  brand: "bg-brand-600 text-white dark:bg-brand-200 dark:text-white",
};

export function Section({
  className,
  spacing = "lg",
  surface = "paper",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(spacings[spacing], surfaces[surface], className)}
      {...props}
    />
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-eyebrow font-sans font-semibold uppercase text-brand-500 dark:text-brand-500">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-h2 max-w-3xl">{title}</h2>
      {description ? (
        <p
          className={cn(
            "text-lead max-w-[var(--container-content)] text-muted",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
