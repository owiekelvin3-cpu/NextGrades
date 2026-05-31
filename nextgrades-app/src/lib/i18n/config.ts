import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/locales/en/common.json";
import enSite from "@/locales/en/site.json";
import de from "@/locales/de/common.json";
import deSite from "@/locales/de/site.json";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/locales";

function mergeLocale<T extends object, S extends object>(common: T, site: S): T & S {
  return { ...common, ...site };
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: mergeLocale(en, enSite) },
      de: { common: mergeLocale(de, deSite) },
    },
    supportedLngs: [...SUPPORTED_LANGUAGES],
    fallbackLng: "en",
    nonExplicitSupportedLngs: true,
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

/** @deprecated Both locales are bundled; kept for callers that still await it. */
export async function ensureGermanBundle(): Promise<void> {
  /* no-op — German is in the initial bundle */
}

export default i18n;
