import { checkRateLimit } from "@/lib/security/rate-limit";

export function checkUserRateLimit(
  userId: string,
  maxPerMinute: number
): { allowed: boolean; retryAfterSec?: number } {
  const result = checkRateLimit(`ratelimit:chat:${userId}`, maxPerMinute, 60);
  return result.allowed
    ? { allowed: true }
    : { allowed: false, retryAfterSec: result.retryAfterSec ?? 60 };
}

export function sanitizeInput(text: string, maxLength = 8000): string {
  return text
    .replace(/\0/g, "")
    .trim()
    .slice(0, maxLength);
}

export function validateMessage(text: string, hasAttachments = false): string | null {
  if (!text.trim() && !hasAttachments) return "Message cannot be empty";
  if (text.length > 8000) return "Message too long (max 8000 characters)";
  return null;
}
