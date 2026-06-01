/** Shared styles and helpers for student dashboard — light & dark mode */

export const SUBJECT_COLORS = ["#2563EB", "#16A34A", "#D97706", "#9333EA", "#DC2626", "#0891B2"];

/** Theme-aware Tailwind class bundles */
export const st = {
  textPrimary: "text-foreground",
  textMuted: "text-text-muted",
  textSubtle: "text-text-muted/80",
  panel: "rounded-2xl border border-border-default bg-surface-elevated shadow-sm",
  panelHeader:
    "border-b border-border-default bg-surface-subtle/80 dark:bg-white/[0.03] px-5 py-4",
  listRow:
    "rounded-xl px-3 py-3 transition hover:bg-surface-subtle dark:hover:bg-white/[0.04]",
  empty: "text-sm text-text-muted",
  appointmentRow:
    "flex flex-col gap-4 rounded-xl border border-border-default bg-surface-subtle/50 p-4 transition hover:border-[#D4AF37]/25 hover:shadow-sm dark:bg-white/[0.03] sm:flex-row sm:items-center",
  appointmentRowToday:
    "border-[#D4AF37]/30 bg-[#D4AF37]/8 dark:border-[#D4AF37]/35 dark:bg-[#D4AF37]/10",
  dateBadge:
    "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border-default bg-surface-elevated text-center",
  dateBadgeToday: "border-[#D4AF37]/40 bg-[#D4AF37]/12 dark:bg-[#D4AF37]/15",
  dateBadgeLg:
    "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-border-default bg-surface-elevated text-center",
  dateDay: "text-xl font-bold leading-none text-foreground",
  dateDayLg: "text-2xl font-bold leading-none text-foreground",
  progressTrack: "h-1.5 overflow-hidden rounded-full bg-surface-subtle dark:bg-white/10",
  progressTrackMd: "h-2 overflow-hidden rounded-full bg-surface-subtle dark:bg-white/10",
  progressBar: "h-full rounded-full bg-[#D4AF37]",
  progressBarGold: "h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5A623]",
  courseCard:
    "rounded-xl border border-border-default bg-surface-subtle/50 p-3 dark:bg-white/[0.03]",
  tabActive: "border-[#D4AF37] font-semibold text-foreground",
  tabInactive: "border-transparent text-text-muted hover:text-foreground",
  motivation:
    "relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/10 via-surface-elevated to-surface-subtle p-6 shadow-sm dark:from-[#D4AF37]/12 dark:via-[#112240] dark:to-[#0D1B2A] sm:p-8",
  statIconGold: "text-[#D4AF37] bg-[#D4AF37]/12 ring-[#D4AF37]/20 dark:bg-[#D4AF37]/15",
  statIconBlue:
    "text-blue-600 bg-blue-50 ring-blue-100 dark:text-blue-400 dark:bg-blue-500/15 dark:ring-blue-500/20",
  statIconEmerald:
    "text-emerald-600 bg-emerald-50 ring-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/15 dark:ring-emerald-500/20",
  statIconViolet:
    "text-violet-600 bg-violet-50 ring-violet-100 dark:text-violet-400 dark:bg-violet-500/15 dark:ring-violet-500/20",
  divider: "divide-y divide-border-default",
  input:
    "rounded-xl border border-border-default bg-surface-elevated px-3 py-2 text-sm text-foreground",
  tableHead:
    "border-b border-border-default bg-surface-subtle/80 text-xs font-semibold uppercase tracking-wide text-text-muted",
  tableRow: "hover:bg-surface-subtle/60 dark:hover:bg-white/[0.03]",
  iconBtn: "rounded-lg p-2 text-text-muted transition hover:bg-surface-subtle hover:text-foreground",
  unreadBg: "bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15",
  fileIcon: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100 dark:bg-red-500/15 dark:ring-red-500/20",
} as const;

export function studentPanel(className = "") {
  return `${st.panel} ${className}`;
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

export function materialTypeLabel(type: string, t: (key: string, options?: Record<string, unknown>) => string) {
  const map: Record<string, string> = {
    pdf: "PDF",
    video: t("studentDashboard.typeVideo", { defaultValue: "Video" }),
    excel: "Excel",
    image: t("studentDashboard.typeImage", { defaultValue: "Image" }),
    other: t("studentDashboard.typeOther", { defaultValue: "File" }),
  };
  return map[type] ?? type.toUpperCase();
}

export function materialTypeColor(type: string) {
  const map: Record<string, string> = {
    pdf: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    video: "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
    excel: "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400",
    image: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    other: "bg-surface-subtle text-text-muted dark:bg-white/10",
  };
  return map[type] ?? map.other;
}
