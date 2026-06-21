"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "sm" | "md";
  variant?: "icon" | "full";
  onDark?: boolean;
};

export function ThemeToggle({ className, size = "md", variant = "icon", onDark = false }: Props) {
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
          "flex w-full items-center justify-center gap-3 rounded-xl border border-border-default bg-surface-subtle py-3 font-semibold text-foreground transition-colors",
          "hover:border-[var(--brand-gold)]/35 hover:bg-[var(--brand-gold-muted)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70",
          className
        )}
      >
        <span className={cn("flex items-center justify-center", isTransitioning && "scale-110 rotate-90")}>
          {isDark ? <Sun className="h-5 w-5 text-[var(--brand-gold)]" /> : <Moon className="h-5 w-5 text-[var(--brand-gold)]" />}
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
        "flex shrink-0 items-center justify-center rounded-lg border transition-colors",
        "active:scale-95 disabled:cursor-wait disabled:opacity-70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]",
        onDark
          ? "border-white/10 bg-white/5 text-white/90 hover:border-white/20 hover:bg-white/10"
          : "border-border-default bg-surface-elevated text-foreground hover:border-[var(--border-strong)] hover:bg-surface-subtle",
        className
      )}
    >
      <span className={cn("flex items-center justify-center", isTransitioning && "rotate-90 scale-110")}>
        {isDark ? <Sun className={icon} /> : <Moon className={icon} />}
      </span>
    </button>
  );
}
