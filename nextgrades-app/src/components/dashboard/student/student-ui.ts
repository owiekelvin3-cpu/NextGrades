/** Shared styles and helpers for student dashboard - theme-aware via design tokens */

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Atom,
  Languages,
  Headphones,
  Palette,
} from "lucide-react";

export const SUBJECT_COLORS = ["#2563EB", "#16A34A", "#D97706", "#9333EA", "#DC2626", "#0891B2"];

/** Theme-aware Tailwind class bundles */
export const st = {
  textPrimary: "text-foreground",
  textMuted: "text-text-muted",
  textSubtle: "text-text-muted/80",
  panel: "student-panel rounded-2xl border border-border-default bg-surface-elevated shadow-[var(--card-shadow)]",
  panelHeader: "border-b border-border-default px-5 py-3.5",
  listRow: "rounded-xl px-3 py-3 transition hover:bg-[var(--table-row-hover)]",
  empty: "text-sm text-text-muted",
  appointmentRow:
    "flex flex-col gap-4 rounded-xl border border-border-default bg-surface-subtle/50 p-4 transition hover:border-[var(--brand-gold)]/25 hover:shadow-sm sm:flex-row sm:items-center",
  appointmentRowToday: "border-[var(--brand-gold)]/30 bg-[var(--brand-gold-muted)]",
  dateBadge:
    "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border-default bg-surface-elevated text-center",
  dateBadgeToday: "border-[var(--brand-gold)]/35 bg-[var(--brand-gold-muted)]",
  dateBadgeLg:
    "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-border-default bg-surface-elevated text-center",
  dateDay: "text-xl font-bold leading-none text-foreground",
  dateDayLg: "text-2xl font-bold leading-none text-foreground",
  progressTrack: "h-1.5 overflow-hidden rounded-full bg-surface-subtle",
  progressTrackMd: "h-2 overflow-hidden rounded-full bg-surface-subtle",
  progressBar: "h-full rounded-full bg-[var(--brand-gold)]",
  progressBarGold: "h-full rounded-full bg-[var(--brand-gold)]",
  courseCard: "rounded-xl border border-border-default bg-surface-subtle/50 p-3",
  tabActive: "border-[var(--brand-gold)] font-semibold text-foreground",
  tabInactive: "border-transparent text-text-muted hover:text-foreground",
  motivation: "rounded-2xl border border-border-default bg-surface-subtle/60 p-6 sm:p-8",
  statIconGold:
    "text-[var(--brand-gold)] bg-[var(--brand-gold-muted)] ring-[var(--brand-gold)]/15",
  statIconBlue:
    "text-blue-600 bg-blue-50 ring-blue-100 dark:text-blue-300 dark:bg-blue-500/12 dark:ring-blue-500/15",
  statIconEmerald:
    "text-emerald-600 bg-emerald-50 ring-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/12 dark:ring-emerald-500/15",
  statIconViolet:
    "text-violet-600 bg-violet-50 ring-violet-100 dark:text-violet-300 dark:bg-violet-500/12 dark:ring-violet-500/15",
  divider: "divide-y divide-border-default",
  /** Two-column student page: main + aside from lg */
  pageGrid: "mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-[1fr_minmax(0,300px)] xl:grid-cols-[1fr_minmax(0,320px)]",
  asideWidgets: "order-2 space-y-4 lg:order-none",
  mainColumn: "order-1 min-w-0 space-y-4 lg:order-none",
  input: "rounded-xl border border-input-border bg-input-background px-3 py-2 text-sm text-input-foreground",
  tableHead:
    "border-b border-[var(--table-border)] bg-[var(--table-header)] text-xs font-semibold uppercase tracking-wide text-text-muted",
  tableRow: "hover:bg-[var(--table-row-hover)]",
  iconBtn:
    "rounded-lg p-2 text-text-muted transition hover:bg-[var(--table-row-hover)] hover:text-foreground",
  unreadBg: "bg-[var(--brand-gold-muted)]",
  goldChip: "rounded-lg bg-[var(--brand-gold-muted)] px-2 py-1 text-xs font-medium text-[var(--brand-gold)]",
  goldIconWrap: "flex items-center justify-center rounded-xl bg-[var(--brand-gold-muted)] text-[var(--brand-gold)]",
  promoCard: "rounded-2xl border border-[var(--brand-gold)]/20 bg-[var(--brand-gold-muted)] p-5",
  donutTrack: "text-surface-subtle",
  donutFill: "text-[var(--brand-gold)]",
  listHover: "transition hover:bg-[var(--table-row-hover)]",
  fileIcon:
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100 dark:bg-red-500/12 dark:text-red-300 dark:ring-red-500/15",
  stepIconBlue: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  stepIconOrange: "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  stepIconGreen: "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400",
  motivationBanner: "rounded-2xl border border-blue-100 bg-blue-50/80 p-4 sm:p-5 dark:border-blue-500/20 dark:bg-blue-500/10",
  /** Mobile dashboard (reference UI) */
  mobileHero:
    "relative overflow-hidden rounded-3xl border border-[var(--brand-gold)]/20 bg-gradient-to-br from-[var(--brand-gold-muted)] via-surface-elevated to-surface-subtle p-5 shadow-[var(--card-shadow)] dark:from-[var(--brand-navy)]/80 dark:via-surface-elevated dark:to-[var(--brand-navy-muted)]",
  mobileSubjectActive:
    "border-transparent bg-[var(--brand-navy)] text-white shadow-md dark:bg-[var(--brand-gold)] dark:text-[var(--brand-navy)]",
  mobileSubjectIdle:
    "border-border-default bg-surface-elevated text-foreground hover:border-[var(--brand-gold)]/30",
  mobileCourseCard:
    "w-[72vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-3xl border border-border-default bg-surface-elevated shadow-[var(--card-shadow)]",
  mobileInstructorCard:
    "flex items-center gap-3 rounded-2xl border border-border-default bg-surface-elevated p-3 shadow-sm",
  mobileSectionLink: "text-sm font-semibold text-[var(--brand-gold)]",
} as const;

