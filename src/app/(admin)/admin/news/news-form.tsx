"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { RichTextEditor } from "@/components/admin/editor/rich-text-editor";
import { FormMessage, SubmitButton } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import type { NewsState } from "@/lib/actions/news";
import { cn } from "@/lib/utils/cn";
import type { ContentLanguage, RichTextDocument } from "@/types/database";

export type NewsDefaults = {
  primary_language: ContentLanguage;
  title: string;
  excerpt: string;
  body: RichTextDocument | null;
  title_ml: string;
  excerpt_ml: string;
  body_ml: RichTextDocument | null;
  category_id: string | null;
  cover_media_id: string | null;
  meta_description: string;
  status: "draft" | "published";
  published_at: string | null;
};

type MediaOption = { id: string; url: string; alt: string };

/**
 * Article editor.
 *
 * English and Malayalam are separate tabs, both optional, with an explicit
 * "written in" selector. There is no translate button anywhere — that rule is
 * enforced by omission, permanently. The chosen language drives `lang="ml"` on
 * the public page, the Malayalam typography, and correct indexing.
 */
export function NewsForm({
  action,
  defaults,
  categories,
  media,
  submitLabel,
}: {
  action: (state: NewsState, formData: FormData) => Promise<NewsState>;
  defaults?: Partial<NewsDefaults>;
  categories: { id: string; name: string }[];
  media: MediaOption[];
  submitLabel: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<NewsState, FormData>(
    action,
    undefined,
  );

  const [language, setLanguage] = useState<ContentLanguage>(
    defaults?.primary_language ?? "en",
  );
  const [tab, setTab] = useState<ContentLanguage>(
    defaults?.primary_language ?? "en",
  );
  const [body, setBody] = useState<RichTextDocument | null>(
    defaults?.body ?? null,
  );
  const [bodyMl, setBodyMl] = useState<RichTextDocument | null>(
    defaults?.body_ml ?? null,
  );
  const [coverId, setCoverId] = useState<string | null>(
    defaults?.cover_media_id ?? null,
  );
  const [picking, setPicking] = useState(false);

  const cover = media.find((m) => m.id === coverId) ?? null;

  useEffect(() => {
    if (state?.success) {
      router.push("/admin/news");
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} className="flex max-w-4xl flex-col gap-8">
      <input type="hidden" name="primary_language" value={language} />
      <input type="hidden" name="cover_media_id" value={coverId ?? ""} />
      <input
        type="hidden"
        name="body"
        value={body ? JSON.stringify(body) : ""}
      />
      <input
        type="hidden"
        name="body_ml"
        value={bodyMl ? JSON.stringify(bodyMl) : ""}
      />

      <div>
        <Label htmlFor="language">Written in</Label>
        <div className="flex gap-2">
          {(["en", "ml"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setLanguage(code);
                setTab(code);
              }}
              className={cn(
                "rounded-md border px-4 py-2 text-sm transition-colors",
                language === code
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {code === "en" ? "English" : "മലയാളം Malayalam"}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          The article is published exactly as written. Nothing is translated
          automatically.
        </p>
      </div>

      {/* Language tabs */}
      <div>
        <div className="flex gap-1 border-b border-line">
          {(["en", "ml"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setTab(code)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors",
                tab === code
                  ? "border-accent text-ink"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              {code === "en" ? "English" : "മലയാളം"}
              {language === code ? (
                <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-[0.625rem] uppercase text-accent">
                  Primary
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className={cn("pt-6", tab === "en" ? "block" : "hidden")}>
          <div className="flex flex-col gap-5">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={defaults?.title} />
            </div>
            <div>
              <Label htmlFor="excerpt">Summary</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                defaultValue={defaults?.excerpt}
              />
            </div>
            <div>
              <Label>Article</Label>
              <RichTextEditor value={body} onChange={setBody} lang="en" />
            </div>
          </div>
        </div>

        <div className={cn("pt-6", tab === "ml" ? "block" : "hidden")}>
          <div className="flex flex-col gap-5">
            <div>
              <Label htmlFor="title_ml">തലക്കെട്ട് (Title)</Label>
              <Input
                id="title_ml"
                name="title_ml"
                lang="ml"
                defaultValue={defaults?.title_ml}
              />
            </div>
            <div>
              <Label htmlFor="excerpt_ml">സംഗ്രഹം (Summary)</Label>
              <Textarea
                id="excerpt_ml"
                name="excerpt_ml"
                lang="ml"
                rows={2}
                defaultValue={defaults?.excerpt_ml}
              />
            </div>
            <div>
              <Label>ലേഖനം (Article)</Label>
              <RichTextEditor value={bodyMl} onChange={setBodyMl} lang="ml" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="category_id">Category</Label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={defaults?.category_id ?? ""}
            className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
          >
            <option value="">None</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaults?.status ?? "draft"}
            className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
          >
            <option value="draft">Draft — hidden</option>
            <option value="published">Published — visible</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="published_at">Publish date</Label>
          <Input
            id="published_at"
            name="published_at"
            type="datetime-local"
            defaultValue={
              defaults?.published_at
                ? new Date(defaults.published_at).toISOString().slice(0, 16)
                : ""
            }
          />
          <p className="mt-2 text-xs text-muted">
            A future date keeps the article hidden until then.
          </p>
        </div>
        <div>
          <Label htmlFor="meta_description">Search description</Label>
          <Textarea
            id="meta_description"
            name="meta_description"
            rows={2}
            defaultValue={defaults?.meta_description}
          />
        </div>
      </div>

      <div>
        <Label>Cover image</Label>
        <div className="flex items-center gap-4">
          <div className="relative aspect-[16/9] w-40 shrink-0 overflow-hidden rounded-md border border-line bg-subtle">
            {cover ? (
              <Image
                src={cover.url}
                alt={cover.alt}
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
              onClick={() => setPicking(true)}
            >
              {cover ? "Change" : "Choose"}
            </Button>
            {cover ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCoverId(null)}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <FormMessage state={state} />

      <div className="flex items-center gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/news")}
        >
          Cancel
        </Button>
      </div>

      <Modal open={picking} onOpenChange={setPicking}>
        <ModalContent title="Choose a cover image" size="lg">
          {media.length === 0 ? (
            <p className="text-sm text-muted">
              No images yet — upload one in the Media Library.
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverId(item.id);
                      setPicking(false);
                    }}
                    className={cn(
                      "relative block aspect-[4/3] w-full overflow-hidden rounded-md border transition-colors",
                      coverId === item.id
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
    </form>
  );
}
