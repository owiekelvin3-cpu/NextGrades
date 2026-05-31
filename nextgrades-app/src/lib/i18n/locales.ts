export const SUPPORTED_LANGUAGES = ["en", "de"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  de: "Deutsch",
};

/** Map browser / stored codes to en or de. */
export function normalizeLanguage(lang: string | null | undefined): SupportedLanguage {
  if (!lang) return "en";
  const code = lang.toLowerCase().split("-")[0];
  if (code === "de") return "de";
  return "en";
}

export function getDateLocale(lang: string): string {
  return normalizeLanguage(lang) === "de" ? "de-DE" : "en-US";
}
