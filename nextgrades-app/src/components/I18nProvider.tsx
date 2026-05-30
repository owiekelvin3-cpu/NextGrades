"use client";

import { useEffect, ReactNode } from "react";
import i18n from "@/lib/i18n/config";
import { I18nextProvider } from "react-i18next";
import { normalizeLanguage } from "@/lib/i18n/locales";
import {
  getStoredLanguage,
  persistLanguageLocally,
  LANGUAGE_CHANGED_EVENT,
  LANGUAGE_STORAGE_KEY,
} from "@/lib/preferences";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    const applyLanguage = (raw: string | null, skipI18n = false) => {
      const lang = normalizeLanguage(raw);
      persistLanguageLocally(lang);
      if (!skipI18n && normalizeLanguage(i18n.language) !== lang) {
        void i18n.changeLanguage(lang);
      }
    };

    applyLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY), false);

    const onStorage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY) {
        applyLanguage(event.newValue, false);
      }
    };

    const onLanguageChanged = (event: Event) => {
      const lang = normalizeLanguage((event as CustomEvent<string>).detail);
      document.documentElement.lang = lang;
      if (normalizeLanguage(i18n.language) !== lang) {
        void i18n.changeLanguage(lang);
      }
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
  persistLanguageLocally(normalized);
  if (normalizeLanguage(i18n.language) !== normalized) {
    await i18n.changeLanguage(normalized);
  }
}

export function getAppLanguage(): string {
  return normalizeLanguage(i18n.language || getStoredLanguage());
}
