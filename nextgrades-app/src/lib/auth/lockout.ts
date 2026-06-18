import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { normalizeEmail } from "@/lib/auth/registration";
import { getClientIp } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/auth/audit-log";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function checkLoginLockout(email: string, request?: Request): Promise<{
  locked: boolean;
  retryAfterSec?: number;
  message?: string;
}> {
  if (!isSupabaseServiceRoleConfigured()) return { locked: false };

  const normalized = normalizeEmail(email);
  const ip = request ? getClientIp(request) : "unknown";
  const admin = createAdminClient();

  const { data } = await admin
    .from("auth_lockouts")
    .select("failed_attempts, locked_until")
    .eq("email", normalized)
    .eq("ip_address", ip)
    .maybeSingle();

  if (!data?.locked_until) return { locked: false };

  const lockedUntil = new Date(data.locked_until);
  if (lockedUntil <= new Date()) return { locked: false };

  const retryAfterSec = Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 1000));
  return {
    locked: true,
    retryAfterSec,
    message: `Too many failed login attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minutes.`,
  };
}

export async function recordFailedLogin(
  email: string,
  request?: Request
): Promise<{ locked: boolean; message?: string }> {
  if (!isSupabaseServiceRoleConfigured()) return { locked: false };

  const normalized = normalizeEmail(email);
  const ip = request ? getClientIp(request) : "unknown";
  const admin = createAdminClient();
  const now = new Date();

  const { data: existing } = await admin
    .from("auth_lockouts")
    .select("id, failed_attempts, locked_until")
    .eq("email", normalized)
    .eq("ip_address", ip)
    .maybeSingle();

  let failedAttempts = (existing?.failed_attempts ?? 0) + 1;
  let lockedUntil: string | null = null;

  if (existing?.locked_until && new Date(existing.locked_until) > now) {
    return { locked: true, message: "Account temporarily locked due to failed login attempts." };
  }

  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    lockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
    failedAttempts = MAX_FAILED_ATTEMPTS;
  }

  if (existing?.id) {
    await admin
      .from("auth_lockouts")
      .update({
        failed_attempts: failedAttempts,
        locked_until: lockedUntil,
        last_failure_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await admin.from("auth_lockouts").insert({
      email: normalized,
      ip_address: ip,
      failed_attempts: failedAttempts,
      locked_until: lockedUntil,
      last_failure_at: now.toISOString(),
    });
  }

  void logSecurityEvent(
    {
      eventType: lockedUntil ? "login_locked" : "login_failed",
      success: false,
      email: normalized,
      metadata: { failedAttempts },
    },
    request
  );

  return {
    locked: Boolean(lockedUntil),
    message: lockedUntil
      ? "Too many failed login attempts. Your account is temporarily locked."
      : undefined,
  };
}

export async function clearLoginLockout(email: string, request?: Request) {
  if (!isSupabaseServiceRoleConfigured()) return;

  const normalized = normalizeEmail(email);
  const ip = request ? getClientIp(request) : "unknown";
  const admin = createAdminClient();

  await admin
    .from("auth_lockouts")
    .update({
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("email", normalized)
    .eq("ip_address", ip);
}
