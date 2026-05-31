/** Online image helpers — Unsplash CDN fallbacks for marketing & resources. */

import { HERO_STUDY_IMAGE } from "@/lib/marketing-images";

/** Generic education/study photo used when all other sources fail. */
export const ONLINE_IMAGE_FALLBACK = HERO_STUDY_IMAGE;

export function isLocalImageSrc(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}

export function isRemoteImageSrc(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}
