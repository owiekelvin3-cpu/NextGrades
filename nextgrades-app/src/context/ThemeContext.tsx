"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  type UiTheme,
  APP_THEME,
  setAppTheme,
  THEME_CHANGED_EVENT,
} from "@/lib/preferences";

interface ThemeContextType {
  theme: UiTheme;
  isReady: boolean;
  isTransitioning: boolean;
  toggleTheme: (event?: React.MouseEvent<HTMLElement>) => void;
  setTheme: (theme: UiTheme, event?: React.MouseEvent<HTMLElement>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme = APP_THEME,
}: {
  children: React.ReactNode;
  initialTheme?: UiTheme;
}) {
  const [theme] = useState<UiTheme>(APP_THEME);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (initialTheme !== APP_THEME) {
      setAppTheme(APP_THEME, { skipRemote: true });
    }
    setIsReady(true);

    const onThemeChanged = () => {
      /* dark-only — no state updates needed */
    };

    window.addEventListener(THEME_CHANGED_EVENT, onThemeChanged);
    return () => {
      window.removeEventListener(THEME_CHANGED_EVENT, onThemeChanged);
    };
  }, [initialTheme]);

  const noop = () => {};

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isReady,
        isTransitioning: false,
        toggleTheme: noop,
        setTheme: noop,
      }}
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
