import { NextResponse } from "next/server";
import { normalizeEmail, EMAIL_REGEX } from "@/lib/auth/registration";
import { checkLoginLockout, recordFailedLogin } from "@/lib/auth/lockout";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { bucket: "auth:login-failed", limit: 30, windowSec: 3600 });
  if (limited) return limited;

  try {
    const body = (await request.json()) as { email?: string; turnstileToken?: string };
    const email = normalizeEmail(body.email || "");

    const turnstile = await verifyTurnstileToken(body.turnstileToken, request);
    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.error }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const lockCheck = await checkLoginLockout(email, request);
    if (lockCheck.locked) {
      return NextResponse.json(
        { locked: true, error: lockCheck.message, retryAfterSec: lockCheck.retryAfterSec },
        { status: 429 }
      );
    }

    const result = await recordFailedLogin(email, request);
    return NextResponse.json({
      recorded: true,
      locked: result.locked,
      error: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to record login attempt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
