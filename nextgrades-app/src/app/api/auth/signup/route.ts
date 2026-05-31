import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import {
  emailExists,
  logRegistrationAttempt,
  normalizeEmail,
  validateSimpleRegistration,
  type SimpleRegistrationPayload,
} from "@/lib/auth/registration";
import { generateAuthLink, getAuthCallbackUrl, getAuthConfigError } from "@/lib/auth/auth-links";
import { isEmailVerificationRequired } from "@/lib/auth/config";
import { ensureRoleProfile } from "@/lib/auth/profile-setup";
import { sendVerificationEmail, sendWelcomeEmail, isResendConfigured } from "@/lib/email";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, { bucket: "auth:signup", limit: 10, windowSec: 3600 });
  if (limited) return limited;

  try {
    const body = (await request.json()) as SimpleRegistrationPayload;
    const email = normalizeEmail(body.email || "");
    const role = body.role === "teacher" ? "teacher" : "student";
    const fullName = body.fullName?.trim() || "";
    const verificationRequired = isEmailVerificationRequired();

    const validationError = validateSimpleRegistration({ ...body, email, role });
    if (validationError) {
      await logRegistrationAttempt(email, "signup", false, validationError, {}, request);
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (await emailExists(email)) {
      await logRegistrationAttempt(email, "signup", false, "Duplicate email", {}, request);
      return NextResponse.json(
        {
          error: "An account with this email already exists. Please sign in to continue.",
          code: "EMAIL_EXISTS",
        },
        { status: 409 }
      );
    }

    // No verification: create active account immediately (no domain / Resend needed)
    if (!verificationRequired && isSupabaseServiceRoleConfigured()) {
      const admin = createAdminClient();
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: body.password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
          await logRegistrationAttempt(email, "signup", false, error.message, {}, request);
          return NextResponse.json(
            {
              error: "An account with this email already exists. Please sign in to continue.",
              code: "EMAIL_EXISTS",
            },
            { status: 409 }
          );
        }
        await logRegistrationAttempt(email, "signup", false, error.message, {}, request);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const userId = data.user?.id;
      if (userId) {
        await ensureRoleProfile(admin, userId, role, {
          fullName,
          email,
          verified: true,
        });
      }

      if (isResendConfigured()) {
        void sendWelcomeEmail(email, fullName, role);
      }

      await logRegistrationAttempt(email, "signup", true, undefined, { userId, role, verificationSkipped: true }, request);

      if (userId) {
        const { notifyAdminNewRegistration, notifyAccountVerification } = await import("@/lib/notifications/triggers");
        void notifyAdminNewRegistration({ userId, role, name: fullName });
        void notifyAccountVerification(userId);
      }

      return NextResponse.json({
        success: true,
        message: "Account created! You can sign in now.",
        emailSent: false,
        verificationRequired: false,
      });
    }

    if (!verificationRequired && !isSupabaseServiceRoleConfigured()) {
      const configError = getAuthConfigError();
      return NextResponse.json(
        {
          error: "Registration service unavailable.",
          code: "SERVICE_ROLE_MISSING",
          details: configError,
        },
        { status: 503 }
      );
    }

    // Verification enabled: require Resend + generate link flow
    if (!isResendConfigured()) {
      return NextResponse.json(
        {
          error: "Email service is not configured. Set RESEND_API_KEY in .env.local.",
          code: "RESEND_MISSING",
        },
        { status: 503 }
      );
    }

    if (!isSupabaseServiceRoleConfigured()) {
      const configError = getAuthConfigError();
      return NextResponse.json(
        {
          error: "Registration service unavailable.",
          code: "SERVICE_ROLE_MISSING",
          details: configError,
        },
        { status: 503 }
      );
    }

    const redirectTo = getAuthCallbackUrl();
    const { actionLink: verifyUrl, userId, error: linkError } = await generateAuthLink({
      type: "signup",
      email,
      password: body.password,
      metadata: { full_name: fullName, role },
      redirectTo,
    });

    if (linkError) {
      const msg = linkError.toLowerCase();
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        await logRegistrationAttempt(email, "signup", false, linkError, {}, request);
        return NextResponse.json(
          {
            error: "An account with this email already exists. Please sign in to continue.",
            code: "EMAIL_EXISTS",
          },
          { status: 409 }
        );
      }
      await logRegistrationAttempt(email, "signup", false, linkError, {}, request);
      return NextResponse.json({ error: linkError }, { status: 500 });
    }

    if (userId) {
      const admin = createAdminClient();
      await ensureRoleProfile(admin, userId, role, {
        fullName,
        email,
        verified: false,
      });
    }

    if (!verifyUrl) {
      await logRegistrationAttempt(email, "signup", false, "Missing verification link", {}, request);
      return NextResponse.json({ error: "Failed to generate verification link" }, { status: 500 });
    }

    const emailResult = await sendVerificationEmail(email, verifyUrl, fullName);
    if (!emailResult.success) {
      await logRegistrationAttempt(
        email,
        "signup",
        true,
        emailResult.error || "Email send failed",
        { userId, role, emailSent: false },
        request
      );
      return NextResponse.json({
        success: true,
        message: "Account created! We could not deliver the verification email yet.",
        emailSent: false,
        emailError: emailResult.error,
        warning: true,
        verificationRequired: true,
      });
    }

    await logRegistrationAttempt(email, "signup", true, undefined, { userId, role }, request);
    return NextResponse.json({
      success: true,
      message: "Account created! Check your email to verify your address.",
      emailSent: true,
      verificationRequired: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    await logRegistrationAttempt(null, "signup", false, message, {}, request);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
