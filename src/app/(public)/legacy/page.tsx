import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section, SectionHeader } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import { defaultTimeline } from "@/content/defaults";
import { getTimeline } from "@/lib/queries/content";

export const metadata: Metadata = {
  title: "Legacy",
  description:
    "The history of KMO Islamic Academy Koduvally — its establishment in 2015, the vision of Vavad Kunji Koya Musliyar, and its place in the Darul Huda network.",
};

export default async function LegacyPage() {
  const events = await getTimeline();

  const timeline =
    events.length > 0
      ? events.map((event) => ({
          key: event.id,
          year: event.year,
          title: event.title,
          description: event.description,
        }))
      : defaultTimeline.map((event) => ({
          key: String(event.year),
          year: event.year,
          title: event.title,
          description: event.description,
        }));

  return (
    <>
      <PageHero
        eyebrow="Legacy"
        title="A decade of teaching, nurturing and service."
        description="How the academy came to be, the people who made it possible, and the network it belongs to."
      />

      <Section>
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <Reveal className="flex flex-col gap-5 leading-relaxed text-muted">
              <h2 className="text-h2 text-ink">Establishment</h2>
              <p>
                KMO Islamic Academy Koduvally was established on 1 August 2015
                under the {siteConfig.managedBy}. It was created to give
                students — including those without the means to pay for
                schooling — a complete Islamic and academic education, together
                with a home.
              </p>
              <p>
                The academy&rsquo;s establishment was made possible through the
                invaluable efforts of{" "}
                <strong className="font-medium text-ink">
                  Vavad Kunji Koya Musliyar
                </strong>
                , whose vision and dedication remain priceless in the
                institution&rsquo;s history. What began as an intention to serve
                became an institution that now houses, feeds and teaches more
                than 240 students at no cost to their families.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <Card variant="elevated">
                <CardBody className="flex flex-col gap-6">
                  <div>
                    <p className="text-eyebrow font-semibold uppercase text-muted">
                      Established
                    </p>
                    <p className="mt-2 font-display text-h3">1 August 2015</p>
                  </div>
                  <div className="border-t border-line pt-6">
                    <p className="text-eyebrow font-semibold uppercase text-muted">
                      Managed by
                    </p>
                    <p className="mt-2 font-display text-lg">
                      {siteConfig.managedBy}
                    </p>
                  </div>
                  <div className="border-t border-line pt-6">
                    <p className="text-eyebrow font-semibold uppercase text-muted">
                      Affiliated to
                    </p>
                    <p className="mt-2 font-display text-lg">
                      {siteConfig.affiliation.name}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      One among 28 Darul Huda branches across Kerala.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Timeline */}
      <Section surface="tint">
        <Container size="wide">
          <Reveal>
            <SectionHeader
              eyebrow="Timeline"
              title="Institutional growth."
              description="The moments that shaped the academy, from its founding to its first graduating cohort."
            />
          </Reveal>

          <ol className="relative mt-14 flex flex-col gap-10 border-l border-line pl-8 sm:pl-10">
            {timeline.map((event, index) => (
              <li key={event.key} className="relative">
                {/* Marker sits on the rule, so the line reads as a spine. */}
                <span
                  aria-hidden
                  className="absolute -left-[2.3125rem] top-1.5 size-3 rounded-full bg-brand-500 ring-4 ring-surface-2 sm:-left-[2.8125rem]"
                />
                <Reveal delay={Math.min(index * 0.05, 0.2)}>
                  {event.year ? (
                    <Badge variant="brand">{event.year}</Badge>
                  ) : null}
                  <h3 className="text-h3 mt-3">{event.title}</h3>
                  {event.description ? (
                    <p className="mt-3 max-w-[var(--container-content)] leading-relaxed text-muted">
                      {event.description}
                    </p>
                  ) : null}
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <h2 className="text-h3">The Darul Huda network</h2>
              <p className="mt-4 leading-relaxed text-muted">
                {siteConfig.affiliation.name} is an Islamic university with a
                network of branch academies across Kerala. As one among 28
                branches, KMO Islamic Academy follows its curriculum, academic
                calendar and scholarly standards, and its students sit the
                university&rsquo;s examinations.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="text-h3">Admissions</h2>
              <p className="mt-4 leading-relaxed text-muted">
                Admission to the Darul Huda programme is conducted entirely by{" "}
                {siteConfig.affiliation.name}. The academy does not run its own
                admission process, and enquiries about eligibility, dates or
                procedure should be directed to the university.
              </p>
              <a
                href={siteConfig.affiliation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-brand-600 underline-offset-4 hover:underline dark:text-brand-500"
              >
                dhiu.in
              </a>
            </Reveal>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
