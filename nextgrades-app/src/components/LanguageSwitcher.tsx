"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Check, Languages } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { changeAppLanguage } from "@/components/I18nProvider";
import { setAppLanguage } from "@/lib/preferences";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, normalizeLanguage } from "@/lib/i18n/locales";

const languages = SUPPORTED_LANGUAGES.map((code) => ({
  code,
  label: LANGUAGE_LABELS[code],
}));

type LanguageSwitcherProps = {
  /** Stacked buttons for mobile drawers (no floating dropdown). */
  layout?: "dropdown" | "drawer";
};

export function LanguageSwitcher({ layout = "dropdown" }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
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
    const normalized = normalizeLanguage(langCode);
    void setAppLanguage(normalized, (lang) => changeAppLanguage(lang));
    setIsOpen(false);
  };

  if (layout === "drawer") {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {currentLang.label}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition-colors touch-manipulation ${
                activeCode === lang.code
                  ? "border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#D4AF37]"
                  : theme === "dark"
                    ? "border-white/15 text-white hover:bg-white/5"
                    : "border-gray-200 text-[#0D1B2A] hover:bg-gray-50"
              }`}
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
    <div className="relative w-full md:w-auto" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-all duration-200 border font-semibold text-sm ${
          theme === "dark"
            ? "bg-white/10 text-white hover:bg-white/15 border-white/20"
            : "bg-gray-100 text-[#0D1B2A] hover:bg-gray-200 border-gray-200"
        }`}
        type="button"
        title={currentLang.label}
        aria-label={currentLang.label}
      >
        <Languages className="h-4 w-4 shrink-0 opacity-80" />
        <span className="uppercase">{currentLang.code}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-xl border shadow-2xl md:left-auto md:right-0 md:w-52 ${
            theme === "dark" ? "bg-[#0D1B2A] border-white/10" : "bg-white border-gray-200"
          }`}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 text-sm ${
                activeCode === lang.code
                  ? theme === "dark"
                    ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                    : "bg-[#D4AF37]/10 text-[#D4AF37]"
                  : theme === "dark"
                    ? "text-white hover:bg-white/10"
                    : "text-[#0D1B2A] hover:bg-gray-50"
              }`}
              type="button"
            >
              <span className="w-10 font-bold uppercase text-[#D4AF37]">{lang.code}</span>
              <span className="flex-1">{lang.label}</span>
              {activeCode === lang.code && <Check className="w-4 h-4 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
