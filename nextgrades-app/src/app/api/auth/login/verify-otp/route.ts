import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyLoginOtp } from "@/lib/auth/login-otp";
import { setMfaVerifiedCookie, setTrustedDeviceCookie } from "@/lib/auth/mfa-cookies";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { bucket: "auth:login-verify-otp", limit: 20, windowSec: 3600 });
  if (limited) return limited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    code?: string;
    rememberDevice?: boolean;
  };

  const result = await verifyLoginOtp(
    user.id,
    user.email,
    String(body.code || ""),
    { rememberDevice: body.rememberDevice === true },
    request
  );

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await setMfaVerifiedCookie(user.id);
  if (result.trustedDeviceToken) {
    await setTrustedDeviceCookie(user.id, result.trustedDeviceToken);
  }

  return NextResponse.json({ success: true, message: "Login verified." });
}
