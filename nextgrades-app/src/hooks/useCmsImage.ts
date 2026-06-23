"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { useCms } from "@/context/CmsContext";
import { getCmsImageDefault } from "@/lib/cms/marketing-images-registry";
import { getPreviewOverrides, isCmsPreviewFrame, subscribePreviewOverrides } from "@/lib/cms/preview-store";
import { resolveCmsImageSrc } from "@/lib/images/resolve";
import type { CmsOverrideMap } from "@/lib/cms/types";

function mergeOverrides(published: CmsOverrideMap, preview: CmsOverrideMap | null): CmsOverrideMap {
  if (!preview || !Object.keys(preview).length) return published;
  return { ...published, ...preview };
}

function useEffectiveOverrides(): CmsOverrideMap {
  const { overrides } = useCms();
  const inPreview = isCmsPreviewFrame();

  const preview = useSyncExternalStore(
    subscribePreviewOverrides,
    () => (inPreview ? getPreviewOverrides() : null),
    () => null
  );

  return useMemo(() => mergeOverrides(overrides, preview), [overrides, preview]);
}

/** Resolved marketing image URL — CMS override or Unsplash default; never empty. */
export function useCmsImage(key: string, fallback?: string): string {
  const overrides = useEffectiveOverrides();
  const { i18n } = useTranslation();
  const lng = i18n.language.startsWith("de") ? "de" : "en";
  const resolved = overrides[key]?.[lng] ?? overrides[key]?.en;
  const overrideStr = typeof resolved === "string" ? resolved : undefined;
  return resolveCmsImageSrc(key, overrideStr, fallback, getCmsImageDefault(key));
}

/** Batch helper for pages with many images. */
export function useCmsImages() {
  const overrides = useEffectiveOverrides();
  const { i18n } = useTranslation();
  const lng = i18n.language.startsWith("de") ? "de" : "en";

  const getImage = (key: string, fallback?: string) => {
    const resolved = overrides[key]?.[lng] ?? overrides[key]?.en;
    const overrideStr = typeof resolved === "string" ? resolved : undefined;
    return resolveCmsImageSrc(key, overrideStr, fallback, getCmsImageDefault(key));
  };

  return { getImage, overrides };
}
