import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { COMPANY_SUPPORT_EMAIL } from "@/lib/company";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "";
}

function getVapidPrivateKey(): string {
  return process.env.VAPID_PRIVATE_KEY?.trim() ?? "";
}

export function isPushConfigured(): boolean {
  return Boolean(getVapidPublicKey() && getVapidPrivateKey());
}

export function getPublicVapidKey(): string {
  return getVapidPublicKey();
}

/** Send web push to all subscriptions for a user. No-op if VAPID not configured. */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!isPushConfigured() || !isSupabaseServiceRoleConfigured()) return;

  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subs?.length) return;

  let webpush: typeof import("web-push");
  try {
    webpush = await import("web-push");
  } catch {
    console.warn("[push] web-push module not available");
    return;
  }

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL || COMPANY_SUPPORT_EMAIL}`,
    getVapidPublicKey(),
    getVapidPrivateKey()
  );

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/dashboard/notifications",
    tag: payload.tag,
  });

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    })
  );
}
