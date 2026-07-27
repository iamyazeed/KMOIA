"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { FormMessage, SubmitButton } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import type { FacultyState } from "@/lib/actions/faculty";
import { cn } from "@/lib/utils/cn";

export type MediaOption = {
  id: string;
  url: string;
  alt: string;
  filename: string;
};

export type FacultyDefaults = {
  name: string;
  designation: string;
  qualification: string;
  department_id: string | null;
  photo_media_id: string | null;
  biography: string | null;
  display_order: number;
  status: "draft" | "published";
};

/**
 * Faculty editor.
 *
 * Structured fields only — the committee edits values, never layout. The photo
 * is chosen from the Media Library rather than uploaded inline, so every
 * portrait already carries the enforced alt text and the 4:5 crop the public
 * grid depends on.
 */
export function FacultyForm({
  action,
  defaults,
  departments,
  media,
  submitLabel,
}: {
  action: (state: FacultyState, formData: FormData) => Promise<FacultyState>;
  defaults?: Partial<FacultyDefaults>;
  departments: { id: string; name: string }[];
  media: MediaOption[];
  submitLabel: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<FacultyState, FormData>(
    action,
    undefined,
  );

  const [photoId, setPhotoId] = useState<string | null>(
    defaults?.photo_media_id ?? null,
  );
  const [picking, setPicking] = useState(false);

  const photo = media.find((item) => item.id === photoId) ?? null;

  // Return to the list once a save reports success.
  useEffect(() => {
    if (state?.success) {
      router.push("/admin/faculty");
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-8">
      <input type="hidden" name="photo_media_id" value={photoId ?? ""} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={defaults?.name}
            placeholder="Muhammed Ali Musliyar"
          />
        </div>
        <div>
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            name="designation"
            required
            defaultValue={defaults?.designation}
            placeholder="Senior Lecturer"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="qualification">Qualification</Label>
          <Input
            id="qualification"
            name="qualification"
            required
            defaultValue={defaults?.qualification}
            placeholder="Hudawi, MA Islamic Studies"
          />
        </div>
        <div>
          <Label htmlFor="department_id">Department</Label>
          <select
            id="department_id"
            name="department_id"
            defaultValue={defaults?.department_id ?? ""}
            className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
          >
            <option value="">Unassigned</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="biography">Biography (optional)</Label>
        <Textarea
          id="biography"
          name="biography"
          rows={6}
          defaultValue={defaults?.biography ?? ""}
          placeholder="Areas of instruction, background and scholarly work."
        />
        <p className="mt-2 text-xs text-muted">
          When a biography is present, the public card opens a detail panel.
          Leave it empty and the card stays a simple portrait.
        </p>
      </div>

      <div>
        <Label>Portrait</Label>
        <div className="flex items-center gap-4">
          <div className="relative aspect-4/5 w-24 shrink-0 overflow-hidden rounded-md border border-line bg-subtle">
            {photo ? (
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                sizes="96px"
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
              onClick={() => setPicking(true)}
            >
              {photo ? "Change portrait" : "Choose portrait"}
            </Button>
            {photo ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPhotoId(null)}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="display_order">Display order</Label>
          <Input
            id="display_order"
            name="display_order"
            type="number"
            min={0}
            defaultValue={defaults?.display_order ?? 0}
          />
          <p className="mt-2 text-xs text-muted">
            Lower numbers appear first.
          </p>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaults?.status ?? "draft"}
            className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
          >
            <option value="draft">Draft — hidden from the site</option>
            <option value="published">Published — visible on the site</option>
          </select>
        </div>
      </div>

      <FormMessage state={state} />

      <div className="flex items-center gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/faculty")}
        >
          Cancel
        </Button>
      </div>

      <Modal open={picking} onOpenChange={setPicking}>
        <ModalContent
          title="Choose a portrait"
          description="Images come from the Media Library, where the 4:5 crop and description are already set."
          size="lg"
        >
          {media.length === 0 ? (
            <p className="text-sm text-muted">
              The media library is empty. Upload a portrait first under Media
              Library.
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoId(item.id);
                      setPicking(false);
                    }}
                    className={cn(
                      "relative block aspect-4/5 w-full overflow-hidden rounded-md border transition-colors",
                      photoId === item.id
                        ? "border-accent ring-2 ring-accent"
                        : "border-line hover:border-line-strong",
                    )}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ModalContent>
      </Modal>
    </form>
  );
}
