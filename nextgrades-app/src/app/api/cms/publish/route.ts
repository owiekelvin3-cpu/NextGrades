import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { logCmsActivity } from "@/lib/cms/activity";
import { revalidateCmsAfterPublish } from "@/lib/cms/revalidate-pages";

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY required." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const i18nKeys = body.i18n_keys as string[] | undefined;
    const pageGroup = body.pageGroup as string | undefined;

    const admin = createAdminClient();
    let query = admin
      .from("cms_content")
      .select("id, i18n_key, draft_json, content_json")
      .not("draft_json", "is", null);

    if (i18nKeys?.length) {
      query = query.in("i18n_key", i18nKeys);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const toPublish = (rows ?? []).filter((r) => r.draft_json || r.content_json);
    let count = 0;
    const now = new Date().toISOString();

    for (const row of toPublish) {
      const snapshot = row.draft_json ?? row.content_json;
      if (!snapshot) continue;

      if (row.content_json) {
        await admin.from("cms_revisions").insert({
          content_id: row.id,
          i18n_key: row.i18n_key,
          snapshot_json: row.content_json,
          created_by: gate.auth!.user.id,
        });
      }

      const { error: upErr } = await admin
        .from("cms_content")
        .update({
          content_json: snapshot,
          draft_json: snapshot,
          published_at: now,
          updated_by: gate.auth!.user.id,
          updated_at: now,
        })
        .eq("id", row.id);

      if (upErr) throw upErr;
      count += 1;
    }

    await logCmsActivity(admin, {
      action: "publish_all",
      entity_type: "cms_content",
      page_name: pageGroup,
      summary: `Published ${count} draft field${count === 1 ? "" : "s"} to live site`,
      metadata: { count },
      user_id: gate.auth!.user.id,
      user_email: (gate.auth!.user as { email?: string }).email ?? null,
    });

    if (pageGroup) {
      revalidateCmsAfterPublish([pageGroup]);
    } else {
      revalidateCmsAfterPublish([]);
    }

    return NextResponse.json({ success: true, count });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Publish failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
