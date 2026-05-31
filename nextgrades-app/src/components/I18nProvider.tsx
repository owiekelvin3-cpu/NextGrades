"use client";

import { useLayoutEffect, useEffect, ReactNode } from "react";
import i18n, { ensureGermanBundle } from "@/lib/i18n/config";
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
  useLayoutEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? navigator.language;
    const lang = normalizeLanguage(stored);
    document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    const applyLanguage = async (raw: string | null) => {
      const lang = normalizeLanguage(raw);
      persistLanguageLocally(lang);
      document.documentElement.lang = lang;
      if (lang === "de") await ensureGermanBundle();
      await i18n.changeLanguage(lang);
    };

    applyLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? navigator.language);

    const onStorage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY) {
        applyLanguage(event.newValue);
      }
    };

    const onLanguageChanged = (event: Event) => {
      const lang = normalizeLanguage((event as CustomEvent<string>).detail);
      applyLanguage(lang);
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
  document.documentElement.lang = normalized;
  if (normalized === "de") await ensureGermanBundle();
  await i18n.changeLanguage(normalized);
}

export function getAppLanguage(): string {
  return normalizeLanguage(i18n.language || getStoredLanguage());
}
