"use client";

import { cn } from "@/lib/utils";
import { mobile } from "@/lib/mobile/tokens";

type Props = {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export function MobileFormField({ label, error, hint, children, className }: Props) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && (
        <p className="text-sm font-medium text-red-500" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-sm text-text-muted">{hint}</p>}
    </div>
  );
}

const inputBase =
  "w-full min-h-12 rounded-2xl border border-input-border bg-input-background px-4 text-base text-input-foreground placeholder:text-input-placeholder transition-colors focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25 touch-manipulation";

export function MobileInput({
  className,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={cn(inputBase, error && "border-red-400 focus:border-red-400 focus:ring-red-400/25", className)}
      {...props}
    />
  );
}

export function MobileTextarea({
  className,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={cn(
        inputBase,
        "min-h-[120px] resize-y py-3",
        error && "border-red-400 focus:border-red-400 focus:ring-red-400/25",
        className
      )}
      {...props}
    />
  );
}

export function MobileSocialButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        mobile.button,
        "w-full border border-border-default bg-surface-elevated font-medium text-foreground shadow-sm hover:bg-surface-subtle",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
