import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { SessionProfile } from "@/lib/roles";

export type { SessionProfile } from "@/lib/roles";
export { ROLE_LABELS, canWrite } from "@/lib/roles";

/**
 * Session and role helpers for the admin panel.
 *
 * These are the second of three layers. Middleware keeps anonymous users out of
 * `/admin` at the edge; these helpers decide what a signed-in user may see; RLS
 * decides what the database will actually return. Never rely on any one alone.
 */

/** The signed-in user's profile, or null. Never throws. */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();

  // getUser() revalidates with Supabase. getSession() reads the cookie and is
  // not trustworthy for authorisation decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data || !data.is_active) return null;

  return data;
}

/** Any active admin-panel user, including read-only viewers. */
export async function requireStaff(): Promise<SessionProfile> {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  return profile;
}

/** Users who may write content: editors and super admins. */
export async function requireAdmin(): Promise<SessionProfile> {
  const profile = await requireStaff();
  if (profile.role === "viewer") redirect("/admin?denied=1");
  return profile;
}

export async function requireSuperAdmin(): Promise<SessionProfile> {
  const profile = await requireStaff();
  if (profile.role !== "super_admin") redirect("/admin?denied=1");
  return profile;
}

