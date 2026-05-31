import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { buildSeedEntries, buildSectionRows, contentRowsFromEntries } from "@/lib/cms/seed";
import { CMS_IMAGE_REGISTRY } from "@/lib/cms/marketing-images-registry";
import { humanizeKey } from "@/lib/cms/constants";
import { mergeCmsFields, countPageStats } from "@/lib/cms/merge-content";
import type { CmsSavePayload } from "@/lib/cms/save-content";
import type { CmsContentRow } from "@/lib/cms/types";

export async function GET() {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  try {
    const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
    const { data, error } = await db.from("cms_content").select("*").order("sort_order", { ascending: true });
    if (error) throw error;

    const dbRows = (data ?? []) as CmsContentRow[];
    const merged = mergeCmsFields(dbRows);
    const pageStats = Object.fromEntries(countPageStats(merged));

    return NextResponse.json({
      content: merged,
      seeded: dbRows.length > 0,
      stats: {
        totalFields: merged.length,
        persistedFields: merged.filter((f) => f.isPersisted).length,
        customizedFields: merged.filter((f) => f.isCustomized).length,
        byPage: pageStats,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  const { searchParams } = new URL(request.url);
  if (searchParams.get("action") !== "seed") {
    return NextResponse.json({ error: "Use ?action=seed" }, { status: 400 });
  }

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY required for bulk import. Add it to .env.local and restart." },
      { status: 503 }
    );
  }

  try {
    const admin = createAdminClient();
    const entries = buildSeedEntries();
    const sectionRows = buildSectionRows();

    for (const section of sectionRows) {
      const { error } = await admin.from("cms_sections").upsert(section, { onConflict: "section_key" });
      if (error) throw error;
    }

    const { data: sections, error: secErr } = await admin.from("cms_sections").select("id, page_name");
    if (secErr) throw secErr;

    const sectionIdByPage: Record<string, string> = {};
    for (const s of sections ?? []) {
      sectionIdByPage[s.page_name] = s.id;
    }

    const imageLabelByKey = Object.fromEntries(CMS_IMAGE_REGISTRY.map((i) => [i.key, i.label]));

    const rows = contentRowsFromEntries(entries, sectionIdByPage).map((row) => ({
      ...row,
      field_name: imageLabelByKey[row.i18n_key] ?? humanizeKey(row.i18n_key),
    }));

    const { error } = await admin.from("cms_content").upsert(rows, { onConflict: "section_id,field_key" });
    if (error) throw error;

    return NextResponse.json({ success: true, count: rows.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type SavePayload = CmsSavePayload;

async function ensureSections(admin: ReturnType<typeof createAdminClient>) {
  const sectionRows = buildSectionRows();
  for (const section of sectionRows) {
    await admin.from("cms_sections").upsert(section, { onConflict: "section_key" });
  }
  const { data: sections } = await admin.from("cms_sections").select("id, page_name");
  const map: Record<string, string> = {};
  for (const s of sections ?? []) {
    map[s.page_name] = s.id;
  }
  return map;
}

export async function PUT(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY required to save website content." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const updates = body.updates as SavePayload[];

    if (!Array.isArray(updates) || !updates.length) {
      return NextResponse.json({ error: "updates array required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const sectionIdByPage = await ensureSections(admin);
    let saved = 0;

    for (const row of updates) {
      const sectionId = sectionIdByPage[row.pageGroup] ?? null;
      const payload = {
        section_id: sectionId,
        i18n_key: row.i18n_key,
        field_key: row.i18n_key,
        field_name: row.field_name,
        field_type: row.field_type,
        content_json: row.content_json,
        content_value: row.content_value,
        updated_at: new Date().toISOString(),
      };

      if (row.id && !row.id.startsWith("local-")) {
        const { error } = await admin.from("cms_content").update(payload).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await admin.from("cms_content").upsert(payload, { onConflict: "section_id,field_key" });
        if (error) throw error;
      }
      saved += 1;
    }

    return NextResponse.json({ success: true, count: saved });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
