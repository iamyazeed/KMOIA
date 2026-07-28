"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { MediaPicker, type MediaOption } from "@/components/admin/media-picker";
import { FormMessage, SubmitButton } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { CollectionState } from "@/lib/actions/collections";
import type { CollectionConfig, CollectionField } from "@/lib/admin/collections";
import { cn } from "@/lib/utils/cn";

const ICON_CHOICES = [
  "book-open", "heart", "star", "award", "graduation-cap", "utensils",
  "library", "laptop", "layout-template", "building-2", "palette",
  "clapperboard", "box", "shield", "languages", "sparkles", "users", "landmark",
];

/**
 * One form for every simple content type.
 *
 * Fields come from the collection config, so the eight remaining screens share
 * a single implementation — and therefore a single place to fix anything.
 */
export function CollectionForm({
  config,
  action,
  defaults,
  media,
  selectOptions,
  submitLabel,
}: {
  config: CollectionConfig;
  action: (
    state: CollectionState,
    formData: FormData,
  ) => Promise<CollectionState>;
  defaults?: Record<string, unknown>;
  media: MediaOption[];
  selectOptions: Record<string, { value: string; label: string }[]>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<CollectionState, FormData>(
    action,
    undefined,
  );

  const mediaFields = config.fields.filter((f) => f.type === "media");
  const [mediaValues, setMediaValues] = useState<Record<string, string | null>>(
    () =>
      Object.fromEntries(
        mediaFields.map((f) => [
          f.name,
          (defaults?.[f.name] as string | null) ?? null,
        ]),
      ),
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/admin/${config.slug}`);
      router.refresh();
    }
  }, [state?.success, router, config.slug]);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {config.fields.map((field) => (
          <div
            key={field.name}
            className={cn(field.half ? "sm:col-span-1" : "sm:col-span-2")}
          >
            <FieldControl
              field={field}
              defaultValue={defaults?.[field.name]}
              media={media}
              mediaValue={mediaValues[field.name] ?? null}
              onMediaChange={(id) =>
                setMediaValues((prev) => ({ ...prev, [field.name]: id }))
              }
              options={selectOptions[field.name]}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="display_order">Display order</Label>
          <Input
            id="display_order"
            name="display_order"
            type="number"
            min={0}
            defaultValue={(defaults?.display_order as number) ?? 0}
          />
          <p className="mt-2 text-xs text-muted">Lower numbers appear first.</p>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={(defaults?.status as string) ?? "draft"}
            className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
          >
            <option value="draft">Draft — hidden</option>
            <option value="published">Published — visible</option>
          </select>
        </div>
      </div>

      <FormMessage state={state} />

      <div className="flex items-center gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/admin/${config.slug}`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function FieldControl({
  field,
  defaultValue,
  media,
  mediaValue,
  onMediaChange,
  options,
}: {
  field: CollectionField;
  defaultValue: unknown;
  media: MediaOption[];
  mediaValue: string | null;
  onMediaChange: (id: string | null) => void;
  options?: { value: string; label: string }[];
}) {
  const id = `field-${field.name}`;
  const isMalayalam = field.name.endsWith("_ml");
  const value = defaultValue == null ? "" : String(defaultValue);

  if (field.type === "media") {
    return (
      <MediaPicker
        name={field.name}
        label={field.label}
        value={mediaValue}
        onChange={onMediaChange}
        media={media}
        aspect="16/9"
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2.5 pt-7 text-sm">
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={Boolean(defaultValue)}
          className="size-4 rounded border-line"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <select
          id={id}
          name={field.name}
          defaultValue={value}
          className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
        >
          {!field.required ? <option value="">None</option> : null}
          {(options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {field.help ? (
          <p className="mt-2 text-xs text-muted">{field.help}</p>
        ) : null}
      </div>
    );
  }

  if (field.type === "icon") {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <select
          id={id}
          name={field.name}
          defaultValue={value}
          className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
        >
          <option value="">None</option>
          {ICON_CHOICES.map((icon) => (
            <option key={icon} value={icon}>
              {icon.replace(/-/g, " ")}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <Textarea
          id={id}
          name={field.name}
          rows={field.rows ?? 3}
          lang={isMalayalam ? "ml" : undefined}
          required={field.required}
          defaultValue={value}
          placeholder={field.placeholder}
        />
        {field.help ? (
          <p className="mt-2 text-xs text-muted">{field.help}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={id}>{field.label}</Label>
      <Input
        id={id}
        name={field.name}
        type={field.type === "number" ? "number" : "text"}
        lang={isMalayalam ? "ml" : undefined}
        required={field.required}
        defaultValue={value}
        placeholder={field.placeholder}
      />
      {field.help ? (
        <p className="mt-2 text-xs text-muted">{field.help}</p>
      ) : null}
    </div>
  );
}
