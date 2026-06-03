import { NextResponse } from "next/server";
import { normalizeEmail, EMAIL_REGEX } from "@/lib/auth/registration";
import { findUserByEmail, getAuthConfigError } from "@/lib/auth/auth-links";
import { isEmailVerificationRequired } from "@/lib/auth/config";
import { issueRegistrationOtp } from "@/lib/auth/registration-otp";
import { isResendConfigured } from "@/lib/email";
import { enforceRateLimit } from "@/lib/security/rate-limit";

/** Send or resend the 6-digit signup verification code. */
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, { bucket: "auth:send-otp", limit: 5, windowSec: 3600 });
  if (limited) return limited;

  if (!isEmailVerificationRequired()) {
    return NextResponse.json(
      { error: "Email verification is currently disabled. You can sign in directly after registering." },
      { status: 400 }
    );
  }

  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email || "");

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const configError = getAuthConfigError();
    if (configError) {
      return NextResponse.json(
        { error: "Verification service is not configured.", code: "SERVICE_ROLE_MISSING", details: configError },
        { status: 503 }
      );
    }

    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: "Email service is not configured. Set RESEND_API_KEY in .env.local.", code: "RESEND_MISSING" },
        { status: 503 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "No account found for this email. Please sign up first." }, { status: 404 });
    }

    if (user.email_confirmed_at) {
      return NextResponse.json(
        { error: "This email is already verified. You can sign in.", code: "ALREADY_VERIFIED" },
        { status: 400 }
      );
    }

    const fullName =
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      undefined;

    const result = await issueRegistrationOtp(email, fullName);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send verification code" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent. Check your inbox and spam folder.",
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send verification code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
