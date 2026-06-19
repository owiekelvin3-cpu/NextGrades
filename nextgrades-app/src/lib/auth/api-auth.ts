import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { resolveUserRole, type AppRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  isAuthUserEmailVerified,
  isSignupEmailVerificationRequired,
} from "@/lib/auth/config";
import { isLoginMfaSatisfied } from "@/lib/auth/mfa-cookies";

export type { AppRole } from "@/lib/auth/roles";

export type AuthProfile = {
  id: string;
  role: AppRole;
  full_name: string | null;
  email?: string | null;
  is_active?: boolean;
};

type ApiAuthContext = {
  user: User;
  profile: AuthProfile;
  supabase: SupabaseClient;
};

export async function getApiAuth(supabase?: SupabaseClient): Promise<{
  user: User | null;
  profile: AuthProfile | null;
  supabase: SupabaseClient;
}> {
  const client = supabase ?? (await createClient());
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user) {
    return { user: null, profile: null, supabase: client };
  }

  const profileClient = isSupabaseServiceRoleConfigured() ? createAdminClient() : client;
  const { data: profile } = await profileClient
    .from("profiles")
    .select("id, role, full_name, email, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_active === false) {
    return { user: null, profile: null, supabase: client };
  }

  const resolvedRole = resolveUserRole(profile?.role, user.user_metadata);

  if (!resolvedRole) {
    return { user, profile: null, supabase: client };
  }

  return {
    user,
    profile: {
      id: user.id,
      role: resolvedRole,
      full_name: profile?.full_name ?? (user.user_metadata?.full_name as string | null) ?? null,
      email: profile?.email ?? user.email ?? null,
      is_active: profile?.is_active ?? true,
    },
    supabase: client,
  };
}

export function requireApiRole(profile: AuthProfile | null, roles: AppRole[]) {
  return profile !== null && roles.includes(profile.role);
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export type AuthGateResult =
  | { error: NextResponse; auth: null }
  | { error: null; auth: ApiAuthContext };

async function enforceSecureSession(
  user: User,
  options?: { skipLoginOtp?: boolean }
): Promise<NextResponse | null> {
  if (isSignupEmailVerificationRequired() && !isAuthUserEmailVerified(user)) {
    return forbidden("Email verification required");
  }

  if (!options?.skipLoginOtp && !(await isLoginMfaSatisfied(user.id))) {
    return forbidden("Login verification required");
  }

  return null;
}

export async function requireAdminApi(): Promise<AuthGateResult> {
  const auth = await getApiAuth();
  if (!auth.user) return { error: unauthorized(), auth: null };
  if (!auth.profile || auth.profile.role !== "admin") {
    return { error: forbidden(), auth: null };
  }

  const secureError = await enforceSecureSession(auth.user, { skipLoginOtp: true });
  if (secureError) return { error: secureError, auth: null };

  return { error: null, auth: auth as ApiAuthContext };
}

export async function requireTeacherOrAdminApi(): Promise<AuthGateResult> {
  const auth = await getApiAuth();
  if (!auth.user) return { error: unauthorized(), auth: null };
  if (!auth.profile || !requireApiRole(auth.profile, ["teacher", "admin"])) {
    return { error: forbidden(), auth: null };
  }

  const secureError = await enforceSecureSession(auth.user);
  if (secureError) return { error: secureError, auth: null };

  return { error: null, auth: auth as ApiAuthContext };
}

export async function requireAuthenticatedApi(): Promise<AuthGateResult> {
  const auth = await getApiAuth();
  if (!auth.user || !auth.profile) {
    return { error: unauthorized("Unauthorized or profile incomplete"), auth: null };
  }

  const secureError = await enforceSecureSession(auth.user);
  if (secureError) return { error: secureError, auth: null };

  return { error: null, auth: auth as ApiAuthContext };
}
