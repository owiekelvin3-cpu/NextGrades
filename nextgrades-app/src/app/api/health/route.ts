import { NextResponse } from "next/server";
import { isSupabaseEnvConfigured, isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { isEmailVerificationRequired } from "@/lib/auth/config";
import { isProduction, validateProductionEnv } from "@/lib/security/env";
import { isValidProductionAppUrl } from "@/lib/app-url";
import { isResendConfigured } from "@/lib/email";

/** Deployment readiness and uptime check. */
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const configIssues = isProduction() ? validateProductionEnv() : [];
  const blockers = configIssues.filter((i) => i.level === "error");

  const checks = {
    status: "ok" as "ok" | "degraded" | "blocked",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
    appUrl: appUrl || null,
    appUrlValid: appUrl ? isValidProductionAppUrl(appUrl) : false,
    supabase: isSupabaseEnvConfigured(),
    serviceRole: isSupabaseServiceRoleConfigured(),
    resend: isResendConfigured(),
    emailVerification: isEmailVerificationRequired(),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
    configWarnings: configIssues.filter((i) => i.level === "warn").map((i) => i.message),
    configErrors: blockers.map((i) => i.message),
  };

  if (isProduction()) {
    if (!checks.supabase || blockers.length > 0) {
      return NextResponse.json({ ...checks, status: "blocked" }, { status: 503 });
    }
    if (!checks.appUrlValid || !checks.resend) {
      return NextResponse.json({ ...checks, status: "degraded" }, { status: 200 });
    }
  }

  return NextResponse.json(checks);
}
