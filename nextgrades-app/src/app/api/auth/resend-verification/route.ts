import { NextResponse } from "next/server";
import { normalizeEmail, EMAIL_REGEX } from "@/lib/auth/registration";
import { findUserByEmail, generateAuthLink, getAuthCallbackUrl, getAuthConfigError } from "@/lib/auth/auth-links";
import { isResendConfigured, sendVerificationEmail } from "@/lib/email";

import { isEmailVerificationRequired } from "@/lib/auth/config";

/** Resend signup verification email via Resend. */
export async function POST(request: Request) {
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
        {
          error: "Verification emails are not configured on the server.",
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
    if (!user) {
      return NextResponse.json({ error: "No account found for this email. Please sign up first." }, { status: 404 });
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ error: "This email is already verified. You can sign in.", code: "ALREADY_VERIFIED" }, { status: 400 });
    }

    const fullName =
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      undefined;

    const { actionLink, error } = await generateAuthLink({
      type: "magiclink",
      email,
      redirectTo: getAuthCallbackUrl(),
    });

    if (error || !actionLink) {
      return NextResponse.json({ error: error || "Failed to generate verification link" }, { status: 500 });
    }

    const result = await sendVerificationEmail(email, actionLink, fullName);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send verification email" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent. Check your inbox and spam folder.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to resend verification email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
