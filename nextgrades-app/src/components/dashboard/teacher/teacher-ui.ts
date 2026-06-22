/** Shared styles and helpers for teacher dashboard — theme-aware via design tokens */

export const TEACHER_AVATAR_COLORS = ["#D4AF37", "#4DA3FF", "#22C55E", "#A855F7", "#F97316", "#EC4899"];

export const teacherShell = "flex min-h-screen bg-surface-dashboard text-foreground";

export const teacherHeader =
  "border-b border-border-default/80 bg-surface-elevated/95 backdrop-blur-sm";

/** Theme-aware Tailwind bundles (mirrors student `st`) */
export const tt = {
  textPrimary: "text-foreground",
  textMuted: "text-text-muted",
  textSubtle: "text-text-muted/80",
  panel: "rounded-2xl border border-border-default bg-surface-elevated shadow-[var(--card-shadow)]",
  panelInset: "rounded-2xl border border-border-default bg-surface-subtle/80",
  card: "rounded-2xl border border-border-default bg-surface-elevated shadow-sm",
  empty: "rounded-2xl border border-border-default bg-surface-subtle p-6 text-center text-sm text-text-muted",
  listRow: "rounded-xl px-3 py-3 transition hover:bg-[var(--table-row-hover)] active:bg-[var(--table-row-hover)]",
  divider: "divide-y divide-border-default",
  input:
    "w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-sm text-input-foreground placeholder:text-input-placeholder focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-ring)]",
  tableHead:
    "border-b border-[var(--table-border)] bg-[var(--table-header)] text-xs font-semibold uppercase tracking-wide text-text-muted",
  tableRow: "hover:bg-[var(--table-row-hover)]",
  tabActive: "border-[var(--brand-gold)] font-semibold text-foreground",
  tabInactive: "border-transparent text-text-muted hover:text-foreground",
  iconBtn:
    "rounded-lg p-2 text-text-muted transition hover:bg-[var(--table-row-hover)] hover:text-foreground",
  progressTrack: "h-2 overflow-hidden rounded-full bg-surface-subtle",
  progressBar: "h-full rounded-full bg-[var(--brand-gold)]",
  mobileSection: "space-y-6 px-5 pb-6 pt-4",
  mobileFeaturedOverlap: "-mt-4 px-5 pb-2 md:-mt-6",
} as const;

export function teacherPanel(className = "") {
  return `${tt.panel} overflow-hidden ${className}`;
}

export function teacherStatCard(className = "") {
  return `flex min-h-[160px] flex-col rounded-2xl border border-border-default bg-surface-elevated p-4 shadow-sm transition active:scale-[0.98] touch-manipulation md:min-h-[172px] md:p-5 md:hover:border-[var(--brand-gold)]/25 md:hover:shadow-md ${className}`;
}

export function formatTeacherEuro(amount: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
}

export function studentInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const BONUS_LEVELS = [
  { level: 1, hours: 10, rate: 5, labelKey: "teacherDashboard.bonusLevel1" },
  { level: 2, hours: 15, rate: 8, labelKey: "teacherDashboard.bonusLevel2" },
  { level: 3, hours: 20, rate: 12, labelKey: "teacherDashboard.bonusLevel3" },
  { level: 4, hours: 25, rate: 16, labelKey: "teacherDashboard.bonusLevel4" },
];
