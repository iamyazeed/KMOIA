import { Counter } from "@/components/motion/counter";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export type StatItem = {
  label: string;
  value: number;
  suffix: string | null;
  number_format: "grouped" | "plain";
};

export function StatsBand({ stats }: { stats: StatItem[] }) {
  if (stats.length === 0) return null;

  return (
    <Section surface="brand" spacing="md">
      <Container size="wide">
        <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              {/* The number is decorative without its label, so the label is
                  the accessible name and the figure follows it. */}
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <Counter
                  value={stat.value}
                  suffix={stat.suffix}
                  format={stat.number_format}
                  className="block font-display text-h2"
                />
                <span className="mt-2 block text-sm text-white/90">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
