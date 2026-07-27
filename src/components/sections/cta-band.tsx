import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

/**
 * Closing call to action.
 *
 * A single statement set large, with one primary action. No card, no border,
 * no coloured panel — the whole width of the page is the emphasis.
 */
export function CtaBand({
  title = "₹3,000 a month keeps one student learning.",
  description = "Education, accommodation and food are provided free of cost to every student here. That is funded entirely by people who choose to give.",
  primaryHref = "/sponsor",
  primaryLabel = "Sponsor a student",
  secondaryHref = "/contact",
  secondaryLabel = "Contact the academy",
}: {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <Section spacing="s3" divided>
      <Container size="wide">
        <Reveal className="max-w-3xl">
          <h2 className="text-h1">{title}</h2>
          <p className="text-lead mt-7 max-w-[var(--container-prose)] text-muted">
            {description}
          </p>
          <div className="mt-11 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight />
              </Link>
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
