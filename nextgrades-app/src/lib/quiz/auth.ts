import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  isAuthUserEmailVerified,
  isSignupEmailVerificationRequired,
} from "@/lib/auth/config";
import { isLoginMfaSatisfied } from "@/lib/auth/mfa-cookies";
import { resolveUserRole } from "@/lib/auth/roles";

export type AuthProfile = {
  id: string;
  role: "student" | "teacher" | "admin";
  full_name: string | null;
};

type AuthSupabase = {
  auth: { getUser: () => Promise<{ data: { user: User | null }; error: unknown }> };
  from: (table: string) => unknown;
};

async function enforceSecureSession(user: User): Promise<string | null> {
  if (isSignupEmailVerificationRequired() && !isAuthUserEmailVerified(user)) {
    return "Email verification required";
  }
  if (!(await isLoginMfaSatisfied(user.id))) {
    return "Login verification required";
  }
  return null;
}

export async function getAuthProfile(supabase: AuthSupabase): Promise<{
  user: { id: string } | null;
  profile: AuthProfile | null;
  error: string | null;
}> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, profile: null, error: "Unauthorized" };
  }

  const secureError = await enforceSecureSession(user);
  if (secureError) {
    return { user: null, profile: null, error: secureError };
  }

  const { data: profileRow, error: profileError } = await (supabase.from("profiles") as {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{
          data: { id: string; role: string; full_name: string | null; is_active?: boolean } | null;
          error: unknown;
        }>;
      };
    };
  })
    .select("id, role, full_name, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profileRow || profileRow.is_active === false) {
    return { user: null, profile: null, error: "Profile not found" };
  }

  const resolvedRole = resolveUserRole(profileRow.role, user.user_metadata);
  if (!resolvedRole) {
    return { user: null, profile: null, error: "Profile not found" };
  }

  return {
    user: { id: user.id },
    profile: {
      id: user.id,
      role: resolvedRole as AuthProfile["role"],
      full_name: profileRow.full_name,
    },
    error: null,
  };
}

export function requireRole(profile: AuthProfile, roles: AuthProfile["role"][]) {
  return roles.includes(profile.role);
}

/** Secure profile lookup using the server Supabase client. */
export async function getSecureAuthProfile() {
  const supabase = await createClient();
  return getAuthProfile(supabase);
}
