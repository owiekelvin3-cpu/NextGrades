import { supabase } from "@/lib/supabase/client";

/** Safe redirect path — only internal app routes. */
export function sanitizeRedirect(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  if (path.startsWith("/login") || path.startsWith("/auth")) return null;
  return path;
}

export function buildLoginUrl(redirectTo?: string | null, mode?: "signup"): string {
  const params = new URLSearchParams();
  const safe = sanitizeRedirect(redirectTo);
  if (safe) params.set("redirect", safe);
  if (mode === "signup") params.set("mode", "signup");
  const q = params.toString();
  return q ? `/login?${q}` : "/login";
}

export async function getDashboardPathForUser(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return "/login";
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();
  const role = profile?.role || "student";
  return `/dashboard/${role}`;
}
