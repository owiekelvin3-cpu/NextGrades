"use client";

import { Languages } from "lucide-react";
import {
  CHAT_RESPONSE_LANGUAGE_OPTIONS,
  type ChatResponseLanguage,
} from "@/lib/chat/languages";
import { cn } from "@/lib/utils";

interface ChatLanguageSwitcherProps {
  value: ChatResponseLanguage;
  onChange: (language: ChatResponseLanguage) => void;
  disabled?: boolean;
  className?: string;
}

export function ChatLanguageSwitcher({
  value,
  onChange,
  disabled,
  className,
}: ChatLanguageSwitcherProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-white/10 dark:bg-white/5",
        className
      )}
      role="group"
      aria-label="AI response language"
    >
      <Languages className="ml-1.5 h-3.5 w-3.5 text-gray-400" aria-hidden />
      {CHAT_RESPONSE_LANGUAGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          title={option.label}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
            value === option.value
              ? "bg-[#D4AF37] text-[#0D1B2A]"
              : "text-gray-500 hover:text-[#0D1B2A] dark:text-gray-400 dark:hover:text-white",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {option.shortLabel}
        </button>
      ))}
    </div>
  );
}
