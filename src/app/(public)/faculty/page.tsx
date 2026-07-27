import type { Metadata } from "next";

import { FacultyDirectory } from "@/app/(public)/faculty/faculty-directory";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { mediaUrl } from "@/lib/queries/utils";
import { getDepartments, getFaculty } from "@/lib/queries/faculty";

export const metadata: Metadata = {
  title: "Faculty",
  description:
    "The scholars and teachers of KMO Islamic Academy Koduvally — qualifications, departments and areas of instruction.",
};

export default async function FacultyPage() {
  const [faculty, departments] = await Promise.all([
    getFaculty(),
    getDepartments(),
  ]);

  const members = faculty.map((person) => ({
    id: person.id,
    slug: person.slug,
    name: person.name,
    designation: person.designation,
    qualification: person.qualification,
    biography: person.biography,
    departmentId: person.department?.id ?? null,
    departmentName: person.department?.name ?? null,
    photoUrl: person.photo
      ? mediaUrl(person.photo.bucket, person.photo.storage_path)
      : null,
    photoAlt: person.photo?.alt_text ?? "",
    blurhash: person.photo?.blurhash ?? null,
  }));

  return (
    <>
      <PageHero
        eyebrow="Faculty"
        title="The teachers this academy is built on."
        description="Teaching is the first of the institution's three missions. These are the scholars who carry it."
      />

      <Section spacing="s2">
        <Container size="wide">
          {members.length === 0 ? (
            <div className="max-w-lg py-12">
              <h2 className="text-h3">Faculty profiles are being prepared.</h2>
              <p className="mt-4 text-muted">
                The academy&rsquo;s teaching staff will be published here
                shortly.
              </p>
            </div>
          ) : (
            <FacultyDirectory
              members={members}
              departments={departments.map((d) => ({ id: d.id, name: d.name }))}
            />
          )}
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
