"use client";

import { useEffect } from "react";
import {
  applyThemeToDocument,
  getStoredTheme,
  THEME_CHANGED_EVENT,
  type UiTheme,
} from "@/lib/preferences";

/** Admin portal is dark-only — restore the user's saved theme when they leave. */
export function useAdminPortalDarkTheme(active: boolean) {
  useEffect(() => {
    if (!active) return;

    applyThemeToDocument("dark");

    const onThemeChanged = (event: Event) => {
      const next = (event as CustomEvent<UiTheme>).detail;
      if (next !== "dark") applyThemeToDocument("dark");
    };

    window.addEventListener(THEME_CHANGED_EVENT, onThemeChanged);
    return () => {
      window.removeEventListener(THEME_CHANGED_EVENT, onThemeChanged);
      applyThemeToDocument(getStoredTheme());
    };
  }, [active]);
}
