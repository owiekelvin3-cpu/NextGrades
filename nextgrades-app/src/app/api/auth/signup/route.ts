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
import { sendVerificationEmail, isResendConfigured } from "@/lib/email";

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function POST(request: Request) {
  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Registration service unavailable" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as SimpleRegistrationPayload;
    const email = normalizeEmail(body.email || "");
    const role = body.role === "teacher" ? "teacher" : "student";
    const fullName = body.fullName?.trim() || "";

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

    const admin = createAdminClient();
    const redirectTo = `${getAppUrl()}/auth/callback`;

    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password: body.password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
        redirectTo,
      },
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
      await admin
        .from("profiles")
        .update({
          full_name: fullName,
          email,
          role,
          email_verified: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    const verifyUrl = data.properties?.action_link;
    if (verifyUrl && isResendConfigured()) {
      await sendVerificationEmail(email, verifyUrl, fullName);
    }

    await logRegistrationAttempt(email, "signup", true, undefined, { userId, role }, request);

    return NextResponse.json({
      success: true,
      message: isResendConfigured()
        ? "Account created! Check your email to verify your address and access your dashboard."
        : "Account created! Please check your email to verify your address.",
      emailSent: Boolean(verifyUrl && isResendConfigured()),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    await logRegistrationAttempt(null, "signup", false, message, {}, request);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
