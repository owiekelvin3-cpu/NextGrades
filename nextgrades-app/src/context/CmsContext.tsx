"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { applyCmsOverridesToI18n } from "@/lib/cms/apply-overrides";
import type { CmsOverrideMap } from "@/lib/cms/types";

const CMS_CACHE_KEY = "nextgrades_cms_overrides";
const CMS_CACHE_TTL_MS = 10 * 60 * 1000;

type CmsContextValue = {
  overrides: CmsOverrideMap;
  loading: boolean;
  refresh: () => Promise<void>;
};

const CmsContext = createContext<CmsContextValue>({
  overrides: {},
  loading: false,
  refresh: async () => {},
});

function readCachedOverrides(): CmsOverrideMap | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CMS_CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw) as { data: CmsOverrideMap; ts: number };
    if (Date.now() - ts > CMS_CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCachedOverrides(data: CmsOverrideMap) {
  try {
    sessionStorage.setItem(CMS_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    /* ignore quota errors */
  }
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { i18n } = useTranslation();
  const [overrides, setOverrides] = useState<CmsOverrideMap>(() => readCachedOverrides() ?? {});
  const [loading, setLoading] = useState(false);

  const isDashboard = pathname?.startsWith("/dashboard") ?? false;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/overrides");
      if (!res.ok) return;
      const data = (await res.json()) as CmsOverrideMap;
      if (data && typeof data === "object" && !("error" in data)) {
        setOverrides(data);
        writeCachedOverrides(data);
        applyCmsOverridesToI18n(data);
      }
    } catch {
      /* CMS optional */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = readCachedOverrides();
    if (cached && Object.keys(cached).length) {
      applyCmsOverridesToI18n(cached);
    }

    if (isDashboard) return;

    const run = () => void refresh();
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 2000);
    return () => window.clearTimeout(t);
  }, [refresh, isDashboard]);

  useEffect(() => {
    if (Object.keys(overrides).length) {
      applyCmsOverridesToI18n(overrides, i18n.language.startsWith("de") ? "de" : "en");
    }
  }, [i18n.language, overrides]);

  return <CmsContext.Provider value={{ overrides, loading, refresh }}>{children}</CmsContext.Provider>;
}

export function useCms() {
  return useContext(CmsContext);
}
