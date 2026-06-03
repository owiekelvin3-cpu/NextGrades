import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createClient } from "@/lib/supabase/server";
import { computeConsentStats, mapDbSettings, type DbCookieSettings } from "@/lib/consent/settings";

export async function GET() {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  const supabase = await createClient();

  const [{ data: settings }, { data: records }] = await Promise.all([
    supabase.from("cookie_consent_settings").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("cookie_consent_records")
      .select("action, preferences, created_at, consent_id, locale, policy_version")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const stats = computeConsentStats(
    (records ?? []).map((r) => ({
      action: r.action as string,
      preferences: r.preferences as {
        analytics?: boolean;
        marketing?: boolean;
        functional?: boolean;
      },
    }))
  );

  return NextResponse.json({
    settings: settings ? mapDbSettings(settings as DbCookieSettings) : null,
    stats,
    recent: records ?? [],
  });
}

export async function PATCH(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  const body = (await request.json()) as Record<string, unknown>;
  const supabase = await createClient();

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.policyVersion === "string") patch.policy_version = body.policyVersion;
  if (typeof body.analyticsEnabled === "boolean") patch.analytics_enabled = body.analyticsEnabled;
  if (typeof body.marketingEnabled === "boolean") patch.marketing_enabled = body.marketingEnabled;
  if (typeof body.functionalEnabled === "boolean") patch.functional_enabled = body.functionalEnabled;
  if (body.googleAnalyticsId === null || typeof body.googleAnalyticsId === "string") {
    patch.google_analytics_id = body.googleAnalyticsId;
  }
  if (body.analyticsScriptUrl === null || typeof body.analyticsScriptUrl === "string") {
    patch.analytics_script_url = body.analyticsScriptUrl;
  }
  if (body.marketingScriptUrl === null || typeof body.marketingScriptUrl === "string") {
    patch.marketing_script_url = body.marketingScriptUrl;
  }
  if (typeof body.cookieMaxAgeDays === "number") patch.cookie_max_age_days = body.cookieMaxAgeDays;

  const { data, error } = await supabase
    .from("cookie_consent_settings")
    .update(patch)
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: mapDbSettings(data as DbCookieSettings) });
}
