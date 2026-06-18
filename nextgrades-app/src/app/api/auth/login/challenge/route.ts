import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLoginEmailVerificationRequired, isAuthUserEmailVerified } from "@/lib/auth/config";
import { issueLoginOtp } from "@/lib/auth/login-otp";
import { hasValidTrustedDevice, setMfaVerifiedCookie } from "@/lib/auth/mfa-cookies";
import { logSecurityEvent } from "@/lib/auth/audit-log";
import { clearLoginLockout } from "@/lib/auth/lockout";
import { enforceRateLimit } from "@/lib/security/rate-limit";

/** After password login, issue login OTP or mark MFA satisfied (trusted device / MFA off). */
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { bucket: "auth:login-challenge", limit: 10, windowSec: 600 });
  if (limited) return limited;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAuthUserEmailVerified(user)) {
    return NextResponse.json({ error: "Email verification required", code: "EMAIL_NOT_VERIFIED" }, { status: 403 });
  }

  await clearLoginLockout(user.email, request);

  void logSecurityEvent(
    { eventType: "login_success", success: true, userId: user.id, email: user.email },
    request
  );

  if (!isLoginEmailVerificationRequired()) {
    await setMfaVerifiedCookie(user.id);
    return NextResponse.json({ mfaRequired: false, message: "Login complete." });
  }

  if (await hasValidTrustedDevice(user.id)) {
    await setMfaVerifiedCookie(user.id);
    return NextResponse.json({ mfaRequired: false, trustedDevice: true, message: "Trusted device recognized." });
  }

  const fullName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
    undefined;

  const result = await issueLoginOtp(user.id, user.email, fullName, request);
  if (!result.success) {
    return NextResponse.json({ error: result.error || "Failed to send login code" }, { status: 500 });
  }

  return NextResponse.json({
    mfaRequired: true,
    message: "We sent a login code to your email.",
    expiresAt: result.expiresAt,
  });
}
