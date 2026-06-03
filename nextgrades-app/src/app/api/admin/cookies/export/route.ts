import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cookie_consent_records")
    .select("id, consent_id, action, preferences, locale, policy_version, created_at")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header =
    "id,consent_id,action,analytics,marketing,functional,locale,policy_version,created_at\n";
  const rows = (data ?? []).map((r) => {
    const p = r.preferences as {
      analytics?: boolean;
      marketing?: boolean;
      functional?: boolean;
    };
    return [
      r.id,
      r.consent_id,
      r.action,
      p.analytics ? "1" : "0",
      p.marketing ? "1" : "0",
      p.functional ? "1" : "0",
      r.locale ?? "",
      r.policy_version,
      r.created_at,
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(",");
  });

  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cookie-consent-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
