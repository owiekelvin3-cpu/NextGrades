import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mergeNotificationPreferences } from "@/lib/notifications/preferences";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    preferences: mergeNotificationPreferences(data?.notification_preferences),
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const currentRes = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", user.id)
    .maybeSingle();

  const merged = mergeNotificationPreferences({
    ...mergeNotificationPreferences(currentRes.data?.notification_preferences),
    ...body,
    categories: {
      ...mergeNotificationPreferences(currentRes.data?.notification_preferences).categories,
      ...(body.categories ?? {}),
    },
  });

  const client = isSupabaseServiceRoleConfigured() ? createAdminClient() : supabase;
  const { error } = await client
    .from("profiles")
    .update({ notification_preferences: merged })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ preferences: merged });
}
