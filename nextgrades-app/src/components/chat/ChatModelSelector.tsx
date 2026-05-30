"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import type { AiModelInfo } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

interface ChatModelSelectorProps {
  models: AiModelInfo[];
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
  className?: string;
}

const BADGE_STYLES: Record<string, string> = {
  pro: "bg-[#D4AF37]/15 text-[#B8941F] dark:text-[#D4AF37]",
  quick: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  free: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

const BADGE_LABELS: Record<string, string> = {
  pro: "Pro",
  quick: "Quick",
  free: "Free",
};

export function ChatModelSelector({
  models,
  value,
  onChange,
  disabled,
  className,
}: ChatModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = models.find((m) => m.id === value) ?? models[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!models.length) return null;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
          "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10",
          disabled && "cursor-not-allowed opacity-50"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
        <span className="max-w-[140px] truncate">{selected?.label ?? "NextGrades AI"}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#1a2332]"
          role="listbox"
        >
          <div className="border-b border-gray-100 px-3 py-2 dark:border-white/10">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Choose assistant
            </p>
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {models.map((model) => (
              <li key={model.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={model.id === value}
                  onClick={() => {
                    onChange(model.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5",
                    model.id === value && "bg-gray-50 dark:bg-white/5"
                  )}
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#D4AF37]/10">
                    <Sparkles className="h-3 w-3 text-[#D4AF37]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {model.label}
                      </span>
                      {model.badge && (
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                            BADGE_STYLES[model.badge] ?? "bg-gray-100 text-gray-500"
                          )}
                        >
                          {model.badge ? (BADGE_LABELS[model.badge] ?? model.badge) : null}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-gray-500">{model.description}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
