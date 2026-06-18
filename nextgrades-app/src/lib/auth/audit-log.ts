import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { getClientIp } from "@/lib/security/rate-limit";

export type SecurityEventType =
  | "signup"
  | "signup_otp_sent"
  | "signup_otp_verified"
  | "login_success"
  | "login_failed"
  | "login_otp_sent"
  | "login_otp_verified"
  | "login_otp_failed"
  | "login_locked"
  | "password_reset_requested"
  | "password_changed"
  | "session_revoked"
  | "trusted_device_added"
  | "suspicious_activity";

export async function logSecurityEvent(
  event: {
    eventType: SecurityEventType;
    success: boolean;
    userId?: string | null;
    email?: string | null;
    metadata?: Record<string, unknown>;
  },
  request?: Request
) {
  if (!isSupabaseServiceRoleConfigured()) return;

  try {
    const admin = createAdminClient();
    await admin.from("security_audit_events").insert({
      user_id: event.userId ?? null,
      email: event.email ?? null,
      event_type: event.eventType,
      success: event.success,
      ip_address: request ? getClientIp(request) : null,
      user_agent: request?.headers.get("user-agent") ?? null,
      metadata: event.metadata ?? {},
    });
  } catch {
    /* non-blocking */
  }
}
