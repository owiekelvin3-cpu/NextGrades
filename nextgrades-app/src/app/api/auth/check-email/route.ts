import { NextResponse } from "next/server";
import { logRegistrationAttempt, normalizeEmail, EMAIL_REGEX } from "@/lib/auth/registration";
import { enforceRateLimit } from "@/lib/security/rate-limit";

/** Returns a uniform response to prevent email enumeration. */
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { bucket: "auth:check-email", limit: 30, windowSec: 600 });
  if (limited) return limited;

  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email || "");

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await logRegistrationAttempt(email, "check_email", true, undefined, {}, request);

    return NextResponse.json({
      ok: true,
      message: "Continue with registration if this email belongs to you.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check failed";
    await logRegistrationAttempt(null, "check_email", false, message, {}, request);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
