"use client";

import { Loader2 } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";

const fieldInput =
  "w-full rounded-xl border border-input-border bg-input-background px-4 py-2.5 text-sm text-input-foreground outline-none transition placeholder:text-input-placeholder focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[var(--input-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60";

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
  return (
    <section className={cn("rounded-2xl border border-border-default bg-surface-elevated p-6 shadow-sm", className)}>
      <div className="mb-6 flex items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10">
            <Icon className="h-5 w-5 text-[#D4AF37]" />
          </div>
        )}
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-text-muted">{description}</p>}
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
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export function SettingsInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldInput, className)} {...props} />;
}

export function SettingsTextarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldInput, "resize-none", className)} {...props} />;
}

export function SettingsSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldInput, className)} {...props}>
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
  variant?: "card" | "row";
}) {
  return (
    <div
      className={cn(
        "flex min-h-[56px] touch-manipulation items-center justify-between gap-4 py-3.5",
        variant === "card" && "rounded-xl border border-border-default bg-surface-subtle px-4 dark:bg-[#0D1B2A]",
        variant === "row" && "border-b border-border-default px-4 last:border-b-0"
      )}
    >
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{description}</p>}
      </div>
      {loading ? (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#D4AF37]" aria-hidden />
      ) : (
        <Toggle checked={checked} onChange={onChange} disabled={disabled || loading} label={label} size="lg" />
      )}
    </div>
  );
}

export function SettingsToggleGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      {title && (
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</p>
      )}
      <div className="overflow-hidden rounded-xl border border-border-default bg-surface-subtle dark:bg-[#0D1B2A]">
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
  return (
    <div className="flex justify-end border-t border-border-default pt-4">
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
