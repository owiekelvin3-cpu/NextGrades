export type CookieCategory = "essential" | "analytics" | "marketing" | "functional";

export type ConsentAction = "accept_all" | "reject_non_essential" | "custom" | "withdraw";

export type CookiePreferences = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

export type StoredConsent = {
  version: string;
  consentId: string;
  preferences: CookiePreferences;
  action: ConsentAction;
  timestamp: string;
};

export type CookieConsentSettings = {
  policyVersion: string;
  analyticsEnabled: boolean;
  marketingEnabled: boolean;
  functionalEnabled: boolean;
  googleAnalyticsId: string | null;
  analyticsScriptUrl: string | null;
  marketingScriptUrl: string | null;
  cookieMaxAgeDays: number;
};

export type ConsentStats = {
  total: number;
  acceptAll: number;
  rejectNonEssential: number;
  custom: number;
  withdraw: number;
  analyticsOptIn: number;
  marketingOptIn: number;
  functionalOptIn: number;
};
