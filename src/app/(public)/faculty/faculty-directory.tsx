"use client";

import { X } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils/cn";

export type FacultyMemberView = {
  id: string;
  slug: string;
  name: string;
  designation: string;
  qualification: string;
  biography: string | null;
  departmentId: string | null;
  departmentName: string | null;
  photoUrl: string | null;
  photoAlt: string;
  blurhash: string | null;
};

/**
 * Faculty directory.
 *
 * Portraits in a fixed 4:5 frame — the crop is enforced at upload, so the grid
 * stays even no matter what the committee uploads. There is no card chrome:
 * the photograph is the object, and the name sits beneath it on white. Hover
 * lifts the image slightly and warms nothing else.
 *
 * A member with a biography opens a drawer rather than its own page; thirty
 * pages holding three lines each would dilute the domain rather than help it.
 */
export function FacultyDirectory({
  members,
  departments,
}: {
  members: FacultyMemberView[];
  departments: { id: string; name: string }[];
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const [active, setActive] = useState<FacultyMemberView | null>(null);
  const reduceMotion = useReducedMotion();

  const visible = filter
    ? members.filter((m) => m.departmentId === filter)
    : members;

  // Only offer filters that actually have people behind them.
  const usable = departments.filter((d) =>
    members.some((m) => m.departmentId === d.id),
  );

  return (
    <>
      {usable.length > 1 ? (
        <div className="mb-14 flex flex-wrap gap-1">
          <FilterButton active={filter === null} onClick={() => setFilter(null)}>
            All
          </FilterButton>
          {usable.map((department) => (
            <FilterButton
              key={department.id}
              active={filter === department.id}
              onClick={() => setFilter(department.id)}
            >
              {department.name}
            </FilterButton>
          ))}
        </div>
      ) : null}

      <ul className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((member, index) => {
          const openable = Boolean(member.biography);

          return (
            <m.li
              key={member.id}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: Math.min(index * 0.04, 0.24),
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <button
                type="button"
                disabled={!openable}
                onClick={() => openable && setActive(member)}
                className={cn(
                  "group block w-full text-left",
                  openable ? "cursor-pointer" : "cursor-default",
                )}
              >
                <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-subtle">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={member.photoAlt}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      placeholder={member.blurhash ? "blur" : "empty"}
                      blurDataURL={member.blurhash ?? undefined}
                      className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-display text-2xl text-faint">
                        {member.name
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="mt-5 font-display text-[1.0625rem] font-medium tracking-[-0.02em]">
                  {member.name}
                </h3>
                <p className="mt-1 text-[0.875rem] text-muted">
                  {member.designation}
                </p>
                <p className="mt-0.5 text-[0.8125rem] text-faint">
                  {member.qualification}
                </p>
              </button>
            </m.li>
          );
        })}
      </ul>

      <Dialog.Root
        open={Boolean(active)}
        onOpenChange={(open) => !open && setActive(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-[min(34rem,100vw)] overflow-y-auto bg-paper p-8 shadow-lg focus:outline-none data-[state=open]:animate-drawer-in data-[state=closed]:animate-fade-out sm:p-10">
            {active ? (
              <>
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <Dialog.Title className="text-h2">
                      {active.name}
                    </Dialog.Title>
                    <p className="mt-3 text-muted">{active.designation}</p>
                  </div>
                  <Dialog.Close
                    aria-label="Close"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-subtle hover:text-ink"
                  >
                    <X className="size-5" aria-hidden />
                  </Dialog.Close>
                </div>

                <dl className="mt-8 border-t border-line pt-6 text-[0.9375rem]">
                  <div className="flex justify-between gap-6 py-2">
                    <dt className="text-faint">Qualification</dt>
                    <dd className="text-right">{active.qualification}</dd>
                  </div>
                  {active.departmentName ? (
                    <div className="flex justify-between gap-6 py-2">
                      <dt className="text-faint">Department</dt>
                      <dd className="text-right">{active.departmentName}</dd>
                    </div>
                  ) : null}
                </dl>

                {active.biography ? (
                  <Dialog.Description asChild>
                    <p className="mt-8 whitespace-pre-line leading-relaxed text-muted">
                      {active.biography}
                    </p>
                  </Dialog.Description>
                ) : null}
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md px-3.5 py-2 text-[0.875rem] transition-colors duration-200",
        active ? "bg-ink text-paper" : "text-muted hover:bg-subtle hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
