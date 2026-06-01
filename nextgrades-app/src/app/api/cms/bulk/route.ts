import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import type { AuthGateResult } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { buildSeedEntries, buildSectionRows, contentRowsFromEntries } from "@/lib/cms/seed";
import { CMS_IMAGE_REGISTRY } from "@/lib/cms/marketing-images-registry";
import { humanizeKey } from "@/lib/cms/constants";
import { mergeCmsFields, countPageStats } from "@/lib/cms/merge-content";
import type { CmsSavePayload } from "@/lib/cms/save-content";
import type { CmsContentRow } from "@/lib/cms/types";
import { logCmsActivity } from "@/lib/cms/activity";

function isMissingColumnError(message: string, column: string) {
  return message.includes(column) && (message.includes("column") || message.includes("schema cache"));
}

const OPTIONAL_CMS_COLUMNS = ["draft_json", "published_at", "updated_by", "i18n_key"] as const;

function stripMissingColumns(payload: Record<string, unknown>, message: string) {
  for (const col of OPTIONAL_CMS_COLUMNS) {
    if (isMissingColumnError(message, col)) {
      delete payload[col];
    }
  }
}

function getCmsDb(gate: NonNullable<AuthGateResult["auth"]>): SupabaseClient {
  if (isSupabaseServiceRoleConfigured()) {
    return createAdminClient();
  }
  return gate.supabase;
}

function toLegacyPayload(
  row: CmsSavePayload,
  payload: Record<string, unknown>,
  sectionId: string | null,
  isDraft: boolean
): Record<string, unknown> {
  return {
    section_id: sectionId,
    i18n_key: row.i18n_key,
    field_key: row.i18n_key,
    field_name: row.field_name,
    field_type: row.field_type,
    content_json: isDraft ? payload.draft_json ?? payload.content_json : payload.content_json,
    content_value: row.content_value ?? payload.content_value ?? null,
    updated_at: payload.updated_at,
  };
}

async function upsertContentRow(
  admin: SupabaseClient,
  row: CmsSavePayload,
  payload: Record<string, unknown>,
  sectionId: string | null,
  isDraft: boolean
) {
  if (!sectionId) {
    throw new Error(`Missing CMS section for page "${row.pageGroup}". Run setup again from Website content.`);
  }

  if (row.id && !row.id.startsWith("local-")) {
    const { error } = await admin.from("cms_content").update(payload).eq("id", row.id);
    if (error) {
      const legacy = toLegacyPayload(row, payload, sectionId, isDraft);
      stripMissingColumns(payload, error.message);
      stripMissingColumns(legacy, error.message);
      const retry = await admin.from("cms_content").update(legacy).eq("id", row.id);
      if (retry.error) throw retry.error;
      return;
    }
    return;
  }

  const { error } = await admin.from("cms_content").upsert(payload, { onConflict: "section_id,field_key" });
  if (error) {
    const legacy = toLegacyPayload(row, payload, sectionId, isDraft);
    stripMissingColumns(payload, error.message);
    stripMissingColumns(legacy, error.message);
    const retry = await admin.from("cms_content").upsert(legacy, { onConflict: "section_id,field_key" });
    if (retry.error) throw retry.error;
  }
}

export async function GET() {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  try {
    const db = getCmsDb(gate.auth!);
    const { data, error } = await db.from("cms_content").select("*").order("sort_order", { ascending: true });
    if (error) throw error;

    const dbRows = (data ?? []) as CmsContentRow[];
    const merged = mergeCmsFields(dbRows);
    const pageStats = Object.fromEntries(countPageStats(merged));
    const unpublishedCount = merged.filter((f) => f.hasUnpublishedChanges).length;

    return NextResponse.json({
      content: merged,
      seeded: dbRows.length > 0,
      stats: {
        totalFields: merged.length,
        persistedFields: merged.filter((f) => f.isPersisted).length,
        customizedFields: merged.filter((f) => f.isCustomized).length,
        unpublishedFields: unpublishedCount,
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

  try {
    const admin = getCmsDb(gate.auth!);
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

    await logCmsActivity(admin, {
      action: "seed",
      entity_type: "cms_content",
      summary: `Synced ${rows.length} fields from locale files`,
      user_id: gate.auth!.user.id,
      user_email: (gate.auth!.user as { email?: string }).email ?? null,
    });

    return NextResponse.json({ success: true, count: rows.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function ensureSections(admin: SupabaseClient) {
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

  try {
    const body = await request.json();
    const updates = body.updates as CmsSavePayload[];
    const mode: "draft" | "publish" = body.mode === "draft" ? "draft" : "publish";

    if (!Array.isArray(updates) || !updates.length) {
      return NextResponse.json({ error: "updates array required" }, { status: 400 });
    }

    const admin = getCmsDb(gate.auth!);
    const sectionIdByPage = await ensureSections(admin);
    let saved = 0;
    const now = new Date().toISOString();

    for (const row of updates) {
      const sectionId = sectionIdByPage[row.pageGroup] ?? null;
      const isDraft = (row.mode ?? mode) === "draft";

      const payload: Record<string, unknown> = {
        section_id: sectionId,
        i18n_key: row.i18n_key,
        field_key: row.i18n_key,
        field_name: row.field_name,
        field_type: row.field_type,
        updated_at: now,
        updated_by: gate.auth!.user.id,
      };

      if (isDraft) {
        payload.draft_json = row.draft_json ?? row.content_json;
      } else {
        payload.content_json = row.content_json;
        payload.draft_json = row.draft_json ?? row.content_json;
        payload.content_value = row.content_value;
        payload.published_at = now;

        if (row.id && !row.id.startsWith("local-")) {
          const { data: existing } = await admin
            .from("cms_content")
            .select("content_json")
            .eq("id", row.id)
            .maybeSingle();
          if (existing?.content_json) {
            try {
              await admin.from("cms_revisions").insert({
                content_id: row.id,
                i18n_key: row.i18n_key,
                snapshot_json: existing.content_json,
                created_by: gate.auth!.user.id,
              });
            } catch {
              /* revisions table optional until migration 00025 */
            }
          }
        }
      }

      await upsertContentRow(admin, row, payload, sectionId, isDraft);
      saved += 1;
    }

    try {
      await logCmsActivity(admin, {
      action: mode === "draft" ? "save_draft" : "publish",
      entity_type: "cms_content",
      page_name: updates[0]?.pageGroup,
      summary: `${mode === "draft" ? "Saved draft" : "Published"} ${saved} field${saved === 1 ? "" : "s"}`,
      metadata: { count: saved, keys: updates.map((u) => u.i18n_key).slice(0, 20) },
      user_id: gate.auth!.user.id,
      user_email: (gate.auth!.user as { email?: string }).email ?? null,
    });
    } catch {
      /* activity log optional until migration 00025 */
    }

    return NextResponse.json({ success: true, count: saved, mode: mode === "draft" ? "draft" : "publish" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
