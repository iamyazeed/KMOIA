import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium tracking-[-0.01em]",
    "transition-[background-color,color,border-color,opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        // #2563EB with white text is 5.17:1 — one value, valid at every size,
        // as a fill and as text. No shadow: the colour is the emphasis.
        primary: "bg-accent text-white hover:bg-accent-hover active:scale-[0.99]",
        // Hairline border, no shadow, no fill until hover.
        secondary:
          "border border-line-strong bg-surface text-ink hover:bg-subtle active:scale-[0.99]",
        ghost: "text-muted hover:bg-subtle hover:text-ink",
        // Inline text link with an arrow — the workhorse of editorial layouts.
        link: "text-accent hover:text-accent-hover [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:translate-x-0.5",
        // For use over photography.
        onDark:
          "border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
      },
      size: {
        sm: "h-9 rounded-md px-3.5 text-[0.875rem]",
        md: "h-11 rounded-md px-5 text-[0.9375rem]",
        lg: "h-12 rounded-md px-6 text-[0.9375rem]",
        icon: "size-10 rounded-md",
        none: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
