import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

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
      aria-label={`${siteConfig.name} — home`}
      className={cn("flex items-center gap-2.5", className)}
    >
      <Image
        src={inverted ? "/brand/kmoia-logo-white.png" : "/brand/kmoia-logo.png"}
        alt=""
        width={36}
        height={36}
        priority
        className={cn("h-9 w-auto object-contain", !inverted && "dark:hidden")}
      />
      {!inverted ? (
        <Image
          src="/brand/kmoia-logo-white.png"
          alt=""
          width={36}
          height={36}
          priority
          className="hidden h-9 w-auto object-contain dark:block"
        />
      ) : null}

      {showWordmark ? (
        <span
          className={cn(
            "hidden font-display text-[0.9375rem] font-medium tracking-[-0.02em] sm:block",
            inverted ? "text-white" : "text-ink",
          )}
        >
          KMO Islamic Academy
        </span>
      ) : null}
    </Link>
  );
}
