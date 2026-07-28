import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Admin 404.
 *
 * Scoped to the admin group so an unbuilt or mistyped `/admin/*` URL lands
 * somewhere that explains itself and offers a way back, rather than dropping
 * the user onto the public site's bare "page not found".
 */
export default function AdminNotFound() {
  return (
    <div className="flex max-w-lg flex-col items-start py-16">
      <p className="text-eyebrow uppercase text-faint">404</p>
      <h1 className="text-h2 mt-5">This screen doesn&rsquo;t exist yet.</h1>
      <p className="mt-4 leading-relaxed text-muted">
        The admin panel is being built in phases. Dashboard, Media Library and
        Faculty are available now; the remaining sections are marked
        &ldquo;Soon&rdquo; in the sidebar and will appear as they land.
      </p>
      <Button asChild className="mt-8">
        <Link href="/admin">Back to dashboard</Link>
      </Button>
    </div>
  );
}
