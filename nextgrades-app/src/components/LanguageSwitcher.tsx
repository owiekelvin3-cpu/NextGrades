
"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Check } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/context/ThemeContext";

const languages = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("i18nextLng", langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 border ${
          theme === "dark"
            ? "bg-white/10 text-white hover:bg-white/20 border-white/10"
            : "bg-gray-100 text-[#0D1B2A] hover:bg-gray-200 border-gray-200"
        }`}
        type="button"
      >
        <FontAwesomeIcon icon={faGlobe} className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium">{currentLang.label}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl z-[9999] overflow-hidden ${
          theme === "dark"
            ? "bg-[#0D1B2A] border border-white/10"
            : "bg-white border border-gray-100"
        }`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 ${
                i18n.language === lang.code
                  ? theme === "dark"
                    ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                    : "bg-[#D4AF37]/20 text-[#D4AF37]"
                  : theme === "dark"
                  ? "text-white hover:bg-white/10"
                  : "text-[#0D1B2A] hover:bg-gray-50"
              }`}
              type="button"
            >
              <span className="font-medium">{lang.label}</span>
              {i18n.language === lang.code && (
                <Check className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
