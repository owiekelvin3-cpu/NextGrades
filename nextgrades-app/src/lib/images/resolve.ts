/** Returns true when a string is a usable image src (http(s) or site-relative path). */
export function isValidImageSrc(src?: string | null): src is string {
  if (!src || typeof src !== "string") return false;
  const trimmed = src.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "#") return false;
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
}

/** CMS override or fallback — ignores empty/invalid overrides. */
export function resolveImageSrc(override?: string | null, fallback?: string): string {
  if (isValidImageSrc(override)) return override.trim();
  if (isValidImageSrc(fallback)) return fallback.trim();
  return "";
}
