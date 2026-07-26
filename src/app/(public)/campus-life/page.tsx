import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { PageHero } from "@/components/sections/page-hero";
import { StatsBand } from "@/components/sections/stats-band";
import { Container } from "@/components/ui/container";
import { Section, SectionHeader } from "@/components/ui/section";
import {
  defaultFacilities,
  defaultSkills,
  defaultStatistics,
} from "@/content/defaults";
import { getFacilities, getSkills, getStatistics } from "@/lib/queries/content";

export const metadata: Metadata = {
  title: "Campus Life",
  description:
    "Residential life at KMO Islamic Academy Koduvally — facilities, daily routine and the skills students develop alongside their studies.",
};

export default async function CampusLifePage() {
  const [facilities, skills, statistics] = await Promise.all([
    getFacilities(),
    getSkills(),
    getStatistics(),
  ]);

  const facilityItems =
    facilities.length > 0
      ? facilities.map((f) => ({
          id: f.id,
          title: f.name,
          description: f.description,
          icon: f.icon,
        }))
      : defaultFacilities.map((f) => ({
          title: f.name,
          description: f.description,
          icon: f.icon,
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
        eyebrow="Campus Life"
        title="A campus that is also a home."
        description="More than 240 students live here. Their accommodation, meals and daily care are provided entirely free of cost, alongside their studies."
      />

      <Section>
        <Container size="wide">
          <Reveal>
            <SectionHeader
              eyebrow="Facilities"
              title="What the campus provides."
              description="Teaching, study and living spaces maintained by the KMO Committee for every resident student."
            />
          </Reveal>
          <FeatureGrid items={facilityItems} columns={4} className="mt-14" />
        </Container>
      </Section>

      <Section surface="tint">
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
            <Reveal>
              <h2 className="text-h2">Residential life</h2>
              <div className="mt-6 flex flex-col gap-4 leading-relaxed text-muted">
                <p>
                  Life at the academy follows a rhythm built around prayer,
                  study and rest. Students share accommodation on campus, take
                  their meals from the academy kitchen, and study under the
                  supervision of resident teachers.
                </p>
                <p>
                  Because education, accommodation and food are all provided
                  free of cost, a student&rsquo;s family is never asked to
                  choose between their child&rsquo;s schooling and their
                  circumstances. That commitment is the reason the academy
                  exists.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="text-h2">Care and supervision</h2>
              <div className="mt-6 flex flex-col gap-4 leading-relaxed text-muted">
                <p>
                  Resident staff are responsible for students&rsquo; wellbeing
                  outside the classroom — health, discipline, guidance and the
                  ordinary care a family provides.
                </p>
                <p>
                  The KMO Committee oversees the kitchen, accommodation and
                  daily operations, funded by the community and by those who
                  choose to sponsor a student.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <StatsBand
        stats={statistics.length > 0 ? statistics : defaultStatistics}
      />

      <Section>
        <Container size="wide">
          <Reveal>
            <SectionHeader
              eyebrow="Student Excellence"
              title="What students build here."
              description="Design, media, technology and languages — practical capability developed alongside scholarship."
            />
          </Reveal>
          <FeatureGrid items={skillItems} className="mt-14" />
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
