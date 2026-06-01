export const SUPPORTED_LANGUAGES = ["de", "en"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  de: "Deutsch",
};

/** Map browser / stored codes to de or en. Default: Deutsch. */
export function normalizeLanguage(lang: string | null | undefined): SupportedLanguage {
  if (!lang) return "de";
  const code = lang.toLowerCase().split("-")[0];
  if (code === "en") return "en";
  return "de";
}

export function getDateLocale(lang: string): string {
  return normalizeLanguage(lang) === "de" ? "de-DE" : "en-US";
}
