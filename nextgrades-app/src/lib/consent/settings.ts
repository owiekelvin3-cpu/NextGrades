import type { CookieConsentSettings, ConsentStats } from "@/lib/cookies/types";

export type DbCookieSettings = {
  policy_version: string;
  analytics_enabled: boolean;
  marketing_enabled: boolean;
  functional_enabled: boolean;
  google_analytics_id: string | null;
  analytics_script_url: string | null;
  marketing_script_url: string | null;
  cookie_max_age_days: number;
};

export function mapDbSettings(row: DbCookieSettings): CookieConsentSettings {
  return {
    policyVersion: row.policy_version,
    analyticsEnabled: row.analytics_enabled,
    marketingEnabled: row.marketing_enabled,
    functionalEnabled: row.functional_enabled,
    googleAnalyticsId: row.google_analytics_id,
    analyticsScriptUrl: row.analytics_script_url,
    marketingScriptUrl: row.marketing_script_url,
    cookieMaxAgeDays: row.cookie_max_age_days,
  };
}

export function getPublicScriptConfig(settings: CookieConsentSettings) {
  const envGa = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null;
  return {
    googleAnalyticsId:
      settings.analyticsEnabled && (settings.googleAnalyticsId || envGa)
        ? settings.googleAnalyticsId || envGa
        : null,
    analyticsScriptUrl:
      settings.analyticsEnabled ? settings.analyticsScriptUrl : null,
    marketingScriptUrl:
      settings.marketingEnabled ? settings.marketingScriptUrl : null,
  };
}

export function computeConsentStats(
  rows: { action: string; preferences: { analytics?: boolean; marketing?: boolean; functional?: boolean } }[]
): ConsentStats {
  const stats: ConsentStats = {
    total: rows.length,
    acceptAll: 0,
    rejectNonEssential: 0,
    custom: 0,
    withdraw: 0,
    analyticsOptIn: 0,
    marketingOptIn: 0,
    functionalOptIn: 0,
  };
  for (const row of rows) {
    if (row.action === "accept_all") stats.acceptAll++;
    else if (row.action === "reject_non_essential") stats.rejectNonEssential++;
    else if (row.action === "withdraw") stats.withdraw++;
    else stats.custom++;
    if (row.preferences?.analytics) stats.analyticsOptIn++;
    if (row.preferences?.marketing) stats.marketingOptIn++;
    if (row.preferences?.functional) stats.functionalOptIn++;
  }
  return stats;
}
