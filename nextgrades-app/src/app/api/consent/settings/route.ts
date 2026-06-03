import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublicScriptConfig, mapDbSettings, type DbCookieSettings } from "@/lib/consent/settings";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cookie_consent_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    const fallback = {
      policyVersion: "1.0",
      analyticsEnabled: true,
      marketingEnabled: false,
      functionalEnabled: true,
      googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null,
      analyticsScriptUrl: null,
      marketingScriptUrl: null,
      cookieMaxAgeDays: 365,
    };
    return NextResponse.json({
      settings: fallback,
      scripts: getPublicScriptConfig(fallback),
    });
  }

  const settings = mapDbSettings(data as DbCookieSettings);
  return NextResponse.json({
    settings,
    scripts: getPublicScriptConfig(settings),
  });
}
