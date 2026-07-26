import type { ComponentProps, ElementType } from "react";

import { cn } from "@/lib/utils/cn";

type ContainerProps = ComponentProps<"div"> & {
  as?: ElementType;
  size?: "narrow" | "default" | "wide";
};

const sizes = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-[88rem]",
};

export function Container({
  className,
  as: Tag = "div",
  size = "default",
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full px-5 sm:px-8 lg:px-10", sizes[size], className)}
      {...props}
    />
  );
}
