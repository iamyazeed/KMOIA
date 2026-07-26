import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Next 16 renamed the `middleware` convention to `proxy`.
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /**
   * Runs on admin and login routes only.
   *
   * Public pages are deliberately excluded: touching cookies there would opt
   * them out of static rendering and forfeit ISR, which is the whole basis of
   * the site's performance budget.
   */
  matcher: ["/admin/:path*", "/login"],
};
