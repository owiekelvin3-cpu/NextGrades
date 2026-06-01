/** Image helpers — remote Unsplash + local /public assets. */

import { ONLINE_IMAGE_FALLBACK } from "@/lib/marketing-images";

export { ONLINE_IMAGE_FALLBACK };

export function isLocalImageSrc(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}

export function isRemoteImageSrc(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

/** Next.js image optimizer: skip only Supabase private storage URLs. */
export function shouldOptimizeImage(src: string): boolean {
  if (src.includes("supabase.co/storage") || src.includes("/storage/v1/object")) {
    return false;
  }
  return !src.startsWith("data:");
}
