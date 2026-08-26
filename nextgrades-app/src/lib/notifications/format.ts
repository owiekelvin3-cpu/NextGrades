import type { NotificationCategory } from "./types";

export function formatRelativeTime(iso: string, locale = "en"): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);
  const isDe = locale.startsWith("de");

  if (diffSec < 60) return isDe ? "Gerade eben" : "Just now";
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    return isDe ? `vor ${m} Min.` : `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    return isDe ? `vor ${h} Std.` : `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const diffDays = Math.floor(diffSec / 86400);
  if (diffDays === 1) return isDe ? "Gestern" : "Yesterday";
  if (diffDays < 7) return isDe ? `vor ${diffDays} Tagen` : `${diffDays} days ago`;

  return date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

export function categoryLabel(category: NotificationCategory, locale = "en"): string {
  const isDe = locale.startsWith("de");
  const labels: Record<NotificationCategory, { en: string; de: string }> = {
    resource: { en: "Resources", de: "Materialien" },
    course: { en: "Courses", de: "Kurse" },
    live_class: { en: "Live classes", de: "Live-Stunden" },
    assignment: { en: "Assignments", de: "Aufgaben" },
    grade: { en: "Grades", de: "Noten" },
    exam: { en: "Exams", de: "Prüfungen" },
    message: { en: "Messages", de: "Nachrichten" },
    announcement: { en: "Announcements", de: "Ankündigungen" },
    account: { en: "Account", de: "Konto" },
    enrollment: { en: "Enrollment", de: "Einschreibung" },
    submission: { en: "Submissions", de: "Abgaben" },
    system: { en: "System", de: "System" },
  };
  return isDe ? labels[category].de : labels[category].en;
}

export function typeIconColor(type: string): string {
  switch (type) {
    case "success":
      return "text-green-600 bg-green-50 ring-green-100 dark:bg-green-900/20 dark:ring-green-800/30";
    case "warning":
      return "text-amber-600 bg-amber-50 ring-amber-100 dark:bg-amber-900/20 dark:ring-amber-800/30";
    case "error":
      return "text-red-600 bg-red-50 ring-red-100 dark:bg-red-900/20 dark:ring-red-800/30";
    default:
      return "text-[var(--brand-gold)] bg-[var(--brand-gold-muted)] ring-[var(--brand-gold)]/20";
  }
}

export function typeAccent(type: string): string {
  return typeIconColor(type);
}

export function categoryAccent(category: NotificationCategory): string {
  const accents: Record<NotificationCategory, string> = {
    announcement: "text-violet-600 bg-violet-50 ring-violet-100 dark:bg-violet-900/20 dark:ring-violet-800/30",
    resource: "text-sky-600 bg-sky-50 ring-sky-100 dark:bg-sky-900/20 dark:ring-sky-800/30",
    live_class: "text-[#2D8CFF] bg-blue-50 ring-blue-100 dark:bg-blue-900/20 dark:ring-blue-800/30",
    assignment: "text-orange-600 bg-orange-50 ring-orange-100 dark:bg-orange-900/20 dark:ring-orange-800/30",
    grade: "text-emerald-600 bg-emerald-50 ring-emerald-100 dark:bg-emerald-900/20 dark:ring-emerald-800/30",
    message: "text-indigo-600 bg-indigo-50 ring-indigo-100 dark:bg-indigo-900/20 dark:ring-indigo-800/30",
    account: "text-text-muted bg-surface-subtle ring-1 ring-border-default",
    course: "text-teal-600 bg-teal-50 ring-teal-100 dark:bg-teal-900/20 dark:ring-teal-800/30",
    exam: "text-rose-600 bg-rose-50 ring-rose-100 dark:bg-rose-900/20 dark:ring-rose-800/30",
    enrollment: "text-[var(--brand-gold)] bg-[var(--brand-gold-muted)] ring-[var(--brand-gold)]/20",
    submission: "text-cyan-600 bg-cyan-50 ring-cyan-100 dark:bg-cyan-900/20 dark:ring-cyan-800/30",
    system: "text-text-muted bg-surface-subtle ring-1 ring-border-default",
  };
  return accents[category];
}

