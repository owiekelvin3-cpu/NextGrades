export const NOTIFICATION_CATEGORIES = [
  "resource",
  "course",
  "live_class",
  "assignment",
  "grade",
  "exam",
  "message",
  "announcement",
  "account",
  "enrollment",
  "submission",
  "system",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationType = "info" | "success" | "warning" | "error";

export type NotificationDeliveryStatus = "pending" | "delivered" | "failed" | "scheduled";

export type NotificationRecord = {
  id: string;
  user_id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string | null;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  entity_type: string | null;
  entity_id: string | null;
  delivery_status: NotificationDeliveryStatus;
  created_at: string;
};

export type NotificationCategoryPrefs = Record<NotificationCategory, boolean>;

export const NOTIFICATION_SOUND_IDS = [
  "chime",
  "bell",
  "ping",
  "soft",
  "message",
  "success",
  "alert",
  "glass",
  "pop",
  "digital",
] as const;

export type NotificationSoundId = (typeof NOTIFICATION_SOUND_IDS)[number];

export type NotificationCategorySoundPrefs = Partial<Record<NotificationCategory, NotificationSoundId>>;

export type NotificationPreferences = {
  pushEnabled: boolean;
  soundEnabled: boolean;
  emailEnabled: boolean;
  /** Default tone when a category has no custom sound */
  defaultSoundId: NotificationSoundId;
  /** Per-category notification sounds */
  categorySounds: NotificationCategorySoundPrefs;
  categories: NotificationCategoryPrefs;
  emailLessons: boolean;
  emailMaterials: boolean;
  emailMarketing: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  soundEnabled: true,
  emailEnabled: true,
  defaultSoundId: "chime",
  categorySounds: {},
  categories: {
    resource: true,
    course: true,
    live_class: true,
    assignment: true,
    grade: true,
    exam: true,
    message: true,
    announcement: true,
    account: true,
    enrollment: true,
    submission: true,
    system: true,
  },
  emailLessons: true,
  emailMaterials: true,
  emailMarketing: false,
};

export type CreateNotificationInput = {
  userId: string;
  type?: NotificationType;
  category: NotificationCategory;
  title: string;
  message?: string;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
  deliveryStatus?: NotificationDeliveryStatus;
  /** Skip push/sound if user disabled category */
  respectPreferences?: boolean;
};
