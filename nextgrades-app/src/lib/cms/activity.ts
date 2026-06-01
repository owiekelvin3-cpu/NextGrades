import type { SupabaseClient } from "@supabase/supabase-js";

export async function logCmsActivity(
  admin: SupabaseClient,
  entry: {
    action: string;
    entity_type: string;
    entity_id?: string | null;
    page_name?: string | null;
    summary: string;
    metadata?: Record<string, unknown>;
    user_id: string;
    user_email?: string | null;
  }
) {
  try {
    await admin.from("cms_activity_log").insert({
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id ?? null,
      page_name: entry.page_name ?? null,
      summary: entry.summary,
      metadata: entry.metadata ?? {},
      user_id: entry.user_id,
      user_email: entry.user_email ?? null,
    });
  } catch (e) {
    console.warn("CMS activity log failed:", e);
  }
}
