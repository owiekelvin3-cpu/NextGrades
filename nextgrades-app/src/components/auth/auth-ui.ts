import { cn } from "@/lib/utils";
import { theme as t } from "@/lib/theme/tokens";

/** Shared auth surface tokens - automatic light/dark via CSS variables. */
export function authSurface(_isDark?: boolean) {
  return {
    pageBg: t.dashboard,
    card: cn(t.card, "border"),
    cardShadow: "shadow-[var(--card-shadow)]",
    heading: t.textPrimary,
    body: t.textMuted,
    label: t.textSecondary,
    input: cn(
      t.inputLegacy,
      "py-3.5 pl-11 pr-4 focus:ring-[var(--input-focus-ring)]"
    ),
    inputWithTrail: "pr-12",
    tabTrack: "rounded-2xl bg-surface-subtle p-1",
    tabActive: "rounded-xl bg-surface-elevated text-foreground shadow-sm",
    tabIdle: "text-text-muted hover:text-foreground",
    dividerLine: "border-border-default",
    dividerText: "bg-surface-elevated text-text-muted",
    socialBtn: cn(
      "flex w-full items-center justify-center gap-2.5 rounded-2xl border border-border-default px-4 py-3 text-sm font-medium transition",
      "bg-surface-elevated text-foreground hover:border-[var(--brand-gold)]/35 hover:bg-surface-muted"
    ),
    errorBox: t.alertError,
    link: "font-medium text-[var(--brand-gold)] hover:text-[var(--brand-gold-light)]",
  };
}
