const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  );
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  request?: Request
): Promise<{ ok: boolean; error?: string }> {
  if (!isTurnstileConfigured()) return { ok: true };

  if (!token?.trim()) {
    return { ok: false, error: "Please complete the security check." };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY!.trim();
  const ip = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  const body = new URLSearchParams({
    secret,
    response: token.trim(),
    ...(ip ? { remoteip: ip } : {}),
  });

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (data.success) return { ok: true };
    return { ok: false, error: "Security verification failed. Please try again." };
  } catch {
    return { ok: false, error: "Security verification unavailable. Try again shortly." };
  }
}
