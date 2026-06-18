import { NextResponse } from "next/server";
import { normalizeEmail, EMAIL_REGEX } from "@/lib/auth/registration";
import { findUserByEmail, generateAuthLink, getAuthConfigError, getPasswordResetRedirectUrl } from "@/lib/auth/auth-links";
import { isResendConfigured, sendPasswordResetEmail } from "@/lib/email";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { logSecurityEvent } from "@/lib/auth/audit-log";

/** Password reset via Resend (not Supabase SMTP). */
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { bucket: "auth:forgot-password", limit: 5, windowSec: 3600 });
  if (limited) return limited;

  try {
    const body = (await request.json()) as { email?: string; turnstileToken?: string };
    const turnstile = await verifyTurnstileToken(body.turnstileToken, request);
    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.error }, { status: 400 });
    }

    const email = normalizeEmail(body.email || "");

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const configError = getAuthConfigError();
    if (configError) {
      return NextResponse.json(
        {
          error: "Password reset is not configured on the server.",
          code: "SERVICE_ROLE_MISSING",
          details: configError,
        },
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
    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists for this email, a reset link has been sent.",
      });
    }

    const { actionLink, error } = await generateAuthLink({
      type: "recovery",
      email,
      redirectTo: getPasswordResetRedirectUrl(),
    });

    if (error || !actionLink) {
      return NextResponse.json({ error: error || "Failed to generate reset link" }, { status: 500 });
    }

    const fullName =
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      undefined;

    const result = await sendPasswordResetEmail(email, actionLink, fullName);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send reset email" }, { status: 500 });
    }

    void logSecurityEvent(
      { eventType: "password_reset_requested", success: true, userId: user.id, email },
      request
    );

    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, a reset link has been sent.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send reset email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
