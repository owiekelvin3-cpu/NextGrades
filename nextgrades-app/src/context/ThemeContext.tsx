"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  type UiTheme,
  getStoredTheme,
  setAppTheme,
  THEME_CHANGED_EVENT,
  THEME_STORAGE_KEY,
} from "@/lib/preferences";
import { getClickOrigin, runThemeTransition } from "@/lib/theme/animate-theme-change";

interface ThemeContextType {
  theme: UiTheme;
  isReady: boolean;
  isTransitioning: boolean;
  toggleTheme: (event?: React.MouseEvent<HTMLElement>) => void;
  setTheme: (theme: UiTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme = "dark",
}: {
  children: React.ReactNode;
  initialTheme?: UiTheme;
}) {
  const [theme, setThemeState] = useState<UiTheme>(initialTheme);
  const [isReady, setIsReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitioningRef = useRef(false);

  useEffect(() => {
    const stored = getStoredTheme();
    if (stored !== initialTheme) {
      setThemeState(stored);
      setAppTheme(stored, { skipRemote: true });
    }
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
  }, [initialTheme]);

  const applyTheme = useCallback((next: UiTheme) => {
    setThemeState(next);
    setAppTheme(next);
  }, []);

  const toggleTheme = useCallback(
    (event?: React.MouseEvent<HTMLElement>) => {
      if (transitioningRef.current) return;

      const next: UiTheme = theme === "dark" ? "light" : "dark";
      const origin = getClickOrigin(event);

      transitioningRef.current = true;
      setIsTransitioning(true);

      void runThemeTransition(next, origin, () => applyTheme(next)).finally(() => {
        transitioningRef.current = false;
        setIsTransitioning(false);
      });
    },
    [applyTheme, theme]
  );

  const setThemeExplicit = useCallback(
    (next: UiTheme) => {
      if (next === theme) return;
      applyTheme(next);
    },
    [applyTheme, theme]
  );

  return (
    <ThemeContext.Provider
      value={{ theme, isReady, isTransitioning, toggleTheme, setTheme: setThemeExplicit }}
    >
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
