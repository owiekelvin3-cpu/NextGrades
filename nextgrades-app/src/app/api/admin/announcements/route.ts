import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { notifyAnnouncement } from "@/lib/notifications/triggers";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, supabase };
}

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
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const admin = isSupabaseServiceRoleConfigured() ? createAdminClient() : auth.supabase!;
  const { data, error } = await admin
    .from("scheduled_announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ announcements: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const { user } = auth;

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

  const admin = isSupabaseServiceRoleConfigured() ? createAdminClient() : auth.supabase!;
  const { data: row, error } = await admin
    .from("scheduled_announcements")
    .insert({
      created_by: user!.id,
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
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

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
