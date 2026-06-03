import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CONSENT_POLICY_VERSION } from "@/lib/cookies/constants";
import type { ConsentAction, CookiePreferences } from "@/lib/cookies/types";

type Body = {
  consentId?: string;
  preferences?: CookiePreferences;
  action?: ConsentAction;
  locale?: string;
  policyVersion?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.consentId || !body.preferences || !body.action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const preferences: CookiePreferences = {
    essential: true,
    analytics: Boolean(body.preferences.analytics),
    marketing: Boolean(body.preferences.marketing),
    functional: Boolean(body.preferences.functional),
  };

  const validActions: ConsentAction[] = [
    "accept_all",
    "reject_non_essential",
    "custom",
    "withdraw",
  ];
  if (!validActions.includes(body.action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const supabase = await createClient();
  const userAgent = request.headers.get("user-agent")?.slice(0, 512) ?? null;

  const { error } = await supabase.from("cookie_consent_records").insert({
    consent_id: body.consentId.slice(0, 128),
    preferences,
    action: body.action,
    locale: body.locale?.slice(0, 16) ?? null,
    policy_version: body.policyVersion?.slice(0, 32) ?? CONSENT_POLICY_VERSION,
    user_agent: userAgent,
  });

  if (error) {
    console.error("consent record insert:", error);
    return NextResponse.json({ ok: true, stored: false });
  }

  return NextResponse.json({ ok: true, stored: true });
}
