import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { publicCacheHeaders } from "@/lib/cache/public-cache";

export async function GET() {
  try {
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);
    const { data, error } = await db
      .from("site_settings")
      .select("*")
      .eq("settings_key", "default")
      .maybeSingle();
    if (error) {
      if (error.message.includes("site_settings")) return NextResponse.json(null);
      throw error;
    }
    return NextResponse.json(data, { headers: publicCacheHeaders() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  try {
    const body = await request.json();
    const payload = {
      ...body,
      settings_key: "default",
      updated_at: new Date().toISOString(),
    };
    delete payload.id;
    const { data, error } = await gate.auth!.supabase
      .from("site_settings")
      .upsert(payload, { onConflict: "settings_key" })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
