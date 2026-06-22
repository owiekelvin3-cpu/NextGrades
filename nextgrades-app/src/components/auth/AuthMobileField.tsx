"use client";

import { useTheme } from "@/context/ThemeContext";
import { theme as th } from "@/lib/theme/tokens";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  trailing?: React.ReactNode;
};

/** Mockup-style bordered field for mobile auth. */
export function AuthMobileField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  trailing,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-2">
      <label htmlFor={id} className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-[#374151]")}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            "w-full rounded-xl border px-4 py-3.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25",
            trailing && "pr-12",
            isDark
              ? "border-white/15 bg-[#0D1B2A]/50 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50"
              : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400 focus:border-[#D4AF37]",
            error && "border-red-400"
          )}
        />
        {trailing}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function AuthMobilePrimaryButton({
  children,
  loading,
  disabled,
  variant = "navy",
  type = "submit",
  onClick,
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: "navy" | "gold";
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "theme-btn-interaction w-full rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-wide",
        variant === "gold" ? th.btnGold : th.btnDark,
        th.focusRing
      )}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}

export function AuthRolePicker({
  value,
  onChange,
  studentLabel,
  teacherLabel,
}: {
  value: "student" | "teacher";
  onChange: (r: "student" | "teacher") => void;
  studentLabel: string;
  teacherLabel: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const base = cn(
    th.focusRing,
    "theme-btn-interaction w-full rounded-xl px-4 py-4 text-sm font-bold uppercase tracking-wider touch-manipulation"
  );

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => onChange("student")}
        className={cn(
          base,
          value === "student"
            ? isDark
              ? th.btnGold
              : th.btnDark
            : isDark
              ? cn(th.btnOutline, "border-white/20 text-white")
              : cn(th.btnOutline, "border-[var(--border-strong)]")
        )}
      >
        {studentLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("teacher")}
        className={cn(
          base,
          value === "teacher"
            ? isDark
              ? th.btnGold
              : th.btnDark
            : isDark
              ? cn(th.btnOutline, "border-white/20 text-white")
              : cn(th.btnOutline, "border-[var(--border-strong)]")
        )}
      >
        {teacherLabel}
      </button>
    </div>
  );
}
