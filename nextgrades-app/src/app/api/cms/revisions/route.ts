import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { logCmsActivity } from "@/lib/cms/activity";

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  const { searchParams } = new URL(request.url);
  const i18nKey = searchParams.get("i18n_key");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  try {
    const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
    let query = db
      .from("cms_revisions")
      .select("*, profiles:created_by(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (i18nKey) query = query.eq("i18n_key", i18nKey);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY required." }, { status: 503 });
  }

  try {
    const { revisionId } = await request.json();
    if (!revisionId) {
      return NextResponse.json({ error: "revisionId required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: revision, error: revErr } = await admin
      .from("cms_revisions")
      .select("*")
      .eq("id", revisionId)
      .single();

    if (revErr || !revision) {
      return NextResponse.json({ error: "Revision not found" }, { status: 404 });
    }

    const { data: content } = await admin
      .from("cms_content")
      .select("content_json")
      .eq("id", revision.content_id)
      .maybeSingle();

    if (content?.content_json) {
      await admin.from("cms_revisions").insert({
        content_id: revision.content_id,
        i18n_key: revision.i18n_key,
        snapshot_json: content.content_json,
        created_by: gate.auth!.user.id,
      });
    }

    const now = new Date().toISOString();
    const { error: upErr } = await admin
      .from("cms_content")
      .update({
        content_json: revision.snapshot_json,
        draft_json: revision.snapshot_json,
        published_at: now,
        updated_by: gate.auth!.user.id,
        updated_at: now,
      })
      .eq("id", revision.content_id);

    if (upErr) throw upErr;

    await logCmsActivity(admin, {
      action: "rollback",
      entity_type: "cms_revision",
      entity_id: revisionId,
      summary: `Restored ${revision.i18n_key} from version history`,
      user_id: gate.auth!.user.id,
      user_email: (gate.auth!.user as { email?: string }).email ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Rollback failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
