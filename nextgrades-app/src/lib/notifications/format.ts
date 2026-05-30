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
      return "text-green-500 bg-green-50 dark:bg-green-900/20";
    case "warning":
      return "text-orange-500 bg-orange-50 dark:bg-orange-900/20";
    case "error":
      return "text-red-500 bg-red-50 dark:bg-red-900/20";
    default:
      return "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
  }
}
