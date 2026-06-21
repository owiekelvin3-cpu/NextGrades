"use client";

import { useTheme } from "@/context/ThemeContext";
import { marketingTheme } from "@/lib/marketing-theme";

/** Marketing surfaces + `isDark` for intentional brand hero sections. */
export function useMarketingTheme() {
  const { theme } = useTheme();
  return {
    isDark: theme === "dark",
    ...marketingTheme,
  };
}
