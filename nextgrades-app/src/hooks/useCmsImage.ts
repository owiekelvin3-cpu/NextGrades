"use client";

import { useTranslation } from "react-i18next";
import { useCms } from "@/context/CmsContext";
import { getCmsImageDefault } from "@/lib/cms/marketing-images-registry";
import { ONLINE_IMAGE_FALLBACK } from "@/lib/images/online-assets";
import { resolveImageChain } from "@/lib/images/resolve";

/** Resolved marketing image URL — CMS override or Unsplash default; never empty. */
export function useCmsImage(key: string, fallback?: string): string {
  const { overrides } = useCms();
  const { i18n } = useTranslation();
  const lng = i18n.language.startsWith("de") ? "de" : "en";
  const resolved = overrides[key]?.[lng] ?? overrides[key]?.en;
  const overrideStr = typeof resolved === "string" ? resolved : undefined;
  return resolveImageChain(overrideStr, fallback, getCmsImageDefault(key), ONLINE_IMAGE_FALLBACK);
}

/** Batch helper for pages with many images. */
export function useCmsImages() {
  const { overrides } = useCms();
  const { i18n } = useTranslation();
  const lng = i18n.language.startsWith("de") ? "de" : "en";

  const getImage = (key: string, fallback?: string) => {
    const resolved = overrides[key]?.[lng] ?? overrides[key]?.en;
    const overrideStr = typeof resolved === "string" ? resolved : undefined;
    return resolveImageChain(overrideStr, fallback, getCmsImageDefault(key), ONLINE_IMAGE_FALLBACK);
  };

  return { getImage, overrides };
}
