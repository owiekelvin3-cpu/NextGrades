import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAuthUserEmailVerified, isLoginEmailVerificationRequired } from "@/lib/auth/config";
import { isLoginMfaSatisfied } from "@/lib/auth/mfa-cookies";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ authenticated: false, mfaRequired: false, emailVerified: false });
  }

  const emailVerified = isAuthUserEmailVerified(user);
  const loginOtpEnabled = isLoginEmailVerificationRequired();
  const mfaSatisfied = await isLoginMfaSatisfied(user.id);

  return NextResponse.json({
    authenticated: true,
    emailVerified,
    loginOtpEnabled,
    mfaRequired: loginOtpEnabled && emailVerified && !mfaSatisfied,
    mfaSatisfied,
  });
}
