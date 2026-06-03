"use client";

import { useLayoutEffect } from "react";
import {
  applyLanguageToDocument,
  applyThemeToDocument,
  getStoredLanguage,
  getStoredTheme,
  migrateLegacyLanguagePreference,
} from "@/lib/preferences";

/** Syncs stored theme + language on mount (head inline script handles first paint + cookie). */
export function PreferencesBootstrap() {
  useLayoutEffect(() => {
    migrateLegacyLanguagePreference();
    applyThemeToDocument(getStoredTheme());
    applyLanguageToDocument(getStoredLanguage());
  }, []);

  return null;
}
