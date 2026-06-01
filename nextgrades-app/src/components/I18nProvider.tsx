"use client";

import { useLayoutEffect, useEffect, ReactNode } from "react";
import i18n, { ensureEnglishBundle } from "@/lib/i18n/config";
import { I18nextProvider } from "react-i18next";
import { normalizeLanguage, type SupportedLanguage } from "@/lib/i18n/locales";
import {
  getStoredLanguage,
  persistLanguageLocally,
  persistLanguageCookie,
  migrateLegacyLanguagePreference,
  LANGUAGE_CHANGED_EVENT,
  LANGUAGE_STORAGE_KEY,
} from "@/lib/preferences";

interface I18nProviderProps {
  children: ReactNode;
}

async function syncI18nLanguage(lang: SupportedLanguage): Promise<void> {
  document.documentElement.lang = lang;
  if (lang === "en") await ensureEnglishBundle();
  if (normalizeLanguage(i18n.language) !== lang) {
    await i18n.changeLanguage(lang);
  }
}

export function I18nProvider({ children }: I18nProviderProps) {
  useLayoutEffect(() => {
    migrateLegacyLanguagePreference();
    const stored = getStoredLanguage();
    persistLanguageCookie(stored);
    void syncI18nLanguage(stored);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY) {
        void syncI18nLanguage(normalizeLanguage(event.newValue ?? "de"));
      }
    };

    const onLanguageChanged = (event: Event) => {
      const lang = normalizeLanguage((event as CustomEvent<string>).detail);
      void syncI18nLanguage(lang);
    };

    const onI18nLanguageChanged = (lang: string) => {
      const normalized = normalizeLanguage(lang);
      document.documentElement.lang = normalized;
      if (localStorage.getItem(LANGUAGE_STORAGE_KEY) !== normalized) {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
      }
    };

    i18n.on("languageChanged", onI18nLanguageChanged);
    window.addEventListener("storage", onStorage);
    window.addEventListener(LANGUAGE_CHANGED_EVENT, onLanguageChanged);

    return () => {
      i18n.off("languageChanged", onI18nLanguageChanged);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LANGUAGE_CHANGED_EVENT, onLanguageChanged);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export async function changeAppLanguage(lang: string): Promise<void> {
  const normalized = normalizeLanguage(lang);
  persistLanguageLocally(normalized, { userInitiated: true });
  await syncI18nLanguage(normalized);
}

export function getAppLanguage(): string {
  return normalizeLanguage(i18n.language || getStoredLanguage());
}
