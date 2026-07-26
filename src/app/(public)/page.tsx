import { ArrowRight, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { StatsBand } from "@/components/sections/stats-band";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section, SectionHeader } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import {
  defaultAchievements,
  defaultFacilities,
  defaultMissions,
  defaultSkills,
  defaultStatistics,
} from "@/content/defaults";
import {
  getAchievements,
  getCoreAmbitions,
  getFacilities,
  getSkills,
  getStatistics,
} from "@/lib/queries/content";

export default async function HomePage() {
  // Fetched in parallel; each read falls back to empty rather than throwing, so
  // a single failing section can never take the homepage down.
  const [ambitions, statistics, facilities, skills, achievements] =
    await Promise.all([
      getCoreAmbitions(),
      getStatistics(),
      getFacilities(),
      getSkills(),
      getAchievements(),
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

  const stats = statistics.length > 0 ? statistics : defaultStatistics;

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

  const skillItems = skills.length > 0 ? skills : defaultSkills;

  const featured =
    achievements.length > 0
      ? achievements.filter((a) => a.is_featured).slice(0, 6)
      : [];

  const achievementItems =
    featured.length > 0
      ? featured.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          icon: a.icon ?? "award",
        }))
      : defaultAchievements.slice(0, 3).map((a) => ({
          title: a.title,
          description: a.description,
          icon: "award",
        }));

  return (
    <>
      {/* Hero — the campus photograph and blue treatment carried over from the
          original site. Pulled up behind the sticky header. Nothing here is
          animated: it is above the fold and must paint immediately for LCP. */}
      <section className="relative -mt-18 flex min-h-[92svh] items-center overflow-hidden">
        <Image
          src="/images/campus-hero.png"
          alt="The KMO Islamic Academy campus building in Koduvally"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#04101f]/75 via-[#04101f]/65 to-[#04101f]/85"
        />

        <Container size="wide" className="relative pt-18 text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-eyebrow font-semibold uppercase text-white/90">
            <Award className="size-4 text-accent-500" aria-hidden />
            {siteConfig.tagline}
          </span>

          {/* The hero photograph is dark in both themes, so the title must not
              invert with the palette — brand-300 light / brand-600 dark are
              both the same light blue, at 7.3:1 over the scrim. */}
          <h1 className="text-display mt-8 text-brand-300 drop-shadow-[0_2px_24px_rgba(4,16,31,0.6)] dark:text-brand-600">
            KMO Islamic Academy
          </h1>
          <p className="mt-4 font-display text-h2 text-white">
            A Legacy of <span className="text-accent-500">Islamic</span>{" "}
            Excellence
          </p>

          <p className="text-lead mx-auto mt-8 max-w-2xl text-white/80">
            Education, accommodation and food provided entirely free of cost to
            over 240 residential students — affiliated to{" "}
            {siteConfig.affiliation.name}.
          </p>

          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/about">Discover the Academy</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="border-white/25 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/sponsor">Sponsor a Student</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* About preview */}
      <Section>
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <Badge variant="outline">Established 1 August 2015</Badge>
              <h2 className="text-h2 mt-6">
                An academy where knowledge and character are raised together.
              </h2>
              <div className="mt-6 flex flex-col gap-4 leading-relaxed text-muted">
                <p>
                  KMO Islamic Academy Koduvally is a residential academy managed
                  by the {siteConfig.managedBy} and affiliated to{" "}
                  {siteConfig.affiliation.name} — one among 28 Darul Huda
                  branches across Kerala.
                </p>
                <p>
                  More than 240 students live and learn here. Their education,
                  accommodation and food are provided entirely free of cost,
                  supported by the KMO Committee and the community around it.
                </p>
              </div>
              <Button asChild variant="link" className="mt-6 px-0">
                <Link href="/about">
                  About the Academy
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </Reveal>

            <Reveal delay={0.1} className="relative">
              <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-line shadow-soft">
                <Image
                  src="/images/campus-hero.png"
                  alt="Students and staff at the KMO Islamic Academy campus"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Vision & mission */}
      <Section surface="tint">
        <Container size="wide">
          <Reveal>
            <SectionHeader
              eyebrow="Our Foundation"
              title="Three missions, held together."
              description="Every part of academy life traces back to one of these three commitments."
            />
          </Reveal>
          <FeatureGrid items={missions} className="mt-14" />
        </Container>
      </Section>

      <StatsBand stats={stats} />

      {/* Achievements preview */}
      <Section>
        <Container size="wide">
          <Reveal>
            <SectionHeader
              eyebrow="Recognition"
              title="A record built over a decade."
              description="Accreditation, academic distinction and student achievement across the Darul Huda network."
            />
          </Reveal>
          <FeatureGrid items={achievementItems} className="mt-14" />
          <Reveal className="mt-10">
            <Button asChild variant="secondary">
              <Link href="/achievements">
                View all achievements
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </Reveal>
        </Container>
      </Section>

      {/* Campus facilities */}
      <Section surface="tint">
        <Container size="wide">
          <Reveal>
            <SectionHeader
              eyebrow="Campus"
              title="Everything a residential student needs."
              description="Classrooms, laboratories, a library and a home — on one campus, at no cost to any family."
            />
          </Reveal>
          <FeatureGrid items={facilityItems} columns={4} className="mt-14" />
          <Reveal className="mt-10">
            <Button asChild variant="secondary">
              <Link href="/campus-life">
                Explore campus life
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </Reveal>
        </Container>
      </Section>

      {/* Student excellence */}
      <Section>
        <Container size="wide">
          <Reveal>
            <SectionHeader
              eyebrow="Student Excellence"
              title="Scholarship, and the skills to carry it forward."
              description="Alongside the Darul Huda curriculum, students train in design, media, technology and languages."
            />
          </Reveal>
          <FeatureGrid
            items={skillItems.map((s) => ({
              id: "id" in s ? s.id : undefined,
              title: s.title,
              description: s.description,
              icon: s.icon,
            }))}
            className="mt-14"
          />
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
