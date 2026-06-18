import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { notifyAnnouncement } from "@/lib/notifications/triggers";

async function dispatchAnnouncement(announcement: {
  id: string;
  title: string;
  message: string;
  action_url: string | null;
  audience: "all" | "students" | "teachers" | "admins";
}) {
  const count = await notifyAnnouncement({
    title: announcement.title,
    message: announcement.message,
    actionUrl: announcement.action_url ?? undefined,
    audience: announcement.audience,
  });

  if (!isSupabaseServiceRoleConfigured()) return count;
  const admin = createAdminClient();
  await admin
    .from("scheduled_announcements")
    .update({
      delivery_status: "sent",
      sent_at: new Date().toISOString(),
      delivered_count: count,
    })
    .eq("id", announcement.id);

  return count;
}

export async function GET() {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  const admin = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
  const { data, error } = await admin
    .from("scheduled_announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ announcements: data ?? [] });
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  const user = gate.auth!.user;

  const body = (await request.json()) as {
    title?: string;
    message?: string;
    actionUrl?: string;
    audience?: "all" | "students" | "teachers" | "admins";
    scheduledAt?: string | null;
  };

  if (!body.title?.trim() || !body.message?.trim()) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }

  const audience = body.audience ?? "all";
  const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
  const sendNow = !scheduledAt || scheduledAt.getTime() <= Date.now();

  const admin = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
  const { data: row, error } = await admin
    .from("scheduled_announcements")
    .insert({
      created_by: user.id,
      title: body.title.trim(),
      message: body.message.trim(),
      action_url: body.actionUrl?.trim() || null,
      audience,
      scheduled_at: scheduledAt?.toISOString() ?? null,
      delivery_status: sendNow ? "processing" : "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let delivered = 0;
  if (sendNow) {
    delivered = await dispatchAnnouncement(row);
  }

  return NextResponse.json({ announcement: row, delivered }, { status: 201 });
}

/** Process due scheduled announcements */
export async function PATCH() {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ processed: 0 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data: due } = await admin
    .from("scheduled_announcements")
    .select("*")
    .eq("delivery_status", "pending")
    .lte("scheduled_at", now);

  let processed = 0;
  for (const item of due ?? []) {
    await dispatchAnnouncement(item);
    processed += 1;
  }

  return NextResponse.json({ processed });
}
