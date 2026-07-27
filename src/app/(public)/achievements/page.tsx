import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
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
  { id: "institutional", slug: "institutional", name: "Institutional" },
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
        year: a.year,
        categorySlug: a.category?.slug ?? null,
        categoryName: a.category?.name ?? null,
      }))
    : defaultAchievements.map((a, index) => ({
        id: `default-${index}`,
        title: a.title,
        description: a.description,
        year: null as number | null,
        categorySlug: a.category,
        categoryName:
          FALLBACK_CATEGORIES.find((c) => c.slug === a.category)?.name ?? null,
      }));

  const tabs =
    categories.length > 0 && usingLiveData ? categories : FALLBACK_CATEGORIES;

  // Filtering on the server keeps every view a real, shareable, indexable URL
  // and ships no JavaScript to do it.
  const visible = activeSlug
    ? items.filter((item) => item.categorySlug === activeSlug)
    : items;

  return (
    <>
      <PageHero
        eyebrow="Achievements"
        title="A record built over a decade."
        description="Accreditation, academic distinction and student achievement across the Darul Huda network."
      />

      <Section spacing="s2">
        <Container size="wide">
          <nav aria-label="Achievement categories" className="mb-16">
            <ul className="flex flex-wrap gap-1">
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
            <p className="text-muted">
              Nothing has been published in this category yet.{" "}
              <Link href="/achievements" className="text-accent hover:underline">
                View all
              </Link>
              .
            </p>
          ) : (
            /* An editorial index rather than a card grid: each entry is a row
               with the year as a marginal note, the claim as a heading and one
               line of substantiation. Hairlines separate; nothing boxes. */
            <ul className="border-t border-line">
              {visible.map((item, index) => (
                <li key={item.id} className="border-b border-line">
                  <Reveal delay={Math.min(index * 0.03, 0.18)}>
                    <div className="grid gap-3 py-9 md:grid-cols-12 md:gap-8">
                      <div className="md:col-span-2">
                        <span className="font-display text-[0.8125rem] tabular-nums text-faint">
                          {item.year ?? String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="md:col-span-6">
                        <h2 className="text-h3">{item.title}</h2>
                        {item.description ? (
                          <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-muted">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="md:col-span-4 md:text-right">
                        {item.categoryName ? (
                          <span className="text-[0.8125rem] text-faint">
                            {item.categoryName}
                          </span>
                        ) : null}
                      </div>
                    </div>
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
        "inline-flex rounded-md px-3.5 py-2 text-[0.875rem] transition-colors duration-200",
        active ? "bg-ink text-paper" : "text-muted hover:bg-subtle hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
