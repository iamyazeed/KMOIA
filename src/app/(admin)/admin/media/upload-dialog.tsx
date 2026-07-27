"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Modal, ModalContent, ModalTrigger } from "@/components/ui/modal";
import { registerMedia } from "@/lib/actions/media";
import { prepareImage, storageFilename } from "@/lib/utils/image";
import { createClient } from "@/lib/supabase/client";
import {
  ACCEPTED_IMAGE_TYPES,
  ASPECT_PRESETS,
  MAX_UPLOAD_BYTES,
  MEDIA_FOLDERS,
} from "@/lib/validation/media";

export function UploadDialog({ bucket = "public-media" as const }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [decorative, setDecorative] = useState(false);
  const [folder, setFolder] = useState<(typeof MEDIA_FOLDERS)[number]>("general");
  const [aspect, setAspect] = useState<string>("original");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ratio = ASPECT_PRESETS.find((p) => p.id === aspect)?.ratio ?? null;
  const canSubmit = Boolean(file) && (decorative || altText.trim().length >= 3);

  function reset() {
    setFile(null);
    setAltText("");
    setDecorative(false);
    setAspect("original");
    setError(null);
  }

  async function handleUpload() {
    if (!file) return;
    setError(null);

    try {
      // Crop, resize and convert to WebP in the browser, then upload the
      // result straight to Storage — the binary never passes through a
      // serverless function.
      const prepared = await prepareImage(file, ratio);
      const filename = storageFilename(file.name);
      const supabase = createClient();

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, prepared.blob, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: false,
        });

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        return;
      }

      const result = await registerMedia({
        filename,
        mime_type: "image/webp",
        size_bytes: prepared.blob.size,
        width: prepared.width,
        height: prepared.height,
        blurhash: prepared.placeholder,
        alt_text: altText,
        is_decorative: decorative,
        folder,
        bucket,
      });

      if (result?.error) {
        // Roll back the orphaned file so Storage and the library stay in sync.
        await supabase.storage.from(bucket).remove([filename]);
        setError(result.error);
        return;
      }

      reset();
      setOpen(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <ModalTrigger asChild>
        <Button>
          <Upload className="size-4" aria-hidden />
          Upload image
        </Button>
      </ModalTrigger>

      <ModalContent
        title="Upload image"
        description="Images are cropped, resized and converted to WebP automatically."
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              disabled={!canSubmit || pending}
              onClick={() => startTransition(handleUpload)}
            >
              {pending ? "Uploading…" : "Upload"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <div>
            <Label htmlFor="media-file">Image file</Label>
            <input
              id="media-file"
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                if (selected && selected.size > MAX_UPLOAD_BYTES) {
                  setError("That file is larger than 20 MB.");
                  return;
                }
                setError(null);
                setFile(selected);
              }}
              className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm file:mr-3 file:rounded file:border-0 file:bg-subtle file:px-3 file:py-1.5 file:text-sm"
            />
            {file ? (
              <p className="mt-2 text-xs text-muted">
                {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="media-aspect">Crop</Label>
              <select
                id="media-aspect"
                value={aspect}
                onChange={(event) => setAspect(event.target.value)}
                className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
              >
                {ASPECT_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="media-folder">Folder</Label>
              <select
                id="media-folder"
                value={folder}
                onChange={(event) =>
                  setFolder(event.target.value as (typeof MEDIA_FOLDERS)[number])
                }
                className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm capitalize"
              >
                {MEDIA_FOLDERS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="media-alt">Description (alt text)</Label>
            <Input
              id="media-alt"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              disabled={decorative}
              placeholder="Students in the computer laboratory"
              aria-describedby="media-alt-help"
            />
            <p id="media-alt-help" className="mt-2 text-xs text-muted">
              Describe what the image shows. This is read aloud to visitors using
              a screen reader and is required — the site cannot stay accessible
              without it.
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={decorative}
                onChange={(event) => setDecorative(event.target.checked)}
                className="size-4 rounded border-line"
              />
              This image is decorative only
            </label>
          </div>

          {error ? <FieldError>{error}</FieldError> : null}
        </div>
      </ModalContent>
    </Modal>
  );
}
