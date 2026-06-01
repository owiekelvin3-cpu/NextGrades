import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { logCmsActivity } from "@/lib/cms/activity";

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  if (!page) {
    return NextResponse.json({ error: "page query required" }, { status: 400 });
  }

  try {
    const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
    const { data, error } = await db
      .from("cms_page_layouts")
      .select("*")
      .eq("page_name", page)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY required." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const page = body.page as string;
    const sections = body.sections as Array<{
      section_key: string;
      sort_order: number;
      is_visible: boolean;
    }>;

    if (!page || !Array.isArray(sections)) {
      return NextResponse.json({ error: "page and sections required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const rows = sections.map((s) => ({
      page_name: page,
      section_key: s.section_key,
      sort_order: s.sort_order,
      is_visible: s.is_visible,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await admin.from("cms_page_layouts").upsert(rows, {
      onConflict: "page_name,section_key",
    });
    if (error) throw error;

    await logCmsActivity(admin, {
      action: "update_layout",
      entity_type: "cms_page_layout",
      page_name: page,
      summary: `Updated layout for ${page} (${sections.length} sections)`,
      user_id: gate.auth!.user.id,
      user_email: (gate.auth!.user as { email?: string }).email ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
