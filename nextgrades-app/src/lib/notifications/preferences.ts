import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_SOUND_IDS,
  type NotificationCategory,
  type NotificationPreferences,
  type NotificationSoundId,
} from "./types";

function isSoundId(value: unknown): value is NotificationSoundId {
  return typeof value === "string" && (NOTIFICATION_SOUND_IDS as readonly string[]).includes(value);
}

export function mergeNotificationPreferences(
  raw: unknown
): NotificationPreferences {
  const base = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    categories: { ...DEFAULT_NOTIFICATION_PREFERENCES.categories },
    categorySounds: { ...DEFAULT_NOTIFICATION_PREFERENCES.categorySounds },
  };
  if (!raw || typeof raw !== "object") return base;

  const obj = raw as Partial<NotificationPreferences>;
  const categories = { ...base.categories };
  const categorySounds = { ...base.categorySounds };

  if (obj.categories && typeof obj.categories === "object") {
    for (const cat of NOTIFICATION_CATEGORIES) {
      if (typeof (obj.categories as Record<string, unknown>)[cat] === "boolean") {
        categories[cat] = (obj.categories as Record<string, boolean>)[cat];
      }
    }
  }

  if (obj.categorySounds && typeof obj.categorySounds === "object") {
    for (const cat of NOTIFICATION_CATEGORIES) {
      const val = (obj.categorySounds as Record<string, unknown>)[cat];
      if (isSoundId(val)) categorySounds[cat] = val;
    }
  }

  return {
    pushEnabled: typeof obj.pushEnabled === "boolean" ? obj.pushEnabled : base.pushEnabled,
    soundEnabled: typeof obj.soundEnabled === "boolean" ? obj.soundEnabled : base.soundEnabled,
    emailEnabled: typeof obj.emailEnabled === "boolean" ? obj.emailEnabled : base.emailEnabled,
    defaultSoundId: isSoundId(obj.defaultSoundId) ? obj.defaultSoundId : base.defaultSoundId,
    categorySounds,
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

export function resolveNotificationSound(
  prefs: NotificationPreferences,
  category: NotificationCategory
): NotificationSoundId {
  return prefs.categorySounds[category] ?? prefs.defaultSoundId;
}
