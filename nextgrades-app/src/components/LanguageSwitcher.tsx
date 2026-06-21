"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Check, Languages } from "lucide-react";
import { changeAppLanguage } from "@/components/I18nProvider";
import { setAppLanguage } from "@/lib/preferences";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, normalizeLanguage } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

const languages = SUPPORTED_LANGUAGES.map((code) => ({
  code,
  label: LANGUAGE_LABELS[code],
}));

type LanguageSwitcherProps = {
  layout?: "dropdown" | "drawer";
  /** Compact icon chip for navbar utility row */
  compact?: boolean;
  onDark?: boolean;
};

export function LanguageSwitcher({ layout = "dropdown", compact = false, onDark = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCode = normalizeLanguage(i18n.language);
  const currentLang = languages.find((l) => l.code === activeCode) ?? languages[0];

  useEffect(() => {
    if (layout === "drawer") return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [layout]);

  const handleLanguageChange = (langCode: string) => {
    void setAppLanguage(normalizeLanguage(langCode), (lang) => changeAppLanguage(lang));
    setIsOpen(false);
  };

  const chipClass = cn(
    "inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border text-sm font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]",
    compact ? "h-9 min-w-[3.25rem] px-2.5" : "gap-1.5 px-3 py-2",
    onDark
      ? "border-white/10 bg-white/5 text-white/90 hover:border-white/20 hover:bg-white/10"
      : "border-border-default bg-surface-elevated text-foreground hover:border-[var(--border-strong)] hover:bg-surface-subtle"
  );

  if (layout === "drawer") {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{currentLang.label}</p>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "flex min-h-[48px] items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors touch-manipulation",
                activeCode === lang.code
                  ? "border-[var(--brand-gold)]/40 bg-[var(--brand-gold-muted)] text-[var(--brand-gold)]"
                  : "border-border-default bg-surface-subtle text-foreground hover:bg-surface-muted"
              )}
            >
              <span className="uppercase">{lang.code}</span>
              {activeCode === lang.code && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={chipClass}
        title={currentLang.label}
        aria-label={currentLang.label}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Languages className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
        <span className="uppercase">{currentLang.code}</span>
        {!compact && <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />}
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-[100] mt-2 w-52 overflow-hidden rounded-xl border border-border-default bg-[var(--nav-dropdown)] shadow-lg"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={activeCode === lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
                activeCode === lang.code
                  ? "bg-[var(--brand-gold-muted)] font-semibold text-[var(--brand-gold)]"
                  : "text-foreground hover:bg-[var(--table-row-hover)]"
              )}
            >
              <span className="w-8 font-bold uppercase text-[var(--brand-gold)]">{lang.code}</span>
              <span className="flex-1">{lang.label}</span>
              {activeCode === lang.code && <Check className="h-4 w-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
