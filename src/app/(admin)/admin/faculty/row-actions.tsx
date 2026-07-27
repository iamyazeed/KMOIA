"use client";

import { Eye, EyeOff, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import {
  deleteFaculty,
  restoreFaculty,
  setFacultyStatus,
} from "@/lib/actions/faculty";
import type { ContentStatus } from "@/types/database";

export function FacultyRowActions({
  id,
  status,
  inTrash,
}: {
  id: string;
  status: ContentStatus;
  inTrash: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string } | undefined>) {
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setError(result.error);
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  if (inTrash) {
    return (
      <>
        <Button
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={() => run(() => restoreFaculty(id))}
        >
          <RotateCcw />
          Restore
        </Button>
        {error ? <FieldError>{error}</FieldError> : null}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() =>
            run(() =>
              setFacultyStatus(id, status === "published" ? "draft" : "published"),
            )
          }
        >
          {status === "published" ? <EyeOff /> : <Eye />}
          <span className="hidden sm:inline">
            {status === "published" ? "Unpublish" : "Publish"}
          </span>
        </Button>

        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/faculty/${id}`}>
            <Pencil />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Delete"
          onClick={() => setConfirming(true)}
          className="text-danger hover:bg-danger/10"
        >
          <Trash2 />
        </Button>
      </div>

      <Modal open={confirming} onOpenChange={setConfirming}>
        <ModalContent
          title="Move to trash?"
          description="The member is removed from the public site immediately. Nothing is destroyed — you can restore them from the Trash tab."
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button
                disabled={pending}
                onClick={() => run(() => deleteFaculty(id))}
                className="bg-danger hover:bg-danger/90"
              >
                {pending ? "Moving…" : "Move to trash"}
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
