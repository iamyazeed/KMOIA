import type { Metadata } from "next";

import { ContactForm } from "@/app/(public)/contact/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { cachedQuery, fallback } from "@/lib/queries/utils";
import { supabasePublic } from "@/lib/supabase/public";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact KMO Islamic Academy Koduvally — address, phone, email and enquiries.",
};

const getContactInfo = cachedQuery(
  ["contact", "info"],
  [CACHE_TAGS.contact],
  async () => {
    const { data, error } = await supabasePublic
      .from("contact_info")
      .select(
        "address, phones, emails, office_hours, map_embed_url, social_links",
      )
      .maybeSingle();

    if (error) return fallback("contact.info", error, null);
    return data;
  },
);

export default async function ContactPage() {
  const info = await getContactInfo();

  const phones = info?.phones ?? [];
  const emails = info?.emails ?? [];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Write to the academy."
        description="For enquiries about the institution, sponsorship or visiting the campus."
      />

      <Section spacing="s2">
        <Container size="wide">
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <dl className="divide-y divide-line border-y border-line">
                  {info?.address ? (
                    <Detail label="Address">
                      <span className="whitespace-pre-line">{info.address}</span>
                    </Detail>
                  ) : (
                    <Detail label="Address">
                      KMO Islamic Academy, Koduvally, Kozhikode, Kerala
                    </Detail>
                  )}

                  {phones.length > 0 ? (
                    <Detail label="Phone">
                      <span className="flex flex-col gap-1">
                        {phones.map((phone) => (
                          <a
                            key={phone}
                            href={`tel:${phone.replace(/\s/g, "")}`}
                            className="hover:text-accent"
                          >
                            {phone}
                          </a>
                        ))}
                      </span>
                    </Detail>
                  ) : null}

                  {emails.length > 0 ? (
                    <Detail label="Email">
                      <span className="flex flex-col gap-1">
                        {emails.map((email) => (
                          <a
                            key={email}
                            href={`mailto:${email}`}
                            className="break-all hover:text-accent"
                          >
                            {email}
                          </a>
                        ))}
                      </span>
                    </Detail>
                  ) : null}

                  {info?.office_hours ? (
                    <Detail label="Hours">{info.office_hours}</Detail>
                  ) : null}

                  <Detail label="Affiliation">
                    <a
                      href={siteConfig.affiliation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent"
                    >
                      {siteConfig.affiliation.name}
                    </a>
                  </Detail>
                </dl>

                <p className="mt-8 text-[0.875rem] leading-relaxed text-muted">
                  Admissions are conducted by {siteConfig.affiliation.name}, not
                  by the academy. Please direct admission enquiries to the
                  university.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-7 lg:col-start-6">
              <Reveal delay={0.08}>
                <ContactForm />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {info?.map_embed_url ? (
        <Section spacing="s1">
          <Container size="wide">
            <div className="aspect-[21/9] overflow-hidden rounded-xl border border-line bg-subtle">
              <iframe
                src={info.map_embed_url}
                title="Map showing the location of KMO Islamic Academy"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="size-full border-0"
              />
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <dt className="text-[0.8125rem] text-faint">{label}</dt>
      <dd className="mt-1.5 text-[0.9375rem] leading-relaxed">{children}</dd>
    </div>
  );
}
