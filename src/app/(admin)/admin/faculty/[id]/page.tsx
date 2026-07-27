import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FacultyForm } from "@/app/(admin)/admin/faculty/faculty-form";
import { loadFacultyFormOptions } from "@/app/(admin)/admin/faculty/options";
import { AdminPageHeader } from "@/components/admin/page-header";
import { updateFaculty, type FacultyState } from "@/lib/actions/faculty";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit faculty" };

export default async function EditFacultyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: member }, options] = await Promise.all([
    supabase
      .from("faculty")
      .select(
        "id, name, designation, qualification, department_id, photo_media_id, biography, display_order, status",
      )
      .eq("id", id)
      .maybeSingle(),
    loadFacultyFormOptions(),
  ]);

  if (!member) notFound();

  // Bind the id server-side so the client never supplies the record it edits.
  async function action(state: FacultyState, formData: FormData) {
    "use server";
    return updateFaculty(id, state, formData);
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={member.name}
        description="Changes appear on the public site as soon as they are saved, provided the member is published."
      />
      <FacultyForm
        action={action}
        defaults={{
          name: member.name,
          designation: member.designation,
          qualification: member.qualification,
          department_id: member.department_id,
          photo_media_id: member.photo_media_id,
          biography: member.biography,
          display_order: member.display_order,
          status: member.status,
        }}
        departments={options.departments}
        media={options.media}
        submitLabel="Save changes"
      />
    </div>
  );
}
