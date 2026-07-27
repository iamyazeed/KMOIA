import Link from "next/link";

import { cn } from "@/lib/utils/cn";

/**
 * Wordmark.
 *
 * Set in type rather than placed as a bitmap: it stays crisp at every size,
 * costs no request, cannot 404, and inverts for dark backgrounds by changing a
 * colour instead of swapping a second file. The tracking is tightened and
 * "Islamic Academy" is set in the muted tone so the institution's initials
 * carry the emphasis.
 */
export function Logo({
  className,
  showWordmark = true,
  inverted = false,
}: {
  className?: string;
  showWordmark?: boolean;
  inverted?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="KMO Islamic Academy — home"
      className={cn(
        "group inline-flex items-baseline gap-2 font-display tracking-[-0.03em] transition-opacity duration-200 hover:opacity-70",
        className,
      )}
    >
      <span
        className={cn(
          "text-[1.0625rem] font-semibold",
          inverted ? "text-white" : "text-ink",
        )}
      >
        KMO
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "hidden text-[1.0625rem] font-normal sm:inline",
            inverted ? "text-white/70" : "text-muted",
          )}
        >
          Islamic Academy
        </span>
      ) : null}
    </Link>
  );
}
