"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  type UiTheme,
  getStoredTheme,
  setAppTheme,
  THEME_CHANGED_EVENT,
  THEME_STORAGE_KEY,
} from "@/lib/preferences";

interface ThemeContextType {
  theme: UiTheme;
  isReady: boolean;
  toggleTheme: () => void;
  setTheme: (theme: UiTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<UiTheme>("dark");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    setIsReady(true);

    const onThemeChanged = (event: Event) => {
      const next = (event as CustomEvent<UiTheme>).detail;
      if (next === "light" || next === "dark") setThemeState(next);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        setThemeState(getStoredTheme());
      }
    };

    window.addEventListener(THEME_CHANGED_EVENT, onThemeChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(THEME_CHANGED_EVENT, onThemeChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: UiTheme = prev === "dark" ? "light" : "dark";
      setAppTheme(next);
      return next;
    });
  }, []);

  const setThemeExplicit = useCallback((next: UiTheme) => {
    setThemeState(next);
    setAppTheme(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isReady, toggleTheme, setTheme: setThemeExplicit }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
