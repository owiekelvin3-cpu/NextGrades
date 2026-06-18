import { NextResponse } from "next/server";

import { isSupabaseEnvConfigured, isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

import { isSignupEmailVerificationRequired } from "@/lib/auth/config";

import { isProduction, validateProductionEnv } from "@/lib/security/env";

import { isValidProductionAppUrl } from "@/lib/app-url";

import { isResendConfigured } from "@/lib/email";

import { isOpsAuthorized } from "@/lib/security/ops-auth";
import { probeLoginOtpStorage } from "@/lib/auth/login-otp";

/** Deployment readiness and uptime check. */
export async function GET(request: Request) {
  const detailed = isOpsAuthorized(request);

  if (!detailed) {
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const configIssues = isProduction() ? validateProductionEnv() : [];
  const blockers = configIssues.filter((i) => i.level === "error");
  const loginOtp = await probeLoginOtpStorage();

  const checks = {
    status: "ok" as "ok" | "degraded" | "blocked",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
    appUrl: appUrl || null,
    appUrlValid: appUrl ? isValidProductionAppUrl(appUrl) : false,
    supabase: isSupabaseEnvConfigured(),
    serviceRole: isSupabaseServiceRoleConfigured(),
    resend: isResendConfigured(),
    emailVerification: isSignupEmailVerificationRequired(),
    loginOtp,
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
    authSessionSecret: Boolean(process.env.AUTH_SESSION_SECRET?.trim()),
    configWarnings: configIssues.filter((i) => i.level === "warn").map((i) => i.message),
    configErrors: blockers.map((i) => i.message),
  };

  if (isProduction()) {
    if (!checks.supabase || blockers.length > 0) {
      return NextResponse.json({ ...checks, status: "blocked" }, { status: 503 });
    }
    if (!checks.appUrlValid || !checks.resend || !loginOtp.ok) {
      return NextResponse.json({ ...checks, status: "degraded" }, { status: 200 });
    }
  }

  return NextResponse.json(checks);
}

