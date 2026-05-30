import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { mergeNotificationPreferences, isCategoryEnabled } from "./preferences";
import { sendPushToUser } from "./push";
import type { CreateNotificationInput, NotificationPreferences } from "./types";

export async function getUserNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  if (!isSupabaseServiceRoleConfigured()) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("notification_preferences")
    .eq("id", userId)
    .maybeSingle();
  return mergeNotificationPreferences(data?.notification_preferences);
}

/** Create a single in-app notification (server-only, uses service role). */
export async function createNotification(input: CreateNotificationInput): Promise<string | null> {
  if (!isSupabaseServiceRoleConfigured()) {
    console.warn("[notifications] Service role not configured — skipping notification");
    return null;
  }

  const admin = createAdminClient();
  const respect = input.respectPreferences !== false;

  if (respect) {
    const prefs = await getUserNotificationPreferences(input.userId);
    if (prefs && !isCategoryEnabled(prefs, input.category)) {
      return null;
    }
  }

  const row = {
    user_id: input.userId,
    type: input.type ?? "info",
    category: input.category,
    title: input.title,
    message: input.message ?? null,
    action_url: input.actionUrl ?? null,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    delivery_status: input.deliveryStatus ?? "delivered",
    is_read: false,
  };

  const { data, error } = await admin.from("notifications").insert(row).select("id").single();
  if (error) {
    console.error("[notifications] insert failed:", error.message);
    return null;
  }

  const notificationId = data.id as string;

  if (respect) {
    const prefs = await getUserNotificationPreferences(input.userId);
    if (prefs?.pushEnabled) {
      void sendPushToUser(input.userId, {
        title: input.title,
        body: input.message ?? input.title,
        url: input.actionUrl ?? "/dashboard/notifications",
        tag: notificationId,
      });
    }
  }

  return notificationId;
}

export async function createNotificationsForUsers(
  userIds: string[],
  input: Omit<CreateNotificationInput, "userId">
): Promise<number> {
  let count = 0;
  const unique = [...new Set(userIds.filter(Boolean))];
  for (const userId of unique) {
    const id = await createNotification({ ...input, userId });
    if (id) count += 1;
  }
  return count;
}

export async function createNotificationsForRole(
  role: "student" | "teacher" | "admin",
  input: Omit<CreateNotificationInput, "userId">
): Promise<number> {
  if (!isSupabaseServiceRoleConfigured()) return 0;
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id").eq("role", role);
  const ids = (data ?? []).map((p: { id: string }) => p.id);
  return createNotificationsForUsers(ids, input);
}

export async function createNotificationsForAllUsers(
  input: Omit<CreateNotificationInput, "userId">
): Promise<number> {
  if (!isSupabaseServiceRoleConfigured()) return 0;
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id");
  const ids = (data ?? []).map((p: { id: string }) => p.id);
  return createNotificationsForUsers(ids, input);
}

export async function getStudentIdsForEnrollment(subjectId?: string | null): Promise<string[]> {
  if (!isSupabaseServiceRoleConfigured()) return [];
  const admin = createAdminClient();
  let query = admin.from("enrollments").select("student_id").eq("status", "active");
  if (subjectId) query = query.eq("subject_id", subjectId);
  const { data } = await query;
  return [...new Set((data ?? []).map((e: { student_id: string }) => e.student_id))];
}
