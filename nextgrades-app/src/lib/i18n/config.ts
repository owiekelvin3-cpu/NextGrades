import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import de from "@/locales/de/common.json";
import deSite from "@/locales/de/site.json";
import { normalizeLanguage, SUPPORTED_LANGUAGES } from "@/lib/i18n/locales";

function mergeLocale<T extends object, S extends object>(common: T, site: S): T & S {
  return { ...common, ...site };
}

let englishBundleLoaded = false;
let englishBundlePromise: Promise<void> | null = null;

/** Load English strings on demand — German is bundled as the default locale. */
export async function ensureEnglishBundle(): Promise<void> {
  if (englishBundleLoaded || i18n.hasResourceBundle("en", "common")) {
    englishBundleLoaded = true;
    return;
  }
  if (englishBundlePromise) return englishBundlePromise;

  englishBundlePromise = (async () => {
    const [enMod, enSiteMod] = await Promise.all([
      import("@/locales/en/common.json"),
      import("@/locales/en/site.json"),
    ]);
    const en = (enMod as unknown as { default: Record<string, unknown> }).default;
    const enSite = (enSiteMod as unknown as { default: Record<string, unknown> }).default;
    i18n.addResourceBundle("en", "common", mergeLocale(en, enSite), true, true);
    englishBundleLoaded = true;

    if (normalizeLanguage(i18n.language) === "en") {
      await i18n.changeLanguage("en");
    }
  })();

  return englishBundlePromise;
}

/** @deprecated Use ensureEnglishBundle — kept for imports that still reference this name. */
export const ensureGermanBundle = ensureEnglishBundle;

const deBundle = mergeLocale(de, deSite);

/**
 * Fixed default for SSR + first client render (hydration-safe).
 * Stored preference is applied in I18nProvider useLayoutEffect after mount.
 */
i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: { common: deBundle },
    },
    lng: "de",
    supportedLngs: [...SUPPORTED_LANGUAGES],
    fallbackLng: "de",
    nonExplicitSupportedLngs: true,
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })
  .then(async () => {
    if (normalizeLanguage(i18n.language) === "en") {
      await ensureEnglishBundle();
    }
  });

i18n.on("languageChanged", (lng) => {
  if (normalizeLanguage(lng) === "en") void ensureEnglishBundle();
});

export default i18n;
