import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { issueLoginOtp } from "@/lib/auth/login-otp";
import { isLoginEmailVerificationRequired } from "@/lib/auth/config";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { bucket: "auth:login-resend-otp", limit: 5, windowSec: 3600 });
  if (limited) return limited;

  if (!isLoginEmailVerificationRequired()) {
    return NextResponse.json({ error: "Login verification is disabled." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fullName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    undefined;

  const result = await issueLoginOtp(user.id, user.email, fullName, request);
  if (!result.success) {
    return NextResponse.json({ error: result.error || "Failed to resend login code" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Login code sent. Check your inbox and spam folder.",
    expiresAt: result.expiresAt,
  });
}
