import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";

export async function GET() {
  try {
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);
    const { data, error } = await db
      .from("cms_theme_settings")
      .select("*")
      .eq("settings_key", "default")
      .maybeSingle();
    if (error) {
      const code = (error as { code?: string }).code;
      if (
        code === "PGRST205" ||
        code === "42P01" ||
        error.message.includes("cms_theme_settings")
      ) {
        return NextResponse.json(null);
      }
      throw error;
    }
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
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
      updated_by: gate.auth!.user.id,
    };
    delete payload.id;
    const { data, error } = await gate.auth!.supabase
      .from("cms_theme_settings")
      .upsert(payload, { onConflict: "settings_key" })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
