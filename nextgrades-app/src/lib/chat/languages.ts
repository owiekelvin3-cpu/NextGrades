export type ChatResponseLanguage = "de" | "en";

export const DEFAULT_CHAT_RESPONSE_LANGUAGE: ChatResponseLanguage = "de";

export const CHAT_RESPONSE_LANGUAGE_OPTIONS: {
  value: ChatResponseLanguage;
  label: string;
  shortLabel: string;
}[] = [
  { value: "de", label: "Deutsch", shortLabel: "DE" },
  { value: "en", label: "English", shortLabel: "EN" },
];

export function parseChatResponseLanguage(value: unknown): ChatResponseLanguage {
  return value === "en" ? "en" : "de";
}
