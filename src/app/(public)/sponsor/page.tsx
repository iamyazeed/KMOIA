import type { Metadata } from "next";

import { PageHero } from "@/components/sections/page-hero";
import { SponsorOptions } from "@/components/sponsor/sponsor-options";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import {
  getActiveDonationMethod,
  getRiceDonation,
  getSponsorshipPlans,
  getSponsorshipProvides,
} from "@/lib/queries/sponsorship";

export const metadata: Metadata = {
  title: "Sponsor a Student",
  description:
    "Sponsor a student at KMO Islamic Academy Koduvally. ₹3,000 a month covers one student's education, food and accommodation.",
};

const DEFAULT_PLANS = [
  {
    id: "monthly",
    name: "Monthly sponsorship",
    amount: 3000,
    period: "monthly" as const,
    description:
      "Covers one student's education, food and accommodation for a month.",
  },
  {
    id: "annual",
    name: "Annual sponsorship",
    amount: 33000,
    period: "annual" as const,
    description:
      "Carries one student through a full academic year of learning and care.",
  },
];

const DEFAULT_PROVIDES = [
  { id: "education", label: "Education" },
  { id: "food", label: "Food" },
  { id: "books", label: "Books" },
];

export default async function SponsorPage() {
  const [plans, provides, rice, method] = await Promise.all([
    getSponsorshipPlans(),
    getSponsorshipProvides(),
    getRiceDonation(),
    getActiveDonationMethod(),
  ]);

  const planViews =
    plans.length > 0
      ? plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          amount: Number(plan.amount),
          period: plan.period,
          description: plan.description,
        }))
      : DEFAULT_PLANS;

  const provideItems = provides.length > 0 ? provides : DEFAULT_PROVIDES;

  const riceView =
    rice && rice.is_active !== false
      ? {
          title: rice.title,
          quantity_kg: rice.quantity_kg,
          description: rice.description,
        }
      : { title: "Rice", quantity_kg: 25, description: null };

  return (
    <>
      <PageHero
        eyebrow="Sponsor a student"
        title="₹3,000 a month keeps one student learning."
        description={`Every student at ${siteConfig.name} is taught, housed and fed entirely free of cost. That is funded by people who choose to give — nothing is charged to any family.`}
      />

      {/* What sponsorship provides — three words, nothing more. */}
      <Section spacing="s1">
        <Container size="wide">
          <Reveal>
            <p className="text-eyebrow uppercase text-faint">
              Sponsorship provides
            </p>
            <ul className="mt-8 flex flex-wrap gap-x-14 gap-y-6">
              {provideItems.map((item) => (
                <li
                  key={item.id}
                  className="font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-medium tracking-[-0.03em]"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section spacing="s2">
        <Container size="wide">
          <SponsorOptions
            plans={planViews}
            rice={riceView}
            method={method}
          />
        </Container>
      </Section>

      {/* Trust. Nobody hesitates because a QR code is hard to scan — they
          hesitate because they don't know the money reaches a child. */}
      <Section spacing="s2" tone="subtle">
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <p className="text-eyebrow uppercase text-faint">
                  Where it goes
                </p>
                <h2 className="text-h2 mt-6">Managed by the committee.</h2>
              </Reveal>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <Reveal delay={0.08}>
                <p className="text-lead text-muted">
                  Donations are received and administered by the{" "}
                  {siteConfig.managedBy}, which operates the kitchen,
                  accommodation and daily care for more than 240 residential
                  students.
                </p>
                <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted">
                  There is no payment gateway and no intermediary — funds go
                  directly to the committee&rsquo;s account. If you would like a
                  receipt or wish to confirm a transfer, contact the academy and
                  the committee will respond.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
