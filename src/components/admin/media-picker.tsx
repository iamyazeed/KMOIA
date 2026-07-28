"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import { cn } from "@/lib/utils/cn";

export type MediaOption = { id: string; url: string; alt: string };

/**
 * Image chooser.
 *
 * Always picks from the Media Library rather than uploading inline, so every
 * image already carries the alt text the upload flow enforces. That is what
 * keeps the site accessible without relying on anyone remembering.
 */
export function MediaPicker({
  name,
  label,
  value,
  onChange,
  media,
  aspect = "4/3",
}: {
  name: string;
  label: string;
  value: string | null;
  onChange: (id: string | null) => void;
  media: MediaOption[];
  aspect?: "4/3" | "4/5" | "16/9";
}) {
  const [open, setOpen] = useState(false);
  const selected = media.find((item) => item.id === value) ?? null;

  const ratio =
    aspect === "4/5"
      ? "aspect-4/5 w-24"
      : aspect === "16/9"
        ? "aspect-[16/9] w-40"
        : "aspect-4/3 w-32";

  return (
    <div>
      <input type="hidden" name={name} value={value ?? ""} />
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-md border border-line bg-subtle",
            ratio,
          )}
        >
          {selected ? (
            <Image
              src={selected.url}
              alt={selected.alt}
              fill
              sizes="160px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-faint">
              None
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setOpen(true)}
          >
            {selected ? "Change image" : "Choose image"}
          </Button>
          {selected ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent title={`Choose ${label.toLowerCase()}`} size="lg">
          {media.length === 0 ? (
            <p className="text-sm text-muted">
              The Media Library is empty. Upload an image there first.
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "relative block aspect-4/3 w-full overflow-hidden rounded-md border transition-colors",
                      value === item.id
                        ? "border-accent ring-2 ring-accent"
                        : "border-line hover:border-line-strong",
                    )}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt}
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
