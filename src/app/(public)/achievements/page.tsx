import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { ContentIcon } from "@/components/sections/content-icon";
import { PageHero } from "@/components/sections/page-hero";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardDescription, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { defaultAchievements } from "@/content/defaults";
import { getAchievementCategories, getAchievements } from "@/lib/queries/content";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Institutional recognition, academic excellence, student achievement, infrastructure and milestones at KMO Islamic Academy Koduvally.",
};

const FALLBACK_CATEGORIES = [
  { id: "institutional", slug: "institutional", name: "Institutional Achievements" },
  { id: "academic", slug: "academic", name: "Academic Excellence" },
  { id: "student", slug: "student", name: "Student Excellence" },
  { id: "infrastructure", slug: "infrastructure", name: "Infrastructure" },
  { id: "milestones", slug: "milestones", name: "Milestones" },
];

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: activeSlug } = await searchParams;
  const [categories, achievements] = await Promise.all([
    getAchievementCategories(),
    getAchievements(),
  ]);

  const usingLiveData = achievements.length > 0;

  const items = usingLiveData
    ? achievements.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon ?? "award",
        year: a.year,
        categorySlug: a.category?.slug ?? null,
        categoryName: a.category?.name ?? null,
      }))
    : defaultAchievements.map((a, index) => ({
        id: `default-${index}`,
        title: a.title,
        description: a.description,
        icon: "award",
        year: null,
        categorySlug: a.category,
        categoryName:
          FALLBACK_CATEGORIES.find((c) => c.slug === a.category)?.name ?? null,
      }));

  const tabs =
    categories.length > 0 && usingLiveData ? categories : FALLBACK_CATEGORIES;

  // Filtering happens on the server so each view is a real, shareable and
  // indexable URL rather than client-side state.
  const visible = activeSlug
    ? items.filter((item) => item.categorySlug === activeSlug)
    : items;

  return (
    <>
      <PageHero
        eyebrow="Achievements"
        title="A record built over a decade of service."
        description="Accreditation, academic distinction, student achievement and the infrastructure that supports them."
      />

      <Section>
        <Container size="wide">
          <nav aria-label="Achievement categories">
            <ul className="flex flex-wrap gap-2">
              <li>
                <FilterChip href="/achievements" active={!activeSlug}>
                  All
                </FilterChip>
              </li>
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <FilterChip
                    href={`/achievements?category=${tab.slug}`}
                    active={activeSlug === tab.slug}
                  >
                    {tab.name}
                  </FilterChip>
                </li>
              ))}
            </ul>
          </nav>

          {visible.length === 0 ? (
            <p className="mt-12 text-muted">
              Nothing has been published in this category yet.{" "}
              <Link
                href="/achievements"
                className="text-brand-600 underline-offset-4 hover:underline dark:text-brand-500"
              >
                View all achievements
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item, index) => (
                <li key={item.id} className="h-full">
                  <Reveal delay={Math.min(index * 0.04, 0.2)} className="h-full">
                    <Card variant="elevated" interactive className="h-full">
                      <CardBody className="flex h-full flex-col">
                        <span className="mb-5 inline-flex size-11 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-100 dark:text-brand-700">
                          <ContentIcon name={item.icon} className="size-5" />
                        </span>
                        <CardTitle className="text-h3">{item.title}</CardTitle>
                        {item.description ? (
                          <CardDescription>{item.description}</CardDescription>
                        ) : null}
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          {item.categoryName ? (
                            <Badge variant="neutral">{item.categoryName}</Badge>
                          ) : null}
                          {item.year ? (
                            <Badge variant="outline">{item.year}</Badge>
                          ) : null}
                        </div>
                      </CardBody>
                    </Card>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex rounded-full px-4 py-2 text-sm transition-colors",
        active
          ? "bg-brand-600 font-medium text-white"
          : "border border-line text-muted hover:border-brand-200 hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
