import { NextResponse } from "next/server";
import { normalizeEmail, EMAIL_REGEX, logRegistrationAttempt } from "@/lib/auth/registration";
import { isEmailVerificationRequired } from "@/lib/auth/config";
import { verifyRegistrationOtp } from "@/lib/auth/registration-otp";
import { setMfaVerifiedCookie } from "@/lib/auth/mfa-cookies";
import { enforceRateLimit } from "@/lib/security/rate-limit";

/** Confirm signup with the 6-digit code from email. */
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { bucket: "auth:verify-otp", limit: 20, windowSec: 3600 });
  if (limited) return limited;

  if (!isEmailVerificationRequired()) {
    return NextResponse.json({ error: "Email verification is currently disabled." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { email?: string; code?: string };
    const email = normalizeEmail(body.email || "");
    const code = String(body.code || "").trim();

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const result = await verifyRegistrationOtp(email, code);

    if (!result.success) {
      await logRegistrationAttempt(email, "verify_otp", false, result.error, {}, request);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await logRegistrationAttempt(email, "verify_otp", true, undefined, { userId: result.userId }, request);

    // Signup OTP counts as login MFA — skip a second code email after registration.
    if (result.userId) {
      await setMfaVerifiedCookie(result.userId);
    }

    return NextResponse.json({
      success: true,
      message: "Email verified. You can sign in now.",
      userId: result.userId,
      role: result.role,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
