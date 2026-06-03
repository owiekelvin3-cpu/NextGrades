import type { ConsentAction, CookiePreferences } from "@/lib/cookies/types";
import { CONSENT_POLICY_VERSION } from "@/lib/cookies/constants";
import { getOrCreateConsentId } from "@/lib/cookies/storage";

export async function recordConsentToServer(
  preferences: CookiePreferences,
  action: ConsentAction,
  locale?: string
): Promise<void> {
  try {
    await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consentId: getOrCreateConsentId(),
        preferences,
        action,
        locale: locale ?? (typeof navigator !== "undefined" ? navigator.language : "de"),
        policyVersion: CONSENT_POLICY_VERSION,
      }),
    });
  } catch {
    /* Non-blocking — local storage remains source of truth */
  }
}
