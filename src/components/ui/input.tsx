import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

const fieldStyles = cn(
  "w-full rounded-md border border-line bg-surface px-4 text-[0.9375rem] text-ink",
  "placeholder:text-muted/70 transition-colors duration-200",
  "hover:border-brand-200 focus:border-brand-500 focus:outline-none",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "aria-[invalid=true]:border-danger",
);

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldStyles, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(fieldStyles, "min-h-32 resize-y py-3 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-2 block text-sm font-medium text-ink", className)}
      {...props}
    />
  );
}

export function FieldError({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      role="alert"
      className={cn("mt-1.5 text-sm text-danger", className)}
      {...props}
    />
  );
}
