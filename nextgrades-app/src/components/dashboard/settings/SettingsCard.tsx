"use client";



import { useTheme } from "@/context/ThemeContext";

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

}: {

  label: string;

  description?: string;

  checked: boolean;

  onChange: (v: boolean) => void;

}) {

  const { theme } = useTheme();



  return (

    <div

      className={cn(

        "flex items-center justify-between gap-4 rounded-xl border px-4 py-3",

        theme === "dark" ? "border-white/10 bg-[#0D1B2A]" : "border-gray-100 bg-[#FAFBFC]"

      )}

    >

      <div>

        <p className={cn("text-sm font-medium", theme === "dark" ? "text-white" : "text-[#0D1B2A]")}>{label}</p>

        {description && (

          <p className={cn("text-xs", theme === "dark" ? "text-gray-400" : "text-gray-500")}>{description}</p>

        )}

      </div>

      <button

        type="button"

        role="switch"

        aria-checked={checked}

        onClick={() => onChange(!checked)}

        className={cn(

          "relative h-6 w-11 shrink-0 rounded-full transition-colors",

          checked ? "bg-[#D4AF37]" : "bg-gray-300"

        )}

      >

        <span

          className={cn(

            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",

            checked ? "translate-x-5" : "translate-x-0.5"

          )}

        />

      </button>

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


