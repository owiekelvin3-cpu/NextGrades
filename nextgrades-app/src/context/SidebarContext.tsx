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

export const SIDEBAR_WIDTH = 260;
const STORAGE_KEY = "nextgrades-sidebar-collapsed";

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  width: number;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((value: boolean) => {
    setCollapsed(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => persist(!collapsed), [collapsed, persist]);
  const expand = useCallback(() => persist(false), [persist]);
  const collapse = useCallback(() => persist(true), [persist]);

  const value = useMemo(
    () => ({
      collapsed: hydrated ? collapsed : false,
      toggle,
      expand,
      collapse,
      width: hydrated && collapsed ? 0 : SIDEBAR_WIDTH,
    }),
    [collapsed, collapse, expand, hydrated, toggle]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    return {
      collapsed: false,
      toggle: () => {},
      expand: () => {},
      collapse: () => {},
      width: SIDEBAR_WIDTH,
    };
  }
  return ctx;
}

export function useSidebarOptional() {
  return useContext(SidebarContext);
}
