import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsForm } from "@/app/(admin)/admin/news/news-form";
import { loadNewsFormOptions } from "@/app/(admin)/admin/news/options";
import { AdminPageHeader } from "@/components/admin/page-header";
import { updateNews, type NewsState } from "@/lib/actions/news";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { NewsPost } from "@/types/database";

export const metadata: Metadata = { title: "Edit article" };

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: post }, options] = await Promise.all([
    supabase
      .from("news_posts")
      .select(
        "id, title, excerpt, body, title_ml, excerpt_ml, body_ml, primary_language, category_id, cover_media_id, meta_description, status, published_at",
      )
      .eq("id", id)
      .maybeSingle<NewsPost>(),
    loadNewsFormOptions(),
  ]);

  if (!post) notFound();

  // Bind the id server-side so the client never supplies the record it edits.
  async function action(state: NewsState, formData: FormData) {
    "use server";
    return updateNews(id, state, formData);
  }

  const heading =
    post.primary_language === "ml" ? post.title_ml : post.title;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={heading ?? "Untitled article"}
        description="Changes appear on the website as soon as they are saved, provided the article is published."
      />
      <NewsForm
        action={action}
        defaults={{
          primary_language: post.primary_language,
          title: post.title ?? "",
          excerpt: post.excerpt ?? "",
          body: post.body,
          title_ml: post.title_ml ?? "",
          excerpt_ml: post.excerpt_ml ?? "",
          body_ml: post.body_ml,
          category_id: post.category_id,
          cover_media_id: post.cover_media_id,
          meta_description: post.meta_description ?? "",
          status: post.status,
          published_at: post.published_at,
        }}
        categories={options.categories}
        media={options.media}
        submitLabel="Save changes"
      />
    </div>
  );
}
