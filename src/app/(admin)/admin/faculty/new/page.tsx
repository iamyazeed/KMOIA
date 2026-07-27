import type { Metadata } from "next";

import { FacultyForm } from "@/app/(admin)/admin/faculty/faculty-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { createFaculty } from "@/lib/actions/faculty";
import { requireAdmin } from "@/lib/auth";
import { loadFacultyFormOptions } from "@/app/(admin)/admin/faculty/options";

export const metadata: Metadata = { title: "Add faculty" };

export default async function NewFacultyPage() {
  await requireAdmin();
  const { departments, media } = await loadFacultyFormOptions();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Add faculty"
        description="New members are saved as drafts until you publish them."
      />
      <FacultyForm
        action={createFaculty}
        departments={departments}
        media={media}
        submitLabel="Add faculty member"
      />
    </div>
  );
}
