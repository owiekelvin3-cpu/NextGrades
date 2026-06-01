type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(userId: string, maxPerMinute: number): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const key = userId;
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return { allowed: true };
  }

  if (existing.count >= maxPerMinute) {
    return { allowed: false, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true };
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
