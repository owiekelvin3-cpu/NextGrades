import type { CookieCategory, CookiePreferences } from "@/lib/cookies/types";
import { readStoredConsent } from "@/lib/cookies/storage";

export const CONSENT_UPDATED_EVENT = "nextgrades:consent-updated";

export function dispatchConsentUpdated(preferences: CookiePreferences): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CONSENT_UPDATED_EVENT, { detail: preferences })
  );
}

export function getActivePreferences(): CookiePreferences | null {
  return readStoredConsent()?.preferences ?? null;
}

export function isCategoryAllowed(category: CookieCategory): boolean {
  if (category === "essential") return true;
  const prefs = getActivePreferences();
  if (!prefs) return false;
  return prefs[category] === true;
}

export function canLoadAnalytics(): boolean {
  return isCategoryAllowed("analytics");
}

export function canLoadMarketing(): boolean {
  return isCategoryAllowed("marketing");
}

export function canLoadFunctional(): boolean {
  return isCategoryAllowed("functional");
}
