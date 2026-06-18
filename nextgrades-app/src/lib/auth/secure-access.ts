import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isAuthUserEmailVerified,
  isSignupEmailVerificationRequired,
  isLoginEmailVerificationRequired,
} from "@/lib/auth/config";
import { isLoginMfaSatisfied } from "@/lib/auth/mfa-cookies";
import { requireAuthenticatedApi, forbidden, type AuthGateResult } from "@/lib/auth/api-auth";

/** Requires authenticated user with verified email and login MFA (when enabled). */
export async function requireSecureApiAccess(): Promise<AuthGateResult> {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), auth: null };
  }

  if (isSignupEmailVerificationRequired() && !isAuthUserEmailVerified(user)) {
    return { error: forbidden("Email verification required"), auth: null };
  }

  if (isLoginEmailVerificationRequired() && !(await isLoginMfaSatisfied(user.id))) {
    return { error: forbidden("Login verification required"), auth: null };
  }

  return gate;
}
