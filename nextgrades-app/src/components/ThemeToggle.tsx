"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "sm" | "md";
  /** Full-width row for mobile menus */
  variant?: "icon" | "full";
};

export function ThemeToggle({ className, size = "md", variant = "icon" }: Props) {
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const dim = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        disabled={isTransitioning}
        aria-label={isDark ? t("common.lightMode") : t("common.darkMode")}
        className={cn(
          "flex w-full items-center justify-center gap-3 rounded-xl border py-3 font-semibold transition-all duration-300",
          "active:scale-[0.98] disabled:cursor-wait disabled:opacity-70",
          isDark
            ? "border-white/30 bg-white/5 text-white hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10"
            : "border-gray-200 bg-gray-50 text-[#0D1B2A] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10",
          className
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center transition-transform duration-500",
            isTransitioning && "scale-110 rotate-180"
          )}
        >
          {isDark ? <Sun className="h-5 w-5 text-[#D4AF37]" /> : <Moon className="h-5 w-5 text-[#D4AF37]" />}
        </span>
        {isDark ? t("common.lightMode") : t("common.darkMode")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={isTransitioning}
      aria-label={isDark ? t("common.lightMode") : t("common.darkMode")}
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-lg border transition-all duration-300",
        "active:scale-95 disabled:cursor-wait disabled:opacity-70",
        "border-border-default bg-surface-elevated text-foreground",
        "hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]",
        className
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center transition-transform duration-500",
          isTransitioning && "scale-110 rotate-90"
        )}
      >
        {isDark ? <Sun className={icon} /> : <Moon className={icon} />}
      </span>
    </button>
  );
}
