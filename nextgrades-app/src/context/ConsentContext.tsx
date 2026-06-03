"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ACCEPT_ALL_PREFERENCES,
  DEFAULT_PREFERENCES,
  hasConsentDecision,
  persistConsent,
  readStoredConsent,
} from "@/lib/cookies/storage";
import { dispatchConsentUpdated } from "@/lib/consent/manager";
import { recordConsentToServer } from "@/lib/consent/record";
import { applyConsentScripts } from "@/lib/consent/scripts";
import type { CookiePreferences } from "@/lib/cookies/types";

type ConsentContextValue = {
  preferences: CookiePreferences;
  hasDecided: boolean;
  showBanner: boolean;
  showPreferences: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (prefs: Omit<CookiePreferences, "essential">) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  closeBanner: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

type Props = {
  children: ReactNode;
  scriptConfig?: {
    googleAnalyticsId?: string | null;
    analyticsScriptUrl?: string | null;
    marketingScriptUrl?: string | null;
  };
};

export function ConsentProvider({ children, scriptConfig }: Props) {
  const { i18n } = useTranslation();
  const [hasDecided, setHasDecided] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredConsent();
    if (stored) {
      setPreferences(stored.preferences);
      setHasDecided(true);
      setShowBanner(false);
    } else {
      setHasDecided(false);
      setShowBanner(true);
    }
    setHydrated(true);
  }, []);

  const commit = useCallback(
    (prefs: CookiePreferences, action: Parameters<typeof persistConsent>[1]) => {
      const record = persistConsent(prefs, action);
      setPreferences(record.preferences);
      setHasDecided(true);
      setShowBanner(false);
      setShowPreferences(false);
      dispatchConsentUpdated(record.preferences);
      applyConsentScripts(scriptConfig ?? {});
      void recordConsentToServer(record.preferences, action, i18n.language);
    },
    [i18n.language, scriptConfig]
  );

  useEffect(() => {
    if (!hydrated || !hasDecided) return;
    applyConsentScripts(scriptConfig ?? {});
  }, [hydrated, hasDecided, preferences, scriptConfig]);

  const acceptAll = useCallback(() => {
    commit(ACCEPT_ALL_PREFERENCES, "accept_all");
  }, [commit]);

  const rejectNonEssential = useCallback(() => {
    commit(DEFAULT_PREFERENCES, "reject_non_essential");
  }, [commit]);

  const savePreferences = useCallback(
    (partial: Omit<CookiePreferences, "essential">) => {
      commit(
        { essential: true, ...partial },
        hasConsentDecision() ? "custom" : "custom"
      );
    },
    [commit]
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      preferences,
      hasDecided,
      showBanner: hydrated && showBanner,
      showPreferences,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openPreferences: () => {
        setShowPreferences(true);
        setShowBanner(false);
      },
      closePreferences: () => setShowPreferences(false),
      closeBanner: () => setShowBanner(false),
    }),
    [
      preferences,
      hasDecided,
      hydrated,
      showBanner,
      showPreferences,
      acceptAll,
      rejectNonEssential,
      savePreferences,
    ]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return ctx;
}

export function useConsentOptional(): ConsentContextValue | null {
  return useContext(ConsentContext);
}
