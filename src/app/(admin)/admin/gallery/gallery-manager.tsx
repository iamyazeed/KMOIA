"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";

import { FormMessage, StatusBadge, SubmitButton } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import {
  addGalleryItems,
  removeGalleryItem,
  updateGalleryItem,
  type GalleryState,
} from "@/lib/actions/gallery";
import { cn } from "@/lib/utils/cn";
import type { ContentStatus } from "@/types/database";

export type GalleryItemView = {
  id: string;
  caption: string | null;
  displayOrder: number;
  status: ContentStatus;
  categoryId: string | null;
  mediaId: string;
  url: string;
  alt: string;
};

type MediaOption = { id: string; url: string; alt: string };

export function GalleryManager({
  items,
  categories,
  available,
  canWrite,
}: {
  items: GalleryItemView[];
  categories: { id: string; name: string }[];
  available: MediaOption[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<GalleryItemView | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [addCategory, setAddCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function submitAdd() {
    startTransition(async () => {
      const result = await addGalleryItems(selected, addCategory || null);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSelected([]);
      setAdding(false);
      router.refresh();
    });
  }

  return (
    <>
      {canWrite ? (
        <div>
          <Button onClick={() => setAdding(true)}>
            <ImagePlus />
            Add images
          </Button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-surface px-6 py-16 text-center text-muted">
          No images in the gallery yet.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-lg border border-line bg-surface"
            >
              <div className="relative aspect-4/3 bg-subtle">
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 p-3">
                <p className="line-clamp-2 text-xs text-muted">
                  {item.caption ?? (
                    <span className="italic text-faint">No caption</span>
                  )}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={item.status} />
                  <span className="text-[0.6875rem] tabular-nums text-faint">
                    #{item.displayOrder}
                  </span>
                </div>
                {canWrite ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditing(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Remove from gallery"
                      disabled={pending}
                      className="text-danger hover:bg-danger/10"
                      onClick={() =>
                        startTransition(async () => {
                          await removeGalleryItem(item.id);
                          router.refresh();
                        })
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add images */}
      <Modal open={adding} onOpenChange={setAdding}>
        <ModalContent
          title="Add images to the gallery"
          description="Pick from the Media Library. Images already in the gallery are not shown."
          size="lg"
          footer={
            <>
              <Button variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button
                disabled={selected.length === 0 || pending}
                onClick={submitAdd}
              >
                {pending
                  ? "Adding…"
                  : `Add ${selected.length || ""} image${selected.length === 1 ? "" : "s"}`}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-5">
            <div>
              <Label htmlFor="add-category">Category</Label>
              <select
                id="add-category"
                value={addCategory}
                onChange={(e) => setAddCategory(e.target.value)}
                className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
              >
                <option value="">Uncategorised</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {available.length === 0 ? (
              <p className="text-sm text-muted">
                Every image in the Media Library is already in the gallery.
                Upload more under Media Library.
              </p>
            ) : (
              <ul className="grid max-h-80 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
                {available.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      aria-pressed={selected.includes(item.id)}
                      className={cn(
                        "relative block aspect-4/3 w-full overflow-hidden rounded-md border transition-colors",
                        selected.includes(item.id)
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

            {error ? <p className="text-sm text-danger">{error}</p> : null}
          </div>
        </ModalContent>
      </Modal>

      {editing ? (
        <EditDialog
          item={editing}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </>
  );
}

function EditDialog({
  item,
  categories,
  onClose,
}: {
  item: GalleryItemView;
  categories: { id: string; name: string }[];
  onClose: () => void;
}) {
  const router = useRouter();
  const action = updateGalleryItem.bind(null, item.id);
  const [state, formAction] = useActionState<GalleryState, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      onClose();
      router.refresh();
    }
  }, [state?.success, onClose, router]);

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent title="Edit image" size="md">
        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="media_id" value={item.mediaId} />

          <div className="relative aspect-4/3 overflow-hidden rounded-md border border-line bg-subtle">
            <Image
              src={item.url}
              alt={item.alt}
              fill
              sizes="400px"
              className="object-cover"
            />
          </div>

          <div>
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              name="caption"
              rows={2}
              defaultValue={item.caption ?? ""}
            />
            <p className="mt-2 text-xs text-muted">
              Shown under the image in the lightbox. The screen-reader
              description comes from the Media Library.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="category_id">Category</Label>
              <select
                id="category_id"
                name="category_id"
                defaultValue={item.categoryId ?? ""}
                className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
              >
                <option value="">Uncategorised</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="display_order">Order</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                min={0}
                defaultValue={item.displayOrder}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={item.status}
              className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
            >
              <option value="draft">Draft — hidden</option>
              <option value="published">Published — visible</option>
            </select>
          </div>

          <FormMessage state={state} />

          <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <SubmitButton>Save changes</SubmitButton>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