export type NotificationDateGroup = "today" | "yesterday" | "this_week" | "earlier";

export function getNotificationDateGroup(iso: string): NotificationDateGroup {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return "today";
  if (date >= startOfYesterday) return "yesterday";
  if (date >= startOfWeek) return "this_week";
  return "earlier";
}

export function dateGroupLabel(group: NotificationDateGroup, locale = "en"): string {
  const isDe = locale.startsWith("de");
  const labels: Record<NotificationDateGroup, { en: string; de: string }> = {
    today: { en: "Today", de: "Heute" },
    yesterday: { en: "Yesterday", de: "Gestern" },
    this_week: { en: "This week", de: "Diese Woche" },
    earlier: { en: "Earlier", de: "Früher" },
  };
  return isDe ? labels[group].de : labels[group].en;
}

/** Map legacy English notification copy (stored before German-first) to DE for display. */
const TITLE_EN_TO_DE: Record<string, string> = {
  "Quiz submitted": "Quiz abgegeben",
  "Grade released": "Note veröffentlicht",
  "Resource published successfully": "Material erfolgreich veröffentlicht",
  "Resource updated & published": "Material aktualisiert und veröffentlicht",
  "Material approved": "Material freigegeben",
  "Submitted for review": "Zur Prüfung eingereicht",
  "Resource awaiting review": "Material wartet auf Prüfung",
  "Teacher published new material": "Lehrkraft hat neues Material veröffentlicht",
  "New appointment request": "Neuer Terminwunsch",
  "Student appointment request": "Terminwunsch von SchülerIn",
  "New user registration": "Neue Registrierung",
};

export function localizeNotificationTitle(title: string, locale = "de"): string {
  if (!locale.startsWith("de")) return title;
  return TITLE_EN_TO_DE[title] ?? title;
}

export function localizeNotificationMessage(message: string | null | undefined, locale = "de"): string {
  if (!message) return "";
  if (!locale.startsWith("de")) return message;

  let out = message;
  out = out.replace(/^"(.+?)" was submitted successfully\.?$/i, "„$1“ wurde erfolgreich abgegeben.");
  out = out.replace(/^"(.+?)" is now live on the Resources page\.?$/i, "„$1“ ist jetzt in der Lernbibliothek sichtbar.");
  out = out.replace(/^"(.+?)" was published\.?$/i, "„$1“ wurde veröffentlicht.");
  out = out.replace(/^"(.+?)" was approved by moderation\.?$/i, "„$1“ wurde von der Prüfung freigegeben.");
  out = out.replace(
    /^"(.+?)" is in the admin review queue\. You will be notified when it is approved\.?$/i,
    "„$1“ liegt in der Admin-Prüfung. Du wirst benachrichtigt, sobald es freigegeben ist."
  );
  out = out.replace(
    /^(.+?) submitted "(.+?)" \((Free|Premium)\) for moderation\.?$/i,
    (_, who: string, title: string, access: string) =>
      `${who} hat „${title}“ (${access === "Premium" ? "Premium" : "Kostenlos"}) zur Freigabe eingereicht.`
  );
  out = out.replace(
    /^(.+?) requested a new appointment\.\s*·\s*Preferred time:\s*(.+)$/i,
    "$1 hat einen neuen Terminwunsch gesendet. · Wunschzeit: $2"
  );
  out = out.replace(
    /^(.+?) registered as (student|teacher|admin)\.?$/i,
    (_, name: string, role: string) =>
      `${name} hat sich als ${
        role === "teacher" ? "Lehrkraft" : role === "admin" ? "Administrator" : "SchülerIn"
      } registriert.`
  );
  out = out.replace(/\bPreferred time:\b/gi, "Wunschzeit:");
  out = out.replace(/\bat\b/gi, "um");
  return out;
}
