import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/locales/en/common.json";
import enSite from "@/locales/en/site.json";
import { normalizeLanguage, SUPPORTED_LANGUAGES } from "@/lib/i18n/locales";

function mergeLocale<T extends object, S extends object>(common: T, site: S): T & S {
  return { ...common, ...site };
}

let germanBundleLoaded = false;
let germanBundlePromise: Promise<void> | null = null;

/** Load German strings on demand — keeps initial JS ~75KB smaller for English users. */
export async function ensureGermanBundle(): Promise<void> {
  if (germanBundleLoaded || i18n.hasResourceBundle("de", "common")) {
    germanBundleLoaded = true;
    return;
  }
  if (germanBundlePromise) return germanBundlePromise;

  germanBundlePromise = (async () => {
    const [deMod, deSiteMod] = await Promise.all([
      import("@/locales/de/common.json"),
      import("@/locales/de/site.json"),
    ]);
    const de = (deMod as unknown as { default: Record<string, unknown> }).default;
    const deSite = (deSiteMod as unknown as { default: Record<string, unknown> }).default;
    i18n.addResourceBundle("de", "common", mergeLocale(de, deSite), true, true);
    germanBundleLoaded = true;

    if (normalizeLanguage(i18n.language) === "de") {
      await i18n.changeLanguage("de");
    }
  })();

  return germanBundlePromise;
}

const enBundle = mergeLocale(en, enSite);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enBundle },
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
  })
  .then(async () => {
    if (normalizeLanguage(i18n.language) === "de") {
      await ensureGermanBundle();
    }
  });

i18n.on("languageChanged", (lng) => {
  if (normalizeLanguage(lng) === "de") void ensureGermanBundle();
});

export default i18n;
