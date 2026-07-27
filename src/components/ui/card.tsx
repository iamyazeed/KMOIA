import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

const cardVariants = cva(
  "rounded-lg border transition-[box-shadow,transform,border-color] duration-300",
  {
    variants: {
      variant: {
        default: "border-line bg-surface",
        elevated: "border-line bg-surface shadow-sm",
        outline: "border-line bg-transparent",
      },
      interactive: {
        true: "hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg",
        false: "",
      },
    },
    defaultVariants: { variant: "default", interactive: false },
  },
);

export type CardProps = ComponentProps<"div"> & VariantProps<typeof cardVariants>;

export function Card({ className, variant, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, interactive }), className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-6 sm:p-7", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("text-h3", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("mt-2 leading-relaxed text-muted", className)} {...props} />
  );
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-3 border-t border-line px-6 py-4 sm:px-7", className)}
      {...props}
    />
  );
}
