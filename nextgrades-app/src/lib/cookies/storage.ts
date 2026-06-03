import {
  CONSENT_COOKIE_MAX_AGE_SEC,
  CONSENT_COOKIE_NAME,
  CONSENT_ID_STORAGE_KEY,
  CONSENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
} from "./constants";
import type { ConsentAction, CookiePreferences, StoredConsent } from "./types";

export const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export const ACCEPT_ALL_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: true,
  marketing: true,
  functional: true,
};

export function getOrCreateConsentId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CONSENT_ID_STORAGE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `ng-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(CONSENT_ID_STORAGE_KEY, id);
  }
  return id;
}

export function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (!parsed?.preferences || parsed.preferences.essential !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistConsent(
  preferences: CookiePreferences,
  action: ConsentAction,
  version: string = CONSENT_POLICY_VERSION
): StoredConsent {
  const record: StoredConsent = {
    version,
    consentId: getOrCreateConsentId(),
    preferences: { ...preferences, essential: true },
    action,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    const cookieValue = encodeURIComponent(
      JSON.stringify({
        v: record.version,
        a: record.preferences.analytics ? 1 : 0,
        m: record.preferences.marketing ? 1 : 0,
        f: record.preferences.functional ? 1 : 0,
        t: record.timestamp,
      })
    );
    document.cookie = `${CONSENT_COOKIE_NAME}=${cookieValue};path=/;max-age=${CONSENT_COOKIE_MAX_AGE_SEC};SameSite=Lax`;
  }

  return record;
}

export function clearConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONSENT_STORAGE_KEY);
  document.cookie = `${CONSENT_COOKIE_NAME}=;path=/;max-age=0;SameSite=Lax`;
}

export function hasConsentDecision(): boolean {
  return readStoredConsent() !== null;
}
