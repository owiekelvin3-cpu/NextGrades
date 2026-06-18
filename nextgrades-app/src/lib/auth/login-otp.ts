import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { sendLoginVerificationCodeEmail, isResendConfigured } from "@/lib/email";
import { normalizeEmail } from "@/lib/auth/registration";
import {
  generateSixDigitCode,
  hashOtpCode,
  verifyOtpHash,
  generateTrustedDeviceToken,
  hashTrustedDeviceToken,
} from "@/lib/auth/otp-crypto";
import { logSecurityEvent } from "@/lib/auth/audit-log";
import { getClientIp } from "@/lib/security/rate-limit";

const LOGIN_OTP_TTL_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;
const TRUSTED_DEVICE_DAYS = 30;

type OtpRow = {
  id: string;
  otp_hash: string;
  attempts?: number;
  expires_at: string;
  verified_at?: string | null;
};

function isMissingColumnError(message: string, column: string): boolean {
  return message.includes(column) && (message.includes("column") || message.includes("schema cache"));
}

/** True only when the table/relation is missing — not when a column is missing. */
function isMissingTableError(message: string): boolean {
  const lower = message.toLowerCase();
  if (!lower.includes("login_otp_challenges")) return false;
  if (lower.includes("column")) return false;
  return (
    lower.includes("does not exist") ||
    lower.includes("could not find the table") ||
    lower.includes('relation "public.login_otp_challenges"')
  );
}

function isSchemaMismatchError(message: string): boolean {
  return message.includes("schema cache") || (message.includes("column") && message.includes("login_otp_challenges"));
}

async function clearPendingLoginChallenges(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const result = await admin
    .from("login_otp_challenges")
    .delete()
    .eq("user_id", userId)
    .is("verified_at", null);

  if (result.error && isSchemaMismatchError(result.error.message)) {
    await admin.from("login_otp_challenges").delete().eq("user_id", userId);
  }
}

