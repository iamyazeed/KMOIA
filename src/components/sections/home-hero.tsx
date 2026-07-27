"use client";

import { ArrowRight } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

/**
 * Homepage hero.
 *
 * The previous hero centred everything over a darkened photograph — the most
 * common template pattern there is. This one is editorial: the headline is
 * left-aligned and set at true display size with tight tracking, the image is
 * treated as a full-bleed field with a directional scrim rather than a flat
 * dark overlay, and the credibility line sits on a hairline at the foot of the
 * viewport.
 *
 * Motion is a single 700ms settle on load — no parallax, no scroll-jacking.
 * It plays once and then the page is still.
 */
export function HomeHero() {
  const reduceMotion = useReducedMotion();

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden">
      <Image
        src="/images/campus-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-105 object-cover"
      />

      {/* Directional scrim — dense at the lower left where the type sits,
          clearing towards the upper right so the building stays legible. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,10,16,0.92)_0%,rgba(6,10,16,0.72)_32%,rgba(6,10,16,0.38)_62%,rgba(6,10,16,0.45)_100%)]"
      />

      <Container size="wide" className="relative pb-20 pt-32 sm:pb-24">
        <m.p
          {...rise(0.05)}
          className="text-eyebrow uppercase text-white/60"
        >
          Est. 2015 · Koduvally, Kerala
        </m.p>

        <m.h1
          {...rise(0.14)}
          className="text-hero mt-7 max-w-[16ch] text-white"
        >
          Knowledge, character and service.
        </m.h1>

        <m.p
          {...rise(0.24)}
          className="text-lead mt-8 max-w-xl text-white/75"
        >
          A residential Islamic academy where 240 students are taught, housed
          and fed entirely free of cost.
        </m.p>

        <m.div
          {...rise(0.32)}
          className="mt-11 flex flex-wrap items-center gap-3"
        >
          <Button asChild size="lg">
            <Link href="/about">
              Discover the academy
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="onDark">
            <Link href="/sponsor">Sponsor a student</Link>
          </Button>
        </m.div>

        <m.div
          {...rise(0.44)}
          className="mt-16 border-t border-white/15 pt-6"
        >
          <p className="text-[0.8125rem] text-white/55">
            Affiliated to {siteConfig.affiliation.name} · Managed by{" "}
            {siteConfig.managedBy}
          </p>
        </m.div>
      </Container>
    </section>
  );
}
