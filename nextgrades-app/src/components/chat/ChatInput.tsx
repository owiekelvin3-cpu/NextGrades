"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatResponseLanguage } from "@/lib/chat/languages";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  streaming?: boolean;
  disabled?: boolean;
  responseLanguage?: ChatResponseLanguage;
}

export function ChatInput({
  onSend,
  onStop,
  streaming,
  disabled,
  responseLanguage = "de",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder =
    responseLanguage === "de"
      ? "Stelle eine Frage…"
      : "Ask anything…";

  const disclaimer =
    responseLanguage === "de"
      ? "KI kann Fehler machen. Wichtige Informationen überprüfen."
      : "AI can make mistakes. Verify important information.";

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [value]);

  const submit = () => {
    if (!value.trim() || disabled || streaming) return;
    onSend(value.trim());
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="shrink-0 bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8] to-transparent px-4 pb-4 pt-2 dark:from-[#212121] dark:via-[#212121]">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            "relative flex items-end gap-2 rounded-[26px] border border-gray-200 bg-white px-4 py-3 shadow-sm",
            "dark:border-white/10 dark:bg-[#2f2f2f]",
            "focus-within:border-gray-300 focus-within:shadow-md dark:focus-within:border-white/20"
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            rows={1}
            placeholder={placeholder}
            className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent py-0.5 text-[15px] leading-6 text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
          />

          {streaming ? (
            <button
              type="button"
              onClick={onStop}
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              aria-label="Stop"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim() || disabled}
              className={cn(
                "mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                value.trim() && !disabled
                  ? "bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  : "bg-gray-200 text-gray-400 dark:bg-white/10 dark:text-gray-500"
              )}
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-gray-400">{disclaimer}</p>
      </div>
    </div>
  );
}
