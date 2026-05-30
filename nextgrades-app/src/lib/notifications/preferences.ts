import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
  type NotificationPreferences,
} from "./types";

export function mergeNotificationPreferences(
  raw: unknown
): NotificationPreferences {
  const base = { ...DEFAULT_NOTIFICATION_PREFERENCES, categories: { ...DEFAULT_NOTIFICATION_PREFERENCES.categories } };
  if (!raw || typeof raw !== "object") return base;

  const obj = raw as Partial<NotificationPreferences>;
  const categories = { ...base.categories };

  if (obj.categories && typeof obj.categories === "object") {
    for (const cat of NOTIFICATION_CATEGORIES) {
      if (typeof (obj.categories as Record<string, unknown>)[cat] === "boolean") {
        categories[cat] = (obj.categories as Record<string, boolean>)[cat];
      }
    }
  }

  return {
    pushEnabled: typeof obj.pushEnabled === "boolean" ? obj.pushEnabled : base.pushEnabled,
    soundEnabled: typeof obj.soundEnabled === "boolean" ? obj.soundEnabled : base.soundEnabled,
    emailEnabled: typeof obj.emailEnabled === "boolean" ? obj.emailEnabled : base.emailEnabled,
    categories,
    emailLessons: typeof obj.emailLessons === "boolean" ? obj.emailLessons : base.emailLessons,
    emailMaterials: typeof obj.emailMaterials === "boolean" ? obj.emailMaterials : base.emailMaterials,
    emailMarketing: typeof obj.emailMarketing === "boolean" ? obj.emailMarketing : base.emailMarketing,
  };
}

export function isCategoryEnabled(
  prefs: NotificationPreferences,
  category: NotificationCategory
): boolean {
  return prefs.categories[category] !== false;
}
