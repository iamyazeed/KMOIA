import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "transition-[background-color,color,border-color,box-shadow,transform] duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-[1.05em] [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        // brand-600 #1a6fd0, not the brand blue itself: white on #1f7fec is
        // 3.96:1, below the 4.5:1 WCAG AA requires for a body-size label.
        // #1a6fd0 measures 4.97:1 and is visually adjacent. The pure brand blue
        // is used for large type, icons and borders, where 3:1 applies.
        primary:
          "bg-brand-600 text-white shadow-soft hover:bg-brand-700 active:translate-y-px dark:bg-brand-300 dark:hover:bg-brand-200 dark:text-white",
        secondary:
          "border border-line bg-surface text-ink hover:bg-surface-2 active:translate-y-px",
        ghost: "text-ink hover:bg-surface-2",
        accent:
          "border border-accent-500 text-accent-600 hover:bg-accent-500/10 dark:text-accent-500",
        // brand-600 rather than brand-500: link text is body-sized, and
        // #1f7fec only reaches 3.96:1 on white.
        link: "text-brand-600 underline-offset-4 hover:underline dark:text-brand-500",
      },
      size: {
        sm: "h-9 rounded-sm px-3.5 text-sm",
        md: "h-11 rounded-md px-5 text-[0.9375rem]",
        lg: "h-13 rounded-md px-7 text-base",
        icon: "size-10 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render as the child element (e.g. a `next/link`) instead of `<button>`. */
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
