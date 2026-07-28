"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

export type AuthState = { error?: string } | undefined;

/** Admin routes that actually exist and are safe to land on after sign-in. */
const ADMIN_DESTINATIONS = [
  "/admin",
  "/admin/faculty",
  "/admin/media",
  "/admin/news",
  "/admin/gallery",
  "/admin/sponsorship",
  "/admin/sponsorship/donation-method",
  "/admin/sponsorship/rice",
  "/admin/sponsorship/intents",
];

/**
 * Resolves where to send someone after signing in.
 *
 * The `next` parameter is set by the proxy from whatever URL was originally
 * requested, so it can point at a path that does not exist — visiting
 * `/admin/login` produced `next=/admin/login`, and returning there after a
 * successful sign-in landed the user on a 404. Only known destinations are
 * honoured; anything else falls back to the dashboard.
 *
 * This also closes the open-redirect vector: an attacker-supplied `next`
 * can never leave the site.
 */
/** Sections with per-record editors: `/admin/news/new`, `/admin/faculty/<id>`. */
const DYNAMIC_PARENTS = ["/admin/faculty", "/admin/news"];

function safeDestination(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/admin";

  // Compare without query or hash so `/admin/news?view=trash` still works.
  const path = next.split(/[?#]/)[0].replace(/\/+$/, "") || "/admin";

  // Exact matches only. A prefix test would re-admit the original bug, since
  // `/admin/login` starts with `/admin`.
  if (ADMIN_DESTINATIONS.includes(path)) return next;

  // Allow exactly one further segment under sections that have record pages.
  const editor = DYNAMIC_PARENTS.some((parent) => {
    if (!path.startsWith(`${parent}/`)) return false;
    const rest = path.slice(parent.length + 1);
    return rest.length > 0 && !rest.includes("/");
  });

  return editor ? next : "/admin";
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  // Deliberately vague: a distinct "no such user" message would let anyone
  // enumerate which email addresses have accounts.
  if (error || !data.user) {
    return { error: "Incorrect email or password" };
  }

  // A user whose access was revoked must not get in even with valid credentials.
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return { error: "This account is not active. Contact a super admin." };
  }

  revalidatePath("/", "layout");
  redirect(safeDestination(parsed.data.next));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
