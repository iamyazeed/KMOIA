import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { PageHero } from "@/components/sections/page-hero";
import { StatsBand } from "@/components/sections/stats-band";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section, SectionHeader } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import { defaultMissions, defaultStatistics } from "@/content/defaults";
import { getCoreAmbitions, getStatistics } from "@/lib/queries/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "KMO Islamic Academy Koduvally — a residential Islamic academy managed by KMO Koduvally Orphanage and affiliated to Darul Huda Islamic University.",
};

export default async function AboutPage() {
  const [ambitions, statistics] = await Promise.all([
    getCoreAmbitions(),
    getStatistics(),
  ]);

  const missions =
    ambitions.length > 0
      ? ambitions.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          icon: a.icon,
        }))
      : defaultMissions;

  return (
    <>
      <PageHero
        eyebrow="About"
        title="A residential academy built on knowledge, character and service."
        description={`${siteConfig.name} ${siteConfig.location} was established on 1 August 2015 under the ${siteConfig.managedBy}, and is affiliated to ${siteConfig.affiliation.name}.`}
      />

      <Section>
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
            <Reveal className="flex flex-col gap-5 leading-relaxed text-muted">
              <h2 className="text-h2 text-ink">Who we are</h2>
              <p>
                The academy is a residential institution where more than 240
                students live and study. Every student&rsquo;s education,
                accommodation and food is managed entirely free of cost by the
                KMO Committee — no family is asked to contribute towards a
                child&rsquo;s learning or upkeep.
              </p>
              <p>
                As one among 28 Darul Huda branches across Kerala, the academy
                follows the curriculum and scholarly standards of{" "}
                {siteConfig.affiliation.name}, combining classical Islamic
                sciences with languages, general education and modern technical
                skills.
              </p>
              <p>
                Its establishment was made possible through the invaluable
                efforts of Vavad Kunji Koya Musliyar, whose vision and
                dedication remain priceless in the institution&rsquo;s history.
              </p>
              <Button asChild variant="link" className="mt-1 self-start px-0">
                <Link href="/legacy">Read the full history</Link>
              </Button>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-line shadow-sm">
                <Image
                  src="/images/campus-hero.png"
                  alt="The KMO Islamic Academy campus"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="subtle">
        <Container size="wide">
          <Reveal>
            <SectionHeader
              eyebrow="Vision & Mission"
              title="Teaching, nurturing and propagation."
              description="The three commitments the institution was founded upon, and the measure of everything it does."
            />
          </Reveal>
          <FeatureGrid items={missions} className="mt-14" />
        </Container>
      </Section>

      <StatsBand
        stats={statistics.length > 0 ? statistics : defaultStatistics}
      />

      <Section>
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <h2 className="text-h3">Management</h2>
              <p className="mt-4 leading-relaxed text-muted">
                The academy is managed by the {siteConfig.managedBy}, whose
                committee oversees admissions of care, daily operations, and the
                funding that keeps education free for every student.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="text-h3">Affiliation</h2>
              <p className="mt-4 leading-relaxed text-muted">
                Academic affiliation is held with{" "}
                {siteConfig.affiliation.name}. Admissions to the Darul Huda
                programme are conducted by the university itself, not by the
                academy. Details are published by the university.
              </p>
              <Button asChild variant="link" className="mt-3 px-0">
                <a
                  href={siteConfig.affiliation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit {siteConfig.affiliation.name}
                </a>
              </Button>
            </Reveal>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
