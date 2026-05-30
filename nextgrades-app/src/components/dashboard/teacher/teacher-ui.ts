/** Shared styles and helpers for teacher dashboard (matches UI mockups) */

export const TEACHER_AVATAR_COLORS = ["#D4AF37", "#4DA3FF", "#22C55E", "#A855F7", "#F97316", "#EC4899"];

export function teacherPanel(className = "") {
  return `rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`;
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
