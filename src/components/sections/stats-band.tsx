import { Counter } from "@/components/motion/counter";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";

export type StatItem = {
  label: string;
  value: number;
  suffix: string | null;
  number_format: "grouped" | "plain";
};

/**
 * Statistics row.
 *
 * Previously a saturated full-width blue band — a pattern that dates a page
 * instantly. Now it sits on white, divided by hairlines, with the figures set
 * large and tight. The numbers carry the weight; the colour is unnecessary.
 */
export function StatsBand({
  stats,
  className,
}: {
  stats: StatItem[];
  className?: string;
}) {
  if (stats.length === 0) return null;

  return (
    <Container size="wide" className={className}>
      <dl className="grid grid-cols-2 gap-y-12 border-y border-line py-14 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "px-2 sm:px-6",
              index > 0 && "sm:border-l sm:border-line",
              // The 2-column layout has its own division points.
              index % 2 === 0 && "border-l-0",
              "lg:border-l lg:first:border-l-0",
            )}
          >
            <dt className="sr-only">{stat.label}</dt>
            <dd>
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                format={stat.number_format}
                className="block font-display text-[clamp(2.5rem,1.5rem+2.6vw,3.75rem)] font-medium leading-none tracking-[-0.04em]"
              />
              <span className="mt-4 block text-[0.875rem] text-muted">
                {stat.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}
