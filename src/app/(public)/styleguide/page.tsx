import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { Section, SectionHeader } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoModal } from "@/app/(public)/styleguide/demo-modal";

/**
 * Internal design-system reference. Never indexed, never linked from the site.
 * Kept in the repo so future maintainers can see every primitive in both
 * themes without hunting through pages.
 */
export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
};

const swatches = [
  { name: "accent · #2563EB", className: "bg-accent" },
  { name: "blue-700", className: "bg-blue-700" },
  { name: "accent-soft", className: "bg-accent-soft" },
  { name: "ink", className: "bg-ink" },
  { name: "muted", className: "bg-muted" },
  { name: "line", className: "bg-line" },
  { name: "subtle", className: "bg-subtle" },
  { name: "paper", className: "bg-paper" },
];

export default function StyleguidePage() {
  return (
    <Section spacing="s2">
      <Container>
        <SectionHeader
          eyebrow="Phase 0"
          title="Design System"
          description="Every primitive the site is built from. Toggle the theme to verify both modes."
        />

        <div className="mt-16 flex flex-col gap-16">
          <section>
            <h2 className="text-h3">Colour</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {swatches.map((swatch) => (
                <div key={swatch.name}>
                  <div
                    className={`h-16 rounded-md border border-line ${swatch.className}`}
                  />
                  <p className="mt-2 font-mono text-xs text-muted">
                    {swatch.name}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-h3">Typography</h2>
            <div className="mt-6 flex flex-col gap-5">
              <p className="text-hero">Display — Geist</p>
              <p className="text-h1">Heading 1</p>
              <p className="text-h2">Heading 2</p>
              <p className="text-h3">Heading 3</p>
              <p className="text-lead max-w-[var(--container-prose)] text-muted">
                Lead paragraph — Inter, set at a comfortable measure with
                generous line height for extended reading.
              </p>
              <p className="max-w-[var(--container-prose)]">
                Body copy at the default size. The measure is capped so lines
                never exceed a comfortable reading length on wide screens.
              </p>
              <p
                lang="ml"
                className="max-w-[var(--container-prose)] text-lead"
              >
                കെ.എം.ഒ ഇസ്ലാമിക് അക്കാദമി കൊടുവള്ളി — മലയാളം വാർത്തകൾക്കുള്ള
                അക്ഷരരൂപം ഇവിടെ പരിശോധിക്കാം.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-h3">Buttons</h2>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="ghost">Ghost alt</Button>
              <Button variant="link">Link</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </section>

          <section>
            <h2 className="text-h3">Badges</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge>Brand</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </section>

          <section>
            <h2 className="text-h3">Cards</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <Card>
                <CardBody>
                  <CardTitle>Default</CardTitle>
                  <CardDescription>Flat surface with a hairline border.</CardDescription>
                </CardBody>
              </Card>
              <Card variant="elevated" interactive>
                <CardBody>
                  <CardTitle>Elevated</CardTitle>
                  <CardDescription>Interactive — lifts softly on hover.</CardDescription>
                </CardBody>
              </Card>
              <Card variant="outline">
                <CardBody>
                  <CardTitle>Outline</CardTitle>
                  <CardDescription>Transparent, for use over tinted sections.</CardDescription>
                </CardBody>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-h3">Form fields</h2>
            <div className="mt-6 grid max-w-xl gap-5">
              <div>
                <Label htmlFor="sg-name">Full name</Label>
                <Input id="sg-name" placeholder="Muhammed Ali" />
              </div>
              <div>
                <Label htmlFor="sg-email">Email</Label>
                <Input id="sg-email" aria-invalid placeholder="name@example.com" />
                <FieldError>Please enter a valid email address.</FieldError>
              </div>
              <div>
                <Label htmlFor="sg-message">Message</Label>
                <Textarea id="sg-message" placeholder="How can we help?" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-h3">Overlay</h2>
            <p className="mt-2 max-w-[var(--container-prose)] text-muted">
              The base for the donation modal and gallery lightbox — focus
              trapped, Escape to close, glass chrome.
            </p>
            <div className="mt-6">
              <DemoModal />
            </div>
          </section>

          <section>
            <h2 className="text-h3">Loading</h2>
            <div className="mt-6 flex max-w-md flex-col gap-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </section>
        </div>
      </Container>
    </Section>
  );
}
