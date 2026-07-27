import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HomeHero } from "@/components/sections/home-hero";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { StatsBand } from "@/components/sections/stats-band";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section, SectionHeader } from "@/components/ui/section";
import { defaultMissions, defaultStatistics } from "@/content/defaults";
import { getCoreAmbitions, getStatistics } from "@/lib/queries/content";

/**
 * Homepage.
 *
 * Deliberately short. Its job is to establish what this institution is and
 * make a visitor curious enough to go one level deeper — not to summarise
 * every page on the site. Facilities, skills and the full achievement record
 * now live on their own pages, where there is room to treat them properly.
 */
export default async function HomePage() {
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
        }))
      : defaultMissions.map(({ title, description }) => ({ title, description }));

  const stats = statistics.length > 0 ? statistics : defaultStatistics;

  return (
    <>
      <HomeHero />

      {/* Statistics — on white, divided by hairlines. */}
      <Section spacing="s2">
        <StatsBand stats={stats} />
      </Section>

      {/* A single editorial statement, set large. No card, no image, no icon —
          one idea given the whole width of the page. */}
      <Section spacing="s3" tone="subtle">
        <Container size="wide">
          <Reveal>
            <p className="text-eyebrow uppercase text-faint">Why we exist</p>
            <p className="mt-8 max-w-4xl font-display text-[clamp(1.75rem,1.1rem+2.4vw,3rem)] font-medium leading-[1.15] tracking-[-0.032em]">
              Every student here is housed, fed and taught{" "}
              <span className="text-accent">entirely free of cost</span> — so
              that no family has to choose between a child&rsquo;s education and
              their circumstances.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* Missions — typographic, numbered, hairline-divided. */}
      <Section spacing="s3">
        <Container size="wide">
          <Reveal>
            <SectionHeader
              eyebrow="Our foundation"
              title="Three missions, held together."
              action={
                <Button asChild variant="link" size="none">
                  <Link href="/about">
                    About the academy
                    <ArrowRight />
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <FeatureGrid items={missions} className="mt-16" />
        </Container>
      </Section>

      {/* Full-bleed campus image — the one large photographic moment on the
          page, with the caption set beneath it rather than laid over it. */}
      <Section spacing="s2">
        <Container size="wide">
          <Reveal>
            <div className="relative aspect-[21/9] overflow-hidden rounded-xl bg-subtle">
              <Image
                src="/images/campus-hero.png"
                alt="The KMO Islamic Academy campus in Koduvally"
                fill
                sizes="(max-width: 1400px) 100vw, 1400px"
                className="object-cover"
              />
            </div>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="max-w-md text-[0.9375rem] text-muted">
                A residential campus in Koduvally, home to more than 240
                students.
              </p>
              <Button asChild variant="link" size="none">
                <Link href="/campus-life">
                  Campus life
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Affiliation — a quiet credibility block, two columns of plain text. */}
      <Section spacing="s3" divided>
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="text-eyebrow uppercase text-faint">Affiliation</p>
                <h2 className="text-h2 mt-6">
                  One among 28 Darul Huda branches across Kerala.
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <Reveal delay={0.08}>
                <p className="text-lead text-muted">
                  The academy follows the curriculum and scholarly standards of
                  Darul Huda Islamic University, combining the classical Islamic
                  sciences with languages, general education and modern
                  technical training.
                </p>
                <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                  <Button asChild variant="link" size="none">
                    <Link href="/academics">
                      Academics
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button asChild variant="link" size="none">
                    <Link href="/faculty">
                      Faculty
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button asChild variant="link" size="none">
                    <Link href="/legacy">
                      Our legacy
                      <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
