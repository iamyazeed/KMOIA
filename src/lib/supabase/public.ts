import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Anonymous, cookie-free client for public page data.
 *
 * Public pages are statically rendered and revalidated by tag, so they must not
 * read cookies — doing so would opt them into dynamic rendering and forfeit
 * ISR. This client sees exactly what an anonymous visitor sees, enforced by
 * RLS, which is precisely what a public page should render.
 */
export const supabasePublic = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
