import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { logRegistrationAttempt, normalizeEmail, EMAIL_REGEX } from "@/lib/auth/registration";

export async function POST(request: Request) {
  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Verification service unavailable" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { email?: string; code?: string };
    const email = normalizeEmail(body.email || "");
    const code = (body.code || "").trim();

    if (!EMAIL_REGEX.test(email) || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Invalid email or verification code" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: otpRow, error } = await admin
      .from("registration_otps")
      .select("*")
      .eq("email", email)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !otpRow) {
      await logRegistrationAttempt(email, "verify_otp", false, "No OTP found", {}, request);
      return NextResponse.json({ error: "Verification code expired or not found. Request a new one." }, { status: 400 });
    }

    if (new Date(otpRow.expires_at) < new Date()) {
      await logRegistrationAttempt(email, "verify_otp", false, "OTP expired", {}, request);
      return NextResponse.json({ error: "Verification code has expired. Request a new one." }, { status: 400 });
    }

    if (otpRow.attempts >= 5) {
      return NextResponse.json({ error: "Too many attempts. Request a new verification code." }, { status: 429 });
    }

    if (otpRow.code !== code) {
      await admin
        .from("registration_otps")
        .update({ attempts: (otpRow.attempts || 0) + 1 })
        .eq("id", otpRow.id);
      await logRegistrationAttempt(email, "verify_otp", false, "Invalid code", {}, request);
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    await admin.from("registration_otps").update({ verified: true }).eq("id", otpRow.id);
    await logRegistrationAttempt(email, "verify_otp", true, undefined, {}, request);

    return NextResponse.json({ verified: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    await logRegistrationAttempt(null, "verify_otp", false, message, {}, request);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function isOtpVerified(email: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("registration_otps")
    .select("verified, expires_at")
    .eq("email", email)
    .eq("verified", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return false;
  return new Date(data.expires_at) > new Date(Date.now() - 30 * 60 * 1000);
}

export { isOtpVerified };
