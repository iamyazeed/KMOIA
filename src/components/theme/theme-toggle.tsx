"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      // A state-dependent label would differ between SSR (theme unknown) and
      // the first client render (theme read from localStorage), producing a
      // hydration mismatch. The label names the action; the icon carries the
      // state and is swapped by CSS, so it is correct even before hydration.
      aria-label="Toggle light and dark theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-line",
        "text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink",
        className,
      )}
    >
      <Sun className="size-[18px] dark:hidden" aria-hidden />
      <Moon className="hidden size-[18px] dark:block" aria-hidden />
    </button>
  );
}
