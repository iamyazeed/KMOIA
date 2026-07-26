import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className={cn("flex items-center gap-3", className)}
    >
      <Image
        src="/brand/kmoia-logo.png"
        alt=""
        width={44}
        height={44}
        priority
        className="size-10 w-auto object-contain dark:hidden"
      />
      <Image
        src="/brand/kmoia-logo-white.png"
        alt=""
        width={44}
        height={44}
        priority
        className="hidden size-10 w-auto object-contain dark:block"
      />
      {showWordmark ? (
        <span className="hidden leading-tight sm:block">
          <span className="logo-name block font-display text-[0.9375rem] font-semibold tracking-tight text-ink">
            {siteConfig.name}
          </span>
          <span className="logo-sub block text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
            {siteConfig.location}
          </span>
        </span>
      ) : null}
    </Link>
  );
}
