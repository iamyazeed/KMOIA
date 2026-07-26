import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function CtaBand({
  eyebrow = "Sponsor a Student",
  title = "₹3,000 a month keeps one student learning.",
  description = "Every student's education, accommodation and food is provided free of cost. That is made possible entirely by people who choose to give.",
  primaryHref = "/sponsor",
  primaryLabel = "Sponsor a Student",
  secondaryHref = "/contact",
  secondaryLabel = "Contact the Academy",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <Section spacing="md" surface="tint">
      <Container size="wide">
        <Reveal className="flex flex-col items-start gap-8 rounded-xl border border-line bg-surface p-8 shadow-soft sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-eyebrow font-semibold uppercase text-brand-600 dark:text-brand-500">
              {eyebrow}
            </p>
            <h2 className="text-h2 mt-4">{title}</h2>
            <p className="mt-5 leading-relaxed text-muted">{description}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
