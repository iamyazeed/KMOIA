"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Base overlay primitive, built on Radix Dialog so focus trapping, Escape
 * handling, scroll locking and aria wiring are correct by construction.
 *
 * This is the foundation the donation modal and gallery lightbox build on —
 * two of the three places glassmorphism is permitted.
 */

export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

type ModalContentProps = ComponentProps<typeof Dialog.Content> & {
  title: string;
  /** Hide the visible title but keep it for screen readers. */
  hideTitle?: boolean;
  description?: string;
  size?: "sm" | "md" | "lg";
  footer?: ReactNode;
};

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function ModalContent({
  className,
  children,
  title,
  hideTitle = false,
  description,
  size = "md",
  footer,
  ...props
}: ModalContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px]",
          "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
        )}
      />
      <Dialog.Content
        className={cn(
          "glass fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2",
          "rounded-xl border shadow-lift focus:outline-none",
          "max-h-[calc(100dvh-2rem)] overflow-y-auto",
          "data-[state=open]:animate-modal-in data-[state=closed]:animate-fade-out",
          sizes[size],
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-0">
          <div className="min-w-0">
            {hideTitle ? (
              <VisuallyHidden asChild>
                <Dialog.Title>{title}</Dialog.Title>
              </VisuallyHidden>
            ) : (
              <Dialog.Title className="text-h3">{title}</Dialog.Title>
            )}
            {description ? (
              <Dialog.Description className="mt-2 text-sm leading-relaxed text-muted">
                {description}
              </Dialog.Description>
            ) : (
              <VisuallyHidden asChild>
                <Dialog.Description>{title}</Dialog.Description>
              </VisuallyHidden>
            )}
          </div>
          <Dialog.Close
            aria-label="Close"
            className="-mr-1 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-[18px]" aria-hidden />
          </Dialog.Close>
        </div>

        <div className="p-6">{children}</div>

        {footer ? (
          <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">
            {footer}
          </div>
        ) : null}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
