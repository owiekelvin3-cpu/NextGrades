import { createHmac, timingSafeEqual } from "node:crypto";
import { getAuthSessionSecret } from "@/lib/security/auth-secret";

const PREFIX = "student-calendar-feed";

function sign(userId: string): string {
  return createHmac("sha256", getAuthSessionSecret()).update(`${PREFIX}:${userId}`).digest("base64url");
}

/** Opaque token that maps to a student user id for calendar subscription URLs. */
export function createCalendarFeedToken(userId: string): string {
  const signature = sign(userId);
  return Buffer.from(`${userId}.${signature}`).toString("base64url");
}

export function verifyCalendarFeedToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const dot = decoded.lastIndexOf(".");
    if (dot <= 0) return null;

    const userId = decoded.slice(0, dot);
    const signature = decoded.slice(dot + 1);
    if (!userId || !signature) return null;

    const expected = sign(userId);
    try {
      if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    } catch {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}
