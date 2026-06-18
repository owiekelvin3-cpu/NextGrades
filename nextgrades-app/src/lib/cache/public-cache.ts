/** CDN cache headers for public read-mostly API responses (Vercel edge). */
export const PUBLIC_SMAXAGE_SHORT = 120;
export const PUBLIC_SMAXAGE_DEFAULT = 300;

export function publicCacheControl(
  sMaxAge = PUBLIC_SMAXAGE_DEFAULT,
  staleWhileRevalidate = sMaxAge * 3
): string {
  return `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
}

export function publicCacheHeaders(sMaxAge = PUBLIC_SMAXAGE_DEFAULT): HeadersInit {
  return { "Cache-Control": publicCacheControl(sMaxAge) };
}
