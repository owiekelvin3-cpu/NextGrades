/** Shared styles and helpers for student dashboard (matches UI mockups) */

export const SUBJECT_COLORS = ["#2563EB", "#16A34A", "#D97706", "#9333EA", "#DC2626", "#0891B2"];

export function studentPanel(className = "") {
  return `rounded-2xl border border-border-default bg-surface-elevated shadow-sm ${className}`;
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
    pdf: "bg-red-50 text-red-600",
    video: "bg-purple-50 text-purple-600",
    excel: "bg-green-50 text-green-600",
    image: "bg-blue-50 text-blue-600",
    other: "bg-gray-50 text-gray-600",
  };
  return map[type] ?? map.other;
}
