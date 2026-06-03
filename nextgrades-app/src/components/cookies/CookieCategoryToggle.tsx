"use client";

import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  alwaysOnLabel?: string;
};

export function CookieCategoryToggle({
  id,
  label,
  description,
  checked,
  disabled = false,
  onChange,
  alwaysOnLabel,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        disabled ? "border-border-default/60 bg-surface-subtle/50" : "border-border-default bg-surface-elevated"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="text-sm font-semibold text-foreground">
            {label}
          </label>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">{description}</p>
          {disabled && alwaysOnLabel ? (
            <p className="mt-2 text-xs font-medium text-[#D4AF37]">{alwaysOnLabel}</p>
          ) : null}
        </div>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2",
            disabled ? "cursor-not-allowed bg-[#D4AF37]/40" : checked ? "bg-[#D4AF37]" : "bg-gray-300 dark:bg-white/20"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
              checked && !disabled ? "translate-x-5" : "translate-x-0"
            )}
          />
          <span className="sr-only">{label}</span>
        </button>
      </div>
    </div>
  );
}
