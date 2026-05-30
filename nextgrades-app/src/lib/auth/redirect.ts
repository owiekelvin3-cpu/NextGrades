import { supabase } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/auth/roles";
import { resolveUserRole } from "@/lib/auth/roles";

/** Safe redirect path — only internal app routes. */
export function sanitizeRedirect(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  if (path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/auth")) return null;
  return path;
}

export function getDashboardPathForRole(role: AppRole): string {
  return `/dashboard/${role}`;
}

/** Whether a role may access a given app path. */
export function canRoleAccessPath(role: AppRole, path: string): boolean {
  if (path.startsWith("/admin")) return role === "admin";
  if (path.startsWith("/dashboard/admin")) return role === "admin";
  if (path.startsWith("/dashboard/teacher")) return role === "teacher";
  if (path.startsWith("/dashboard/student")) return role === "student";
  if (path.startsWith("/dashboard/chat")) return true;
  return false;
}

/** Pick redirect target after login — never send users to another role's dashboard. */
export function resolvePostAuthRedirect(role: AppRole, redirectTo: string | null | undefined): string {
  const safe = sanitizeRedirect(redirectTo);
  if (safe && canRoleAccessPath(role, safe)) return safe;
  return getDashboardPathForRole(role);
}

export function buildLoginUrl(redirectTo?: string | null, mode?: "signup"): string {
  const params = new URLSearchParams();
  const safe = sanitizeRedirect(redirectTo);
  if (safe) params.set("redirect", safe);
  if (mode === "signup") params.set("mode", "signup");
  const q = params.toString();
  return q ? `/login?${q}` : "/login";
}

export async function fetchProfileRole(userId: string): Promise<AppRole | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const { data: { user } } = await supabase.auth.getUser();
  return resolveUserRole(profile?.role, user?.user_metadata);
}

export async function getDashboardPathForUser(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return "/login";
  const role = await fetchProfileRole(session.user.id);
  if (!role) return "/choose-role";
  return getDashboardPathForRole(role);
}
