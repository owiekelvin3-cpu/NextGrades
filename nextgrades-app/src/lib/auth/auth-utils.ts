import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";
import {
  getApiAuth,
  requireApiRole,
  type AuthProfile,
  type AppRole,
} from "@/lib/auth/api-auth";
import {
  isAuthUserEmailVerified,
  isSignupEmailVerificationRequired,
} from "@/lib/auth/config";
import { isLoginMfaSatisfied } from "@/lib/auth/mfa-cookies";
import { resolveUserRole } from "@/lib/auth/roles";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function enforceSecureSession(
  user: User | null,
  options?: { skipLoginOtp?: boolean }
): Promise<string | null> {
  if (!user) return "Unauthorized";

  if (isSignupEmailVerificationRequired() && !isAuthUserEmailVerified(user)) {
    return "Email verification required";
  }

  if (!options?.skipLoginOtp && !(await isLoginMfaSatisfied(user.id))) {
    return "Login verification required";
  }

  return null;
}

type AuthResult = {
  user: User | null;
  profile: AuthProfile | null;
  error: string | null;
};

async function secureAuthFromClient(supabase: SupabaseServerClient): Promise<AuthResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, profile: null, error: "Unauthorized" };
  }

  const profileClient = isSupabaseServiceRoleConfigured() ? createAdminClient() : supabase;
  const { data: profileRow } = await profileClient
    .from("profiles")
    .select("id, role, full_name, email, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileRow?.is_active === false) {
    return { user: null, profile: null, error: "Unauthorized" };
  }

  const resolvedRole = resolveUserRole(profileRow?.role, user.user_metadata);
  if (!resolvedRole) {
    return { user: null, profile: null, error: "Profile not found" };
  }

  const secureError = await enforceSecureSession(user, {
    skipLoginOtp: resolvedRole === "admin",
  });
  if (secureError) {
    return { user: null, profile: null, error: secureError };
  }

  return {
    user,
    profile: {
      id: user.id,
      role: resolvedRole,
      full_name: profileRow?.full_name ?? (user.user_metadata?.full_name as string | null) ?? null,
      email: profileRow?.email ?? user.email ?? null,
      is_active: profileRow?.is_active ?? true,
    },
    error: null,
  };
}

export async function requireAuth(supabase: SupabaseServerClient) {
  return secureAuthFromClient(supabase);
}

export async function requireRole(supabase: SupabaseServerClient, role: string) {
  const auth = await secureAuthFromClient(supabase);

  if (!auth.user) {
    return { user: null, profile: null, error: auth.error ?? "Unauthorized" };
  }

  if (auth.profile?.role !== role) {
    return { user: null, profile: null, error: "Forbidden" };
  }

  return auth;
}

export async function requireTeacherOrAdmin(supabase: SupabaseServerClient) {
  const auth = await secureAuthFromClient(supabase);
  if (!auth.user) return { ...auth, error: auth.error ?? "Unauthorized" };
  if (!auth.profile || !requireApiRole(auth.profile, ["teacher", "admin"])) {
    return { user: null, profile: null, error: "Forbidden" };
  }
  return auth;
}

/** Prefer api-auth gates for new routes; this resolves auth without an existing client. */
export async function requireAuthenticatedSession(): Promise<
  | { error: string; user: null; profile: null; supabase: null }
  | { error: null; user: User; profile: AuthProfile; supabase: SupabaseServerClient }
> {
  const gate = await getApiAuth();
  if (!gate.user || !gate.profile) {
    return { error: "Unauthorized", user: null, profile: null, supabase: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const secureError = await enforceSecureSession(user);
  if (secureError) {
    return { error: secureError, user: null, profile: null, supabase: null };
  }

  return { error: null, user: user!, profile: gate.profile, supabase };
}

export async function requireRoleSession(roles: AppRole[]) {
  const session = await requireAuthenticatedSession();
  if (session.error || !session.profile) return session;
  if (!roles.includes(session.profile.role)) {
    return { error: "Forbidden", user: null, profile: null, supabase: null };
  }
  return session;
}