async function insertLoginChallenge(
  admin: ReturnType<typeof createAdminClient>,
  row: {
    email: string;
    user_id: string;
    otp_hash: string;
    expires_at: string;
    ip_address: string | null;
    user_agent: string | null;
  }
): Promise<{ ok: boolean; error?: string }> {
  const fullRow = { ...row, attempts: 0 };
  let { error } = await admin.from("login_otp_challenges").insert(fullRow);

  if (error && isSchemaMismatchError(error.message)) {
    const minimal = {
      email: row.email,
      user_id: row.user_id,
      otp_hash: row.otp_hash,
      expires_at: row.expires_at,
    };
    ({ error } = await admin.from("login_otp_challenges").insert(minimal));
  }

  if (error) {
    if (isMissingTableError(error.message)) {
      return {
        ok: false,
        error:
          "Login verification database table is missing. Ask an admin to run supabase/APPLY_LOGIN_VERIFICATION.sql in Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

async function fetchPendingChallenge(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<{ row: OtpRow | null; error: string | null }> {
  const full = await admin
    .from("login_otp_challenges")
    .select("id, otp_hash, attempts, expires_at, verified_at")
    .eq("user_id", userId)
    .is("verified_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!full.error) {
    return { row: full.data, error: null };
  }

  if (isMissingTableError(full.error.message)) {
    return { row: null, error: full.error.message };
  }

  if (isSchemaMismatchError(full.error.message)) {
    const legacy = await admin
      .from("login_otp_challenges")
      .select("id, otp_hash, expires_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (legacy.error) {
      if (isMissingTableError(legacy.error.message)) {
        return { row: null, error: legacy.error.message };
      }
      return { row: null, error: legacy.error.message };
    }

    return { row: legacy.data, error: null };
  }

  return { row: null, error: full.error.message };
}

export async function issueLoginOtp(
  userId: string,
  email: string,
  fullName?: string,
  request?: Request
) {
  if (!isSupabaseServiceRoleConfigured() || !isResendConfigured()) {
    return { success: false, error: "Login verification service is not configured" };
  }

  const normalized = normalizeEmail(email);
  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + LOGIN_OTP_TTL_MINUTES * 60 * 1000).toISOString();
  const otpHash = hashOtpCode(code, normalized);
  const admin = createAdminClient();

  await clearPendingLoginChallenges(admin, userId);

  const inserted = await insertLoginChallenge(admin, {
    email: normalized,
    user_id: userId,
    otp_hash: otpHash,
    expires_at: expiresAt,
    ip_address: request ? getClientIp(request) : null,
    user_agent: request?.headers.get("user-agent") ?? null,
  });

  if (!inserted.ok) {
    console.error("[login-otp] insert failed:", inserted.error);
    return { success: false, error: inserted.error || "Failed to create login code" };
  }

  const emailResult = await sendLoginVerificationCodeEmail(normalized, code, fullName);
  if (!emailResult.success) {
    console.error("[login-otp] email failed:", emailResult.error);
    return { success: false, error: emailResult.error || "Failed to send login code" };
  }

  void logSecurityEvent(
    { eventType: "login_otp_sent", success: true, userId, email: normalized },
    request
  );

  return { success: true, expiresAt };
}

export async function verifyLoginOtp(
  userId: string,
  email: string,
  code: string,
  options?: { rememberDevice?: boolean; deviceLabel?: string },
  request?: Request
) {
  if (!isSupabaseServiceRoleConfigured()) {
    return { success: false, error: "Login verification service is not configured" };
  }

  const normalized = normalizeEmail(email);
  const trimmedCode = code.replace(/\D/g, "").trim();
  if (trimmedCode.length !== 6) {
    return { success: false, error: "Please enter the 6-digit code from your email." };
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { row, error: fetchError } = await fetchPendingChallenge(admin, userId);

  if (fetchError) {
    if (isMissingTableError(fetchError)) {
      return {
        success: false,
        error:
          "Login verification is not set up in the database. Run supabase/APPLY_LOGIN_VERIFICATION.sql in Supabase SQL Editor.",
      };
    }
    return { success: false, error: fetchError };
  }

  if (!row) {
    return { success: false, error: "No login code found. Tap Resend code and try again." };
  }

  if (row.verified_at) {
    return { success: false, error: "This code was already used." };
  }

  if (new Date(row.expires_at) < new Date()) {
    return { success: false, error: "This code has expired. Request a new code." };
  }

  if (typeof row.attempts === "number" && row.attempts >= MAX_VERIFY_ATTEMPTS) {
    return { success: false, error: "Too many attempts. Request a new code." };
  }

  if (!verifyOtpHash(trimmedCode, normalized, row.otp_hash)) {
    if (typeof row.attempts === "number") {
      await admin
        .from("login_otp_challenges")
        .update({ attempts: row.attempts + 1 })
        .eq("id", row.id);
    }

    void logSecurityEvent(
      { eventType: "login_otp_failed", success: false, userId, email: normalized },
      request
    );

    return { success: false, error: "Invalid code. Check your email and try again." };
  }

  const updatePayload: Record<string, unknown> = { verified_at: now };
  if (typeof row.attempts === "number") {
    updatePayload.attempts = row.attempts;
  }

  let { error: updateError } = await admin
    .from("login_otp_challenges")
    .update(updatePayload)
    .eq("id", row.id);

  if (updateError && isSchemaMismatchError(updateError.message)) {
    ({ error: updateError } = await admin.from("login_otp_challenges").delete().eq("id", row.id));
  }

  if (updateError) {
    console.error("[login-otp] verify update failed:", updateError.message);
  }

  await admin
    .from("profiles")
    .update({ last_login_at: now, updated_at: now })
    .eq("id", userId);

  let trustedDeviceToken: string | undefined;
  if (options?.rememberDevice) {
    try {
      trustedDeviceToken = generateTrustedDeviceToken();
      const tokenHash = hashTrustedDeviceToken(trustedDeviceToken);
      const expiresAt = new Date(Date.now() + TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000).toISOString();

      await admin.from("user_trusted_devices").insert({
        user_id: userId,
        token_hash: tokenHash,
        device_label: options.deviceLabel || "Trusted device",
        user_agent: request?.headers.get("user-agent") ?? null,
        ip_address: request ? getClientIp(request) : null,
        expires_at: expiresAt,
      });

      void logSecurityEvent(
        { eventType: "trusted_device_added", success: true, userId, email: normalized },
        request
      );
    } catch {
      trustedDeviceToken = undefined;
    }
  }

  void logSecurityEvent(
    { eventType: "login_otp_verified", success: true, userId, email: normalized },
    request
  );

  return { success: true, trustedDeviceToken };
}

/** Health probe for ops dashboards. */
export async function probeLoginOtpStorage(): Promise<{
  ok: boolean;
  tableExists: boolean;
  fullSchema: boolean;
  message: string;
}> {
  if (!isSupabaseServiceRoleConfigured()) {
    return { ok: false, tableExists: false, fullSchema: false, message: "Service role not configured" };
  }

  const admin = createAdminClient();
  const full = await admin.from("login_otp_challenges").select("id, verified_at, attempts").limit(1);

  if (!full.error) {
    return { ok: true, tableExists: true, fullSchema: true, message: "login_otp_challenges ready" };
  }

  if (isMissingTableError(full.error.message)) {
    return {
      ok: false,
      tableExists: false,
      fullSchema: false,
      message: "Run supabase/APPLY_LOGIN_VERIFICATION.sql in Supabase SQL Editor",
    };
  }

  if (isSchemaMismatchError(full.error.message)) {
    const minimal = await admin.from("login_otp_challenges").select("id").limit(1);
    if (minimal.error && isMissingTableError(minimal.error.message)) {
      return {
        ok: false,
        tableExists: false,
        fullSchema: false,
        message: "Run supabase/APPLY_LOGIN_VERIFICATION.sql in Supabase SQL Editor",
      };
    }
    return {
      ok: true,
      tableExists: true,
      fullSchema: false,
      message: "Table exists but missing columns — run APPLY_LOGIN_VERIFICATION.sql to upgrade",
    };
  }

  return { ok: false, tableExists: false, fullSchema: false, message: full.error.message };
}
