import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Service-role client. Bypasses RLS entirely.
 *
 * Reserved for operations that genuinely cannot be expressed under RLS —
 * inviting an administrator, scheduled maintenance, backups. Never import this
 * from a component, and never use it to "make a query work": if a query fails
 * under RLS, the policy is what needs fixing.
 *
 * `server-only` makes bundling this into client code a build error rather than
 * a leaked key.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. It must never be exposed to the browser.",
    );
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
