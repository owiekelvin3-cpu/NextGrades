export const CONSENT_POLICY_VERSION = "1.0";

export const CONSENT_STORAGE_KEY = "nextgrades:cookie-consent";

export const CONSENT_COOKIE_NAME = "ng_consent";

export const CONSENT_ID_STORAGE_KEY = "nextgrades:consent-id";

/** Max age for consent cookie (1 year). */
export const CONSENT_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export const COOKIE_CATEGORIES = ["essential", "analytics", "marketing", "functional"] as const;
