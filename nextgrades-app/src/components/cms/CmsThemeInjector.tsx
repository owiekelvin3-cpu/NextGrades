"use client";

import { useEffect } from "react";
import { runWhenIdle } from "@/lib/performance/idle";

/** Applies CMS theme settings as CSS variables — deferred until idle. */
export function CmsThemeInjector() {
  useEffect(() => {
    return runWhenIdle(() => {
      fetch("/api/cms/theme")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: Record<string, string> | null) => {
          if (!data) return;
          const root = document.documentElement;
          if (data.primary_color) root.style.setProperty("--cms-primary", data.primary_color);
          if (data.secondary_color) root.style.setProperty("--cms-secondary", data.secondary_color);
          if (data.accent_color) root.style.setProperty("--cms-accent", data.accent_color);
          if (data.border_radius) root.style.setProperty("--cms-radius", data.border_radius);
        })
        .catch(() => {});
    }, 3500);
  }, []);

  return null;
}
