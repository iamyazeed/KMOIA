import type { Metadata } from "next";

import { GalleryGrid } from "@/app/(public)/gallery/gallery-grid";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getGalleryCategories, getGalleryItems } from "@/lib/queries/gallery";
import { mediaUrl } from "@/lib/queries/utils";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photographs of campus, academics, events and student life at KMO Islamic Academy Koduvally.",
};

export default async function GalleryPage() {
  const [items, categories] = await Promise.all([
    getGalleryItems(),
    getGalleryCategories(),
  ]);

  const images = items
    .filter((item) => item.media)
    .map((item) => ({
      id: item.id,
      url: mediaUrl(item.media!.bucket, item.media!.storage_path),
      alt: item.media!.alt_text,
      caption: item.caption,
      // Intrinsic dimensions reserve layout space, keeping CLS at zero.
      width: item.media!.width ?? 1200,
      height: item.media!.height ?? 900,
      blurhash: item.media!.blurhash,
      categoryId: item.category?.id ?? null,
    }));

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="The campus, in photographs."
        description="Academic life, events and the everyday at KMO Islamic Academy."
      />

      <Section spacing="s2">
        <Container size="wide">
          {images.length === 0 ? (
            <div className="max-w-lg py-8">
              <h2 className="text-h3">Photographs are being prepared.</h2>
              <p className="mt-4 text-muted">
                Images of campus and academy life will be published here
                shortly.
              </p>
            </div>
          ) : (
            <GalleryGrid
              images={images}
              categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            />
          )}
        </Container>
      </Section>
    </>
  );
}
