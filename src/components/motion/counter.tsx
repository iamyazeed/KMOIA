"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type CounterProps = {
  value: number;
  suffix?: string | null;
  duration?: number;
  className?: string;
  /** `plain` skips thousands separators — use it for years. */
  format?: "grouped" | "plain";
};

/** Counts up to `value` once the element scrolls into view. */
export function Counter({
  value,
  suffix,
  duration = 1.6,
  className,
  format = "grouped",
}: CounterProps) {
  const fmt = (n: number) =>
    format === "plain" ? String(n) : n.toLocaleString("en-IN");

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!inView || reduceMotion) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, reduceMotion, value, duration]);

  return (
    <span ref={ref} className={className}>
      {/* Screen readers get the final value immediately, not the tick-up. */}
      <span aria-hidden>{fmt(display)}</span>
      {suffix ? <span aria-hidden>{suffix}</span> : null}
      <span className="sr-only">
        {fmt(value)}
        {suffix ?? ""}
      </span>
    </span>
  );
}
