"use client";

import { useEffect, ReactNode } from "react";
import i18n from "@/lib/i18n/config";
import { I18nextProvider } from "react-i18next";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng");
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
