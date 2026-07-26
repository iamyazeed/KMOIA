"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import { deleteMedia, updateMediaAltText } from "@/lib/actions/media";

export function MediaActions({
  id,
  altText,
}: {
  id: string;
  altText: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [value, setValue] = useState(altText);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateMediaAltText(id, value);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteMedia(id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-3.5" aria-hidden />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Delete image"
          onClick={() => setConfirming(true)}
          className="text-danger hover:bg-danger/10"
        >
          <Trash2 className="size-3.5" aria-hidden />
        </Button>
      </div>

      <Modal open={editing} onOpenChange={setEditing}>
        <ModalContent
          title="Edit description"
          description="What does this image show? Screen readers announce this text."
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </Button>
            </>
          }
        >
          <Label htmlFor={`alt-${id}`}>Description</Label>
          <Input
            id={`alt-${id}`}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Students in the computer laboratory"
          />
          {error ? <FieldError>{error}</FieldError> : null}
        </ModalContent>
      </Modal>

      <Modal open={confirming} onOpenChange={setConfirming}>
        <ModalContent
          title="Delete this image?"
          description="The file is removed permanently. Anywhere it is used, the image simply disappears — no page or article is deleted."
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button
                onClick={remove}
                disabled={pending}
                className="bg-danger hover:bg-danger/90"
              >
                {pending ? "Deleting…" : "Delete image"}
              </Button>
            </>
          }
        >
          {error ? <FieldError>{error}</FieldError> : null}
        </ModalContent>
      </Modal>
    </>
  );
}
