import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getNewsPosts, localiseNews } from "@/lib/queries/news";

export const metadata: Metadata = {
  title: "News",
  description:
    "Announcements, events and updates from KMO Islamic Academy Koduvally.",
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function NewsPage() {
  const posts = await getNewsPosts();

  return (
    <>
      <PageHero
        eyebrow="News"
        title="Announcements and updates."
        description="Notices from the academy, published in English or Malayalam."
      />

      <Section spacing="s2">
        <Container size="wide">
          {posts.length === 0 ? (
            <div className="max-w-lg py-8">
              <h2 className="text-h3">No announcements yet.</h2>
              <p className="mt-4 text-muted">
                Notices from the academy will appear here as they are published.
              </p>
            </div>
          ) : (
            <ul className="border-t border-line">
              {posts.map((post, index) => {
                const { lang, title, excerpt } = localiseNews(post);

                return (
                  <li key={post.id} className="border-b border-line">
                    <Reveal delay={Math.min(index * 0.03, 0.18)}>
                      <Link
                        href={`/news/${post.slug}`}
                        className="group grid gap-3 py-9 md:grid-cols-12 md:gap-8"
                      >
                        <div className="md:col-span-3">
                          <time
                            dateTime={post.published_at ?? undefined}
                            className="text-[0.8125rem] tabular-nums text-faint"
                          >
                            {post.published_at
                              ? dateFormat.format(new Date(post.published_at))
                              : ""}
                          </time>
                        </div>

                        <div className="md:col-span-7">
                          <h2
                            lang={lang}
                            className="text-h3 transition-colors duration-200 group-hover:text-accent"
                          >
                            {title}
                          </h2>
                          {excerpt ? (
                            <p
                              lang={lang}
                              className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-muted"
                            >
                              {excerpt}
                            </p>
                          ) : null}
                        </div>

                        <div className="md:col-span-2 md:text-right">
                          {post.category ? (
                            <span className="text-[0.8125rem] text-faint">
                              {post.category.name}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}
