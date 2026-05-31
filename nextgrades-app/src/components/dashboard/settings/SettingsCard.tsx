"use client";

import { Loader2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";



export function SettingsCard({

  title,

  description,

  icon: Icon,

  children,

  className,

}: {

  title: string;

  description?: string;

  icon?: React.ComponentType<{ className?: string }>;

  children: React.ReactNode;

  className?: string;

}) {

  const { theme } = useTheme();



  return (

    <section

      className={cn(

        "rounded-2xl border p-6 shadow-sm",

        theme === "dark" ? "border-white/10 bg-[#112240]" : "border-gray-100 bg-white",

        className

      )}

    >

      <div className="mb-6 flex items-start gap-3">

        {Icon && (

          <div

            className={cn(

              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",

              theme === "dark" ? "bg-white/10" : "bg-[#0D1B2A]/5"

            )}

          >

            <Icon className={cn("h-5 w-5", theme === "dark" ? "text-[#D4AF37]" : "text-[#0D1B2A]")} />

          </div>

        )}

        <div>

          <h2 className={cn("text-base font-bold", theme === "dark" ? "text-white" : "text-[#0D1B2A]")}>{title}</h2>

          {description && (

            <p className={cn("mt-0.5 text-sm", theme === "dark" ? "text-gray-400" : "text-gray-500")}>{description}</p>

          )}

        </div>

      </div>

      {children}

    </section>

  );

}



export function SettingsField({

  label,

  hint,

  children,

}: {

  label: string;

  hint?: string;

  children: React.ReactNode;

}) {

  const { theme } = useTheme();



  return (

    <div className="space-y-1.5">

      <label className={cn("block text-sm font-medium", theme === "dark" ? "text-white" : "text-[#0D1B2A]")}>

        {label}

      </label>

      {children}

      {hint && <p className={cn("text-xs", theme === "dark" ? "text-gray-500" : "text-gray-400")}>{hint}</p>}

    </div>

  );

}



export function SettingsInput({

  className,

  ...props

}: React.InputHTMLAttributes<HTMLInputElement>) {

  const { theme } = useTheme();



  return (

    <input

      className={cn(

        "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition",

        "focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20",

        "disabled:cursor-not-allowed disabled:opacity-60",

        theme === "dark"

          ? "border-white/15 bg-[#0D1B2A] text-white placeholder:text-gray-500"

          : "border-gray-200 bg-[#FAFBFC] text-[#0D1B2A] placeholder:text-gray-400",

        className

      )}

      {...props}

    />

  );

}



export function SettingsTextarea({

  className,

  ...props

}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {

  const { theme } = useTheme();



  return (

    <textarea

      className={cn(

        "w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition",

        "focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20",

        "disabled:cursor-not-allowed disabled:opacity-60",

        theme === "dark"

          ? "border-white/15 bg-[#0D1B2A] text-white placeholder:text-gray-500"

          : "border-gray-200 bg-[#FAFBFC] text-[#0D1B2A] placeholder:text-gray-400",

        className

      )}

      {...props}

    />

  );

}



export function SettingsSelect({

  className,

  children,

  ...props

}: React.SelectHTMLAttributes<HTMLSelectElement>) {

  const { theme } = useTheme();



  return (

    <select

      className={cn(

        "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition",

        "focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20",

        theme === "dark"

          ? "border-white/15 bg-[#0D1B2A] text-white"

          : "border-gray-200 bg-[#FAFBFC] text-[#0D1B2A]",

        className

      )}

      {...props}

    >

      {children}

    </select>

  );

}



export function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
  loading,
  variant = "card",
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  /** card = bordered box; row = list row inside a group */
  variant?: "card" | "row";
}) {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "flex min-h-[56px] touch-manipulation items-center justify-between gap-4 py-3.5",
        variant === "card" && "rounded-xl border px-4",
        variant === "card" &&
          (theme === "dark" ? "border-white/10 bg-[#0D1B2A]" : "border-gray-100 bg-[#FAFBFC]"),
        variant === "row" && "border-b px-4 last:border-b-0",
        variant === "row" && (theme === "dark" ? "border-white/10" : "border-gray-100")
      )}
    >
      <div className="min-w-0 flex-1 pr-2">
        <p className={cn("text-sm font-medium", theme === "dark" ? "text-white" : "text-[#0D1B2A]")}>{label}</p>
        {description && (
          <p className={cn("mt-0.5 text-xs leading-relaxed", theme === "dark" ? "text-gray-400" : "text-gray-500")}>
            {description}
          </p>
        )}
      </div>
      {loading ? (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#D4AF37]" aria-hidden />
      ) : (
        <Toggle
          checked={checked}
          onChange={onChange}
          disabled={disabled || loading}
          label={label}
          size="lg"
        />
      )}
    </div>
  );
}

export function SettingsToggleGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <div className="space-y-1">
      {title && (
        <p
          className={cn(
            "mb-2 px-1 text-xs font-semibold uppercase tracking-wide",
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          )}
        >
          {title}
        </p>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-xl border",
          theme === "dark" ? "border-white/10 bg-[#0D1B2A]" : "border-gray-100 bg-[#FAFBFC]"
        )}
      >
        {children}
      </div>
    </div>
  );
}



export function SettingsSaveBar({

  saving,

  onSave,

  label = "Save changes",

  savingLabel = "Saving…",

}: {

  saving: boolean;

  onSave: () => void;

  label?: string;

  savingLabel?: string;

}) {

  const { theme } = useTheme();



  return (

    <div className={cn("flex justify-end border-t pt-4", theme === "dark" ? "border-white/10" : "border-gray-100")}>

      <button

        type="button"

        disabled={saving}

        onClick={onSave}

        className="rounded-xl bg-[#D4AF37] px-6 py-2.5 text-sm font-semibold text-[#0D1B2A] transition hover:opacity-90 disabled:opacity-50"

      >

        {saving ? savingLabel : label}

      </button>

    </div>

  );

}


