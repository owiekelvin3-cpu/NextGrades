import { ONLINE_IMAGE_FALLBACK } from "@/lib/marketing-images";

const INVALID_OVERRIDE = /^(none|null|undefined|#|javascript:|data:,|\s*$)/i;

/** CMS keys that share the branded students hero on Start, Programme, Fächer. */
export const SHARED_MARKETING_HERO_KEYS = [
  "cmsImages.home.heroStudent",
  "cmsImages.programs.hero",
  "cmsImages.subjects.hero",
] as const;

/** Ignore stale stock-photo CMS overrides so the branded hero always wins. */
export function isStaleExternalHeroOverride(src?: string | null): boolean {
  if (!src || typeof src !== "string") return false;
  const s = src.trim().toLowerCase();
  if (!s) return false;
  if (s.includes("/images/marketing/hero-students")) return false;
  if (s.startsWith("/images/marketing/")) return false;
  return /unsplash|pexels|pixabay|shutterstock|istock|placeholder|rectangle_40443|images\.unsplash/i.test(s);
}

/** Ignore stale CMS uploads (generic placeholder rectangles) — use branded defaults instead. */
const LEGACY_CMS_PLACEHOLDER = /Rectangle_40443|resource-thumbnails\/cms\/\d+-Rectangle/i;

export function isLegacyCmsPlaceholderImage(src?: string | null): boolean {
  if (!src || typeof src !== "string") return false;
  return LEGACY_CMS_PLACEHOLDER.test(src);
}

/** Returns true when a string is a usable image src (http(s) or site-relative path). */
export function isValidImageSrc(src?: string | null): src is string {
  if (!src || typeof src !== "string") return false;
  const trimmed = src.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "#") return false;
  if (INVALID_OVERRIDE.test(trimmed)) return false;
  if (isLegacyCmsPlaceholderImage(trimmed)) return false;
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
}

/** Resolve CMS image — optional key applies shared-hero guardrails. */
export function resolveCmsImageSrc(
  key: string | undefined,
  override?: string | null,
  fallback?: string,
  registryDefault?: string
): string {
  if (
    key &&
    (SHARED_MARKETING_HERO_KEYS as readonly string[]).includes(key) &&
    isStaleExternalHeroOverride(override)
  ) {
    return resolveImageChain(fallback, registryDefault, ONLINE_IMAGE_FALLBACK);
  }
  return resolveImageChain(override, fallback, registryDefault, ONLINE_IMAGE_FALLBACK);
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
