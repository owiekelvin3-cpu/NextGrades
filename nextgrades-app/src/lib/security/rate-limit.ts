import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Best-effort client IP (works behind Vercel/proxies). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export type RateLimitOptions = {
  /** Namespace, e.g. "auth:signup" */
  bucket: string;
  /** Max requests per window */
  limit: number;
  /** Window length in seconds */
  windowSec: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): { allowed: boolean; retryAfterSec?: number; remaining?: number } {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count };
}

/** Returns a 429 response when limited, otherwise null. */
export function enforceRateLimit(request: Request, options: RateLimitOptions): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${options.bucket}:${ip}`;
  const result = checkRateLimit(key, options.limit, options.windowSec);

  if (result.allowed) return null;

  return NextResponse.json(
    { error: "Too many requests. Please try again later.", retryAfterSec: result.retryAfterSec },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSec ?? 60),
        "X-RateLimit-Limit": String(options.limit),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}
