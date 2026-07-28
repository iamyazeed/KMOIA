import type { Metadata } from "next";

import { NewsForm } from "@/app/(admin)/admin/news/news-form";
import { loadNewsFormOptions } from "@/app/(admin)/admin/news/options";
import { AdminPageHeader } from "@/components/admin/page-header";
import { createNews } from "@/lib/actions/news";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Write article" };

export default async function NewNewsPage() {
  await requireAdmin();
  const { categories, media } = await loadNewsFormOptions();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Write article"
        description="Articles save as drafts until you publish them."
      />
      <NewsForm
        action={createNews}
        categories={categories}
        media={media}
        submitLabel="Create article"
      />
    </div>
  );
}
