import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { PageHero } from "@/components/sections/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section, SectionHeader } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import { defaultDepartments, defaultSkills } from "@/content/defaults";
import { getSkills } from "@/lib/queries/content";
import { getDepartments } from "@/lib/queries/faculty";

export const metadata: Metadata = {
  title: "Academics",
  description:
    "The curriculum at KMO Islamic Academy Koduvally — Islamic sciences, languages, general education and technical skills under the Darul Huda Islamic University framework.",
};

export default async function AcademicsPage() {
  const [departments, skills] = await Promise.all([
    getDepartments(),
    getSkills(),
  ]);

  const departmentItems =
    departments.length > 0
      ? departments.map((d) => ({
          id: d.id,
          title: d.name,
          description: d.description,
          icon: d.icon ?? "book-open",
        }))
      : defaultDepartments.map((d) => ({
          title: d.name,
          description: d.description,
          icon: "book-open",
        }));

  const skillItems =
    skills.length > 0
      ? skills.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: s.icon,
        }))
      : defaultSkills;

  return (
    <>
      <PageHero
        eyebrow="Academics"
        title="A curriculum that holds tradition and capability together."
        description={`Students follow the ${siteConfig.affiliation.name} curriculum across Islamic sciences, languages and general education — alongside training in design, media and technology.`}
      />

      <Section>
        <Container size="wide">
          <Reveal>
            <SectionHeader
              eyebrow="Departments"
              title="What students study."
              description="Four areas of study run in parallel throughout a student's years at the academy."
            />
          </Reveal>
          <FeatureGrid items={departmentItems} columns={4} className="mt-14" />
        </Container>
      </Section>

      <Section surface="tint">
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <h2 className="text-h2">KISWA</h2>
              <p className="mt-6 leading-relaxed text-muted">
                KISWA is the academy&rsquo;s student wing — the platform through
                which students take on oratory, literature, publishing, creative
                arts and community initiatives. It is where classroom learning
                becomes practice, and where the academy&rsquo;s mission of
                propagation is carried by the students themselves.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                Its programmes run alongside the academic calendar, giving every
                student a place to lead, organise and present.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <Card variant="elevated">
                <CardBody className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-h3">Language Learning</h3>
                    <p className="mt-3 leading-relaxed text-muted">
                      Arabic, Urdu, English and Malayalam are taught for both
                      scholarship and everyday communication. Language
                      proficiency underpins the entire curriculum — students
                      read primary sources in Arabic and present their work in
                      several languages.
                    </p>
                  </div>
                  <div className="border-t border-line pt-6">
                    <h3 className="text-h3">Examinations</h3>
                    <p className="mt-3 leading-relaxed text-muted">
                      Students sit {siteConfig.affiliation.name} examinations,
                      and the academy has consistently produced academic rank
                      holders within the branch network.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <Reveal>
            <SectionHeader
              eyebrow="Beyond the curriculum"
              title="Skills students carry into the world."
              description="Practical training that complements religious scholarship rather than competing with it."
            />
          </Reveal>
          <FeatureGrid items={skillItems} className="mt-14" />
          <Reveal className="mt-10">
            <Button asChild variant="secondary">
              <Link href="/faculty">
                Meet the faculty
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </Reveal>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
