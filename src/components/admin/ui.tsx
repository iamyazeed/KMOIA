"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { ContentStatus } from "@/types/database";

/** Submit button that disables and shows progress while an action runs. */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  ...props
}: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <Badge variant={status === "published" ? "brand" : "neutral"}>
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface px-6 py-16 text-center",
        className,
      )}
    >
      <h2 className="font-display text-lg font-medium">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function FormMessage({
  state,
}: {
  state?: { error?: string; success?: string };
}) {
  if (!state?.error && !state?.success) return null;

  const isError = Boolean(state.error);

  return (
    <p
      role={isError ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3 py-2.5 text-sm",
        isError
          ? "border-danger/30 bg-danger/8 text-danger"
          : "border-success/30 bg-success/8 text-success",
      )}
    >
      {state.error ?? state.success}
    </p>
  );
}
