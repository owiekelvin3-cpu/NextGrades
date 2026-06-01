import i18n, { ensureEnglishBundle } from "@/lib/i18n/config";
import { normalizeLanguage } from "@/lib/i18n/locales";
import type { CmsOverrideMap } from "./types";

/** Apply CMS overrides into i18next (dot-notation keys) and refresh mounted UI. */
export async function applyCmsOverridesToI18n(overrides: CmsOverrideMap, locale?: string) {
  const locales = locale ? [normalizeLanguage(locale)] : (["en", "de"] as const);

  if (locales.includes("en")) {
    await ensureEnglishBundle();
  }

  for (const lng of locales) {
    for (const [key, values] of Object.entries(overrides)) {
      const value = values[lng as keyof typeof values];
      if (value === undefined || value === null) continue;
      if (typeof value === "object") {
        // Runtime supports objects for returnObjects; bundled types only list string.
        (i18n as { addResource: (lng: string, ns: string, key: string, val: unknown) => void }).addResource(
          lng,
          "common",
          key,
          value
        );
      } else {
        i18n.addResource(lng, "common", key, String(value));
      }
    }
  }

  const active = normalizeLanguage(locale ?? i18n.language);
  await i18n.changeLanguage(active);
}
