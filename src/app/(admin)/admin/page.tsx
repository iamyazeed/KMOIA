import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

import { AdminIcon } from "@/components/admin/icon";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Dashboard.
 *
 * Answers the three questions a committee member actually opens the panel to
 * ask: is anything waiting for me, what changed recently, and is the site
 * correctly configured.
 */
export default async function AdminDashboard() {
  const profile = await requireStaff();
  const supabase = await createClient();

  const [
    unreadMessages,
    pendingIntents,
    publishedNews,
    galleryCount,
    facultyCount,
    donationMethod,
    recentMessages,
    recentNews,
  ] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false)
      .eq("is_archived", false),
    supabase
      .from("donation_intents")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("news_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .is("deleted_at", null),
    supabase
      .from("gallery_items")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("faculty")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("donation_methods")
      .select("id, type, label")
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("contact_messages")
      .select("id, name, subject, message, created_at, is_read")
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("news_posts")
      .select("id, slug, title, title_ml, status, published_at, primary_language")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  // A fresh project has no tables until migrations are pushed. Say so plainly
  // rather than rendering a wall of zeroes that looks like real data.
  const notMigrated = unreadMessages.error?.code === "PGRST205";

  const tiles = [
    {
      label: "Unread messages",
      value: unreadMessages.count ?? 0,
      href: "/admin/messages",
      icon: "mail",
    },
    {
      label: "Donation enquiries",
      value: pendingIntents.count ?? 0,
      href: "/admin/sponsorship/intents",
      icon: "heart-handshake",
    },
    {
      label: "Published news",
      value: publishedNews.count ?? 0,
      href: "/admin/news",
      icon: "newspaper",
    },
    {
      label: "Gallery images",
      value: galleryCount.count ?? 0,
      href: "/admin/gallery",
      icon: "images",
    },
    {
      label: "Faculty members",
      value: facultyCount.count ?? 0,
      href: "/admin/faculty",
      icon: "users",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={`Welcome back, ${profile.full_name.split(" ")[0]}`}
        description="An overview of what needs your attention across the website."
      />

      {notMigrated ? (
        <EmptyState
          title="The database is not set up yet"
          description="Run `npm run db:push` to apply the migrations to this Supabase project, then reload this page."
        />
      ) : (
        <>
          {!donationMethod.data ? (
            <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/8 p-4">
              <AlertTriangle
                className="mt-0.5 size-5 shrink-0 text-warning"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  No donation method is configured
                </p>
                <p className="mt-1 text-sm text-muted">
                  Visitors cannot sponsor a student until a UPI ID and QR code
                  are set up.
                </p>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href="/admin/sponsorship/donation-method">Set up</Link>
              </Button>
            </div>
          ) : null}

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {tiles.map((tile) => (
              <li key={tile.label}>
                <Link href={tile.href} className="block">
                  <Card variant="elevated" interactive className="h-full">
                    <CardBody className="p-5">
                      <AdminIcon
                        name={tile.icon}
                        className="size-5 text-accent"
                      />
                      <p className="mt-4 font-display text-3xl font-semibold">
                        {tile.value}
                      </p>
                      <p className="mt-1 text-sm text-muted">{tile.label}</p>
                    </CardBody>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card variant="elevated">
              <CardBody>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-medium">
                    Recent messages
                  </h2>
                  <Button asChild variant="link" size="sm">
                    <Link href="/admin/messages">
                      View all
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </Button>
                </div>

                {recentMessages.data && recentMessages.data.length > 0 ? (
                  <ul className="mt-4 flex flex-col divide-y divide-line">
                    {recentMessages.data.map((message) => (
                      <li key={message.id} className="py-3">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {message.name}
                          </p>
                          {!message.is_read ? (
                            <Badge variant="accent">New</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted">
                          {message.subject ?? message.message}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted">
                    No messages yet.
                  </p>
                )}
              </CardBody>
            </Card>

            <Card variant="elevated">
              <CardBody>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-medium">
                    Recent news
                  </h2>
                  <Button asChild variant="link" size="sm">
                    <Link href="/admin/news">
                      View all
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </Button>
                </div>

                {recentNews.data && recentNews.data.length > 0 ? (
                  <ul className="mt-4 flex flex-col divide-y divide-line">
                    {recentNews.data.map((post) => (
                      <li
                        key={post.id}
                        className="flex items-center gap-3 py-3"
                      >
                        <p
                          className="min-w-0 flex-1 truncate text-sm"
                          lang={post.primary_language === "ml" ? "ml" : undefined}
                        >
                          {post.primary_language === "ml"
                            ? post.title_ml
                            : post.title}
                        </p>
                        <Badge
                          variant={
                            post.status === "published" ? "brand" : "neutral"
                          }
                        >
                          {post.status === "published" ? "Published" : "Draft"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted">
                    No articles yet.
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
