import i18n from "@/lib/i18n/config";
import type { CmsOverrideMap } from "./types";

/** Apply CMS overrides into i18next (dot-notation keys). */
export function applyCmsOverridesToI18n(overrides: CmsOverrideMap, locale?: string) {
  const locales = locale ? [locale] : (["en", "de"] as const);

  for (const lng of locales) {
    for (const [key, values] of Object.entries(overrides)) {
      const value = values[lng as keyof typeof values];
      if (value === undefined || value === null) continue;
      i18n.addResource(lng, "common", key, value as string);
    }
  }
}
