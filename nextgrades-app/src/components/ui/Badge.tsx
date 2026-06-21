
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "success" | "warning" | "outline" | "info";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface-subtle text-foreground-secondary border border-border-default",
    gold: "bg-[var(--brand-gold-muted)] text-[var(--brand-gold)] border border-[var(--brand-gold)]/20",
    success: "theme-alert-success border",
    warning: "theme-alert-warning border",
    info: "theme-alert-info border",
    outline: "border border-border-default bg-transparent text-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
