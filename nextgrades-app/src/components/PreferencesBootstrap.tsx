"use client";

import { useLayoutEffect } from "react";
import {
  applyLanguageToDocument,
  applyThemeToDocument,
  getStoredLanguage,
  getStoredTheme,
  migrateLegacyLanguagePreference,
} from "@/lib/preferences";

/** Applies stored theme + language before first paint (replaces inline bootstrap script). */
export function PreferencesBootstrap() {
  useLayoutEffect(() => {
    migrateLegacyLanguagePreference();
    applyThemeToDocument(getStoredTheme());
    applyLanguageToDocument(getStoredLanguage());
  }, []);

  return null;
}
