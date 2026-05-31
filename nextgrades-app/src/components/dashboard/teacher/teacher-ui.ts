/** Shared styles and helpers for teacher dashboard (light professional workspace) */

export const TEACHER_AVATAR_COLORS = ["#D4AF37", "#4DA3FF", "#22C55E", "#A855F7", "#F97316", "#EC4899"];

export const teacherShell = "flex min-h-screen bg-[#F0F2F5] text-[#0D1B2A]";

export const teacherHeader =
  "border-b border-gray-200/80 bg-white/95 backdrop-blur-sm";

export function teacherPanel(className = "") {
  return `overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm ${className}`;
}

export function teacherStatCard(className = "") {
  return `flex min-h-[172px] flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#D4AF37]/25 hover:shadow-md ${className}`;
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
