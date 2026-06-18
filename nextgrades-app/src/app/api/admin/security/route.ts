import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

export async function GET() {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [eventsRes, lockoutsRes, sessionsRes, failedLoginsRes] = await Promise.all([
    admin
      .from("security_audit_events")
      .select("id, event_type, success, email, user_id, ip_address, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("auth_lockouts")
      .select("email, ip_address, failed_attempts, locked_until, updated_at")
      .not("locked_until", "is", null)
      .gt("locked_until", new Date().toISOString())
      .order("updated_at", { ascending: false })
      .limit(20),
    admin
      .from("user_sessions")
      .select("id, user_id, session_label, ip_address, user_agent, last_seen_at, created_at")
      .is("revoked_at", null)
      .order("last_seen_at", { ascending: false })
      .limit(30),
    admin
      .from("security_audit_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "login_failed")
      .gte("created_at", since),
  ]);

  const recentEvents = eventsRes.data ?? [];
  const stats = {
    failedLogins7d: failedLoginsRes.count ?? 0,
    activeLockouts: lockoutsRes.data?.length ?? 0,
    recentEventCount: recentEvents.length,
    loginOtpSent: recentEvents.filter((e) => e.event_type === "login_otp_sent").length,
    suspiciousEvents: recentEvents.filter((e) => e.event_type === "login_locked" || e.event_type === "suspicious_activity").length,
  };

  return NextResponse.json({
    stats,
    recentEvents,
    activeLockouts: lockoutsRes.data ?? [],
    activeSessions: sessionsRes.data ?? [],
  });
}
