import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Anonymous, cookie-free client for public page data.
 *
 * Public pages are statically rendered and revalidated by tag, so they must not
 * read cookies — doing so would opt them into dynamic rendering and forfeit
 * ISR. This client sees exactly what an anonymous visitor sees, enforced by
 * RLS, which is precisely what a public page should render.
 *
 * Construction is deferred and a missing environment degrades to a stub rather
 * than throwing. `createClient` raises "supabaseUrl is required" when unset,
 * and evaluating that at module scope turns a missing env var into a hard
 * build failure during page-data collection — which is exactly how every
 * Vercel deployment of this project failed. The stub returns the same
 * `{ data: null, error }` shape every query already handles, so an
 * unconfigured environment renders curated fallback content instead of
 * breaking the build.
 */

const MISSING_ENV_ERROR = {
  message:
    "Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are unset.",
  code: "ENV_MISSING",
  details: null,
  hint: null,
};

/** A chainable no-op that resolves to the standard error result. */
function createStubClient(): SupabaseClient<Database> {
  const result = { data: null, error: MISSING_ENV_ERROR };

  const builder: unknown = new Proxy(
    {},
    {
      get(_target, property) {
        // Awaiting the builder resolves to the error result.
        if (property === "then") {
          return (resolve: (value: typeof result) => unknown) =>
            Promise.resolve(result).then(resolve);
        }
        // Every other member is a chainable method returning the builder.
        return () => builder;
      },
    },
  );

  return {
    from: () => builder,
    storage: { from: () => builder },
  } as unknown as SupabaseClient<Database>;
}

let cached: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  cached =
    url && key
      ? createSupabaseClient<Database>(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : createStubClient();

  return cached;
}

export const supabasePublic = new Proxy({} as SupabaseClient<Database>, {
  get(_target, property, receiver) {
    return Reflect.get(getClient(), property, receiver);
  },
});
