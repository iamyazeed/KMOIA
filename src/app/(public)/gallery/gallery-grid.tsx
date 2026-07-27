"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  width: number;
  height: number;
  blurhash: string | null;
  categoryId: string | null;
};

/**
 * Gallery.
 *
 * A masonry-style column layout with intrinsic aspect ratios preserved, so
 * images are never cropped and never shift the page while loading — the
 * width/height from the media table reserve the space up front, which is what
 * keeps CLS at zero.
 *
 * The lightbox is a Radix Dialog, so focus trapping and Escape are correct;
 * arrow keys move between images.
 */
export function GalleryGrid({
  images,
  categories,
}: {
  images: GalleryImage[];
  categories: { id: string; name: string }[];
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const visible = filter
    ? images.filter((image) => image.categoryId === filter)
    : images;

  const usable = categories.filter((category) =>
    images.some((image) => image.categoryId === category.id),
  );

  const move = useCallback(
    (delta: number) => {
      setIndex((current) => {
        if (current === null) return current;
        return (current + delta + visible.length) % visible.length;
      });
    },
    [visible.length],
  );

  useEffect(() => {
    if (index === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, move]);

  const active = index === null ? null : visible[index];

  return (
    <>
      {usable.length > 1 ? (
        <div className="mb-12 flex flex-wrap gap-1">
          <FilterButton active={filter === null} onClick={() => setFilter(null)}>
            All
          </FilterButton>
          {usable.map((category) => (
            <FilterButton
              key={category.id}
              active={filter === category.id}
              onClick={() => setFilter(category.id)}
            >
              {category.name}
            </FilterButton>
          ))}
        </div>
      ) : null}

      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {visible.map((image, position) => (
          <m.button
            key={image.id}
            type="button"
            onClick={() => setIndex(position)}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-lg bg-subtle"
            aria-label={image.caption ?? image.alt ?? "View image"}
          >
            <Image
              src={image.url}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              placeholder={image.blurhash ? "blur" : "empty"}
              blurDataURL={image.blurhash ?? undefined}
              className="h-auto w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
            />
          </m.button>
        ))}
      </div>

      <Dialog.Root
        open={active !== null}
        onOpenChange={(open) => !open && setIndex(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[#06090f]/94 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col focus:outline-none data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out">
            <Dialog.Title className="sr-only">
              {active?.caption ?? "Gallery image"}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Use the left and right arrow keys to move between images.
            </Dialog.Description>

            <div className="flex h-16 shrink-0 items-center justify-between px-5">
              <span className="text-[0.8125rem] text-white/50">
                {index !== null ? `${index + 1} / ${visible.length}` : ""}
              </span>
              <Dialog.Close
                aria-label="Close"
                className="inline-flex size-10 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" aria-hidden />
              </Dialog.Close>
            </div>

            {active ? (
              <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => move(-1)}
                  className="absolute left-2 z-10 inline-flex size-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:left-6"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>

                <Image
                  src={active.url}
                  alt={active.alt}
                  width={active.width}
                  height={active.height}
                  sizes="100vw"
                  className="max-h-full w-auto max-w-full object-contain"
                  priority
                />

                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => move(1)}
                  className="absolute right-2 z-10 inline-flex size-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:right-6"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              </div>
            ) : null}

            {active?.caption ? (
              <p className="shrink-0 px-6 pb-8 text-center text-[0.875rem] text-white/60">
                {active.caption}
              </p>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md px-3.5 py-2 text-[0.875rem] transition-colors duration-200",
        active ? "bg-ink text-paper" : "text-muted hover:bg-subtle hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
