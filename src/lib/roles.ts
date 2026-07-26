import type { Profile, UserRole } from "@/types/database";

/**
 * Role helpers shared by server and client code.
 *
 * Deliberately separate from `lib/auth.ts`, which is `server-only`: client
 * components such as the admin topbar need the labels and the profile shape,
 * and importing them from the server module would drag the Supabase server
 * client into the browser bundle.
 */

export type SessionProfile = Pick<
  Profile,
  "id" | "full_name" | "email" | "role" | "avatar_url" | "is_active"
>;

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  editor: "Editor",
  viewer: "Viewer",
};

/** Editors and super admins may write content; viewers are read-only. */
export function canWrite(role: UserRole) {
  return role === "super_admin" || role === "editor";
}
