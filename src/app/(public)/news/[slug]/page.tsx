import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RichText } from "@/components/news/rich-text";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getNewsPost, localiseNews } from "@/lib/queries/news";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPost(slug);

  if (!post) return { title: "Article not found" };

  const { title, excerpt } = localiseNews(post);

  return {
    title: post.meta_title ?? title,
    description: post.meta_description ?? excerpt ?? undefined,
    openGraph: { type: "article", title, description: excerpt ?? undefined },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getNewsPost(slug);

  if (!post) notFound();

  const { lang, title, excerpt } = localiseNews(post);
  const body = lang === "ml" ? post.body_ml : post.body;

  return (
    <article>
      <Section spacing="s1" className="-mt-16 pt-32">
        <Container size="wide">
          <Link
            href="/news"
            className="text-[0.875rem] text-muted transition-colors hover:text-ink"
          >
            ← News
          </Link>

          <div className="mt-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-x-4 text-[0.8125rem] text-faint">
              {post.published_at ? (
                <time dateTime={post.published_at}>
                  {dateFormat.format(new Date(post.published_at))}
                </time>
              ) : null}
              {post.category ? <span>{post.category.name}</span> : null}
            </div>

            <h1 lang={lang} className="text-h1 mt-6">
              {title}
            </h1>

            {excerpt ? (
              <p lang={lang} className="text-lead mt-7 text-muted">
                {excerpt}
              </p>
            ) : null}
          </div>
        </Container>
      </Section>

      <Section spacing="s1">
        <Container size="wide">
          <div className="max-w-[var(--container-prose)]">
            <RichText doc={body} lang={lang} />
          </div>
        </Container>
      </Section>
    </article>
  );
}