export function subjectIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("math") || n.includes("mathe")) return Calculator;
  if (n.includes("phys")) return Atom;
  if (n.includes("chem")) return FlaskConical;
  if (n.includes("engl") || n.includes("liter") || n.includes("deutsch") || n.includes("sprach"))
    return Languages;
  if (n.includes("music") || n.includes("musik")) return Headphones;
  if (n.includes("art") || n.includes("kunst")) return Palette;
  if (n.includes("bio")) return FlaskConical;
  return BookOpen;
}

export function studentPanel(className = "") {
  return `student-panel ${className}`;
}

export function subjectInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function subjectColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

export function formatTimeRange(start: string, durationMin: number, locale: string) {
  const s = new Date(start);
  const e = new Date(s.getTime() + durationMin * 60 * 1000);
  const fmt = (d: Date) => d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${fmt(s)} – ${fmt(e)}`;
}

export function lessonDateParts(dateString: string, locale: string, todayLabel: string) {
  const date = new Date(dateString);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  return {
    day: date.getDate(),
    month: date.toLocaleDateString(locale, { month: "short" }).toUpperCase(),
    weekday: isToday
      ? todayLabel
      : date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }),
    isToday,
    full: date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  };
}

export function materialTypeLabel(type: string, tFn: (key: string, options?: Record<string, unknown>) => string) {
  const map: Record<string, string> = {
    pdf: "PDF",
    video: tFn("studentDashboard.typeVideo", { defaultValue: "Video" }),
    excel: "Excel",
    image: tFn("studentDashboard.typeImage", { defaultValue: "Image" }),
    other: tFn("studentDashboard.typeOther", { defaultValue: "File" }),
  };
  return map[type] ?? type.toUpperCase();
}

export function materialTypeColor(type: string) {
  const map: Record<string, string> = {
    pdf: "bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-300",
    video: "bg-purple-50 text-purple-600 dark:bg-purple-500/12 dark:text-purple-300",
    excel: "bg-green-50 text-green-600 dark:bg-green-500/12 dark:text-green-300",
    image: "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300",
    other: "bg-surface-subtle text-text-muted",
  };
  return map[type] ?? map.other;
}
