"use client";

import { m, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils/cn";

export type FeatureItem = {
  id?: string;
  title: string;
  description?: string | null;
  icon?: string | null;
};

/**
 * Editorial feature list.
 *
 * Replaces the bordered icon-cards this site used to be built from. Cards were
 * the core problem: six sections of identical bordered boxes with an icon in a
 * rounded square is the single strongest "template" signal on the web.
 *
 * What replaces them is a typographic grid — an index number, a heading and a
 * line of copy, separated by hairlines. No border, no shadow, no icon chrome.
 * The hierarchy comes from type and space, which is what makes it read as
 * designed rather than assembled.
 */
export function FeatureGrid({
  items,
  columns = 3,
  numbered = true,
  className,
}: {
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
  numbered?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (items.length === 0) return null;

  return (
    <ul
      className={cn(
        "grid border-t border-line",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item, index) => (
        <m.li
          key={item.id ?? item.title}
          className={cn(
            "group relative border-b border-line py-8 pr-8",
            // Interior vertical hairlines only — no outer box.
            columns === 2 && "sm:[&:nth-child(2n+2)]:border-l sm:[&:nth-child(2n+2)]:pl-8",
            columns === 3 &&
              "sm:[&:nth-child(2n+2)]:border-l sm:[&:nth-child(2n+2)]:pl-8 lg:[&:nth-child(2n+2)]:border-l-0 lg:[&:nth-child(2n+2)]:pl-0 lg:[&:not(:nth-child(3n+1))]:border-l lg:[&:not(:nth-child(3n+1))]:pl-8",
            columns === 4 &&
              "sm:[&:nth-child(2n+2)]:border-l sm:[&:nth-child(2n+2)]:pl-8 lg:[&:nth-child(2n+2)]:border-l-0 lg:[&:nth-child(2n+2)]:pl-0 lg:[&:not(:nth-child(4n+1))]:border-l lg:[&:not(:nth-child(4n+1))]:pl-8",
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 0.5,
            delay: Math.min(index * 0.05, 0.25),
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {numbered ? (
            <span className="font-display text-[0.8125rem] tabular-nums text-faint transition-colors duration-300 group-hover:text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
          <h3 className={cn("text-h3", numbered && "mt-4")}>{item.title}</h3>
          {item.description ? (
            <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
              {item.description}
            </p>
          ) : null}
        </m.li>
      ))}
    </ul>
  );
}
