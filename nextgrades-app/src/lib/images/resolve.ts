import { ONLINE_IMAGE_FALLBACK } from "@/lib/marketing-images";

const INVALID_OVERRIDE = /^(none|null|undefined|#|javascript:|data:,|\s*$)/i;

/** Returns true when a string is a usable image src (http(s) or site-relative path). */
export function isValidImageSrc(src?: string | null): src is string {
  if (!src || typeof src !== "string") return false;
  const trimmed = src.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "#") return false;
  if (INVALID_OVERRIDE.test(trimmed)) return false;
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
}

/** CMS override or fallback — ignores empty/invalid overrides; never returns empty. */
export function resolveImageSrc(override?: string | null, fallback?: string): string {
  if (isValidImageSrc(override)) return override.trim();
  if (isValidImageSrc(fallback)) return fallback.trim();
  return ONLINE_IMAGE_FALLBACK;
}

/** Resolve with multiple fallbacks in order. */
export function resolveImageChain(...candidates: (string | null | undefined)[]): string {
  for (const c of candidates) {
    if (isValidImageSrc(c)) return c.trim();
  }
  return ONLINE_IMAGE_FALLBACK;
}
