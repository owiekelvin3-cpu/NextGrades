import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { sendVerificationCodeEmail, isResendConfigured } from "@/lib/email";
import { findUserByEmail } from "@/lib/auth/auth-links";
import { normalizeEmail } from "@/lib/auth/registration";
import { generateSixDigitCode, hashOtpCode, verifyOtpHash } from "@/lib/auth/otp-crypto";

const OTP_TTL_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;

export async function issueRegistrationOtp(email: string, fullName?: string) {
  if (!isSupabaseServiceRoleConfigured() || !isResendConfigured()) {
    return { success: false, error: "Verification service is not configured" };
  }

  const normalized = normalizeEmail(email);
  const code = generateSixDigitCode();
  const codeHash = hashOtpCode(code, normalized);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  const admin = createAdminClient();

  await admin.from("registration_otps").delete().eq("email", normalized).eq("verified", false);

  const { error: insertError } = await admin.from("registration_otps").insert({
    email: normalized,
    code: codeHash,
    verified: false,
    attempts: 0,
    expires_at: expiresAt,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  const emailResult = await sendVerificationCodeEmail(normalized, code, fullName);
  if (!emailResult.success) {
    return { success: false, error: emailResult.error || "Failed to send verification email" };
  }

  return { success: true, expiresAt };
}

export async function verifyRegistrationOtp(email: string, code: string) {
  if (!isSupabaseServiceRoleConfigured()) {
    return { success: false, error: "Verification service is not configured" };
  }

  const normalized = normalizeEmail(email);
  const trimmedCode = code.replace(/\D/g, "").trim();

  if (trimmedCode.length !== 6) {
    return { success: false, error: "Please enter the 6-digit code from your email." };
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: otpRow, error: fetchError } = await admin
    .from("registration_otps")
    .select("id, code, verified, attempts, expires_at")
    .eq("email", normalized)
    .eq("verified", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!otpRow) {
    return { success: false, error: "No verification code found. Request a new code." };
  }

  if (otpRow.verified) {
    return { success: false, error: "This code was already used." };
  }

  if (new Date(otpRow.expires_at) < new Date()) {
    return { success: false, error: "This code has expired. Request a new code." };
  }

  if (otpRow.attempts >= MAX_VERIFY_ATTEMPTS) {
    return { success: false, error: "Too many attempts. Request a new code." };
  }

  const codeMatches =
    otpRow.code.length === 64 && /^[a-f0-9]+$/.test(otpRow.code)
      ? verifyOtpHash(trimmedCode, normalized, otpRow.code)
      : otpRow.code === trimmedCode;

  if (!codeMatches) {
    await admin
      .from("registration_otps")
      .update({ attempts: otpRow.attempts + 1 })
      .eq("id", otpRow.id);
    return { success: false, error: "Invalid code. Please check your email and try again." };
  }

  const user = await findUserByEmail(normalized);
  if (!user) {
    return { success: false, error: "Account not found. Please sign up again." };
  }

  const { error: confirmError } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });

  if (confirmError) {
    return { success: false, error: confirmError.message };
  }

  await admin
    .from("registration_otps")
    .update({ verified: true, attempts: otpRow.attempts })
    .eq("id", otpRow.id);

  await admin
    .from("profiles")
    .update({
      email_verified: true,
      email_verified_at: now,
      updated_at: now,
    })
    .eq("id", user.id);

  const meta = user.user_metadata ?? {};
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    undefined;
  const role = meta.role === "teacher" ? "teacher" : meta.role === "admin" ? "admin" : "student";

  if (isResendConfigured()) {
    const { sendWelcomeEmail } = await import("@/lib/email");
    void sendWelcomeEmail(normalized, fullName, role === "teacher" ? "teacher" : "student");
  }

  const { notifyAdminNewRegistration, notifyAccountVerification } = await import(
    "@/lib/notifications/triggers"
  );
  void notifyAdminNewRegistration({ userId: user.id, role, name: fullName });
  void notifyAccountVerification(user.id);

  return { success: true, userId: user.id, role };
}
