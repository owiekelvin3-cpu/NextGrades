import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import {
  emailExists,
  generateOtpCode,
  logRegistrationAttempt,
  normalizeEmail,
  EMAIL_REGEX,
  usernameExists,
  USERNAME_REGEX,
} from "@/lib/auth/registration";
import { sendVerificationCodeEmail } from "@/lib/email";

export async function POST(request: Request) {
  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Registration service unavailable" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { email?: string; username?: string; type?: string };
    const type = body.type || "email";

    if (type === "username") {
      const username = (body.username || "").trim();
      if (!USERNAME_REGEX.test(username)) {
        return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
      }
      const exists = await usernameExists(username);
      return NextResponse.json({ exists, username });
    }

    const email = normalizeEmail(body.email || "");
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (await emailExists(email)) {
      await logRegistrationAttempt(email, "send_otp", false, "Email already registered", {}, request);
      return NextResponse.json(
        {
          error: "An account with this email already exists. Please sign in to continue.",
          code: "EMAIL_EXISTS",
        },
        { status: 409 }
      );
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const admin = createAdminClient();

    await admin.from("registration_otps").insert({
      email,
      code,
      verified: false,
      attempts: 0,
      expires_at: expiresAt,
    });

    const emailResult = await sendVerificationCodeEmail(email, code);
    if (!emailResult.success) {
      await logRegistrationAttempt(email, "send_otp", false, emailResult.error, {}, request);
      return NextResponse.json({ error: emailResult.error || "Failed to send verification code" }, { status: 500 });
    }

    await logRegistrationAttempt(email, "send_otp", true, undefined, {}, request);
    return NextResponse.json({ success: true, expiresIn: 600 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    await logRegistrationAttempt(null, "send_otp", false, message, {}, request);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
