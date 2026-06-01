"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import i18n from "@/lib/i18n/config";
import { applyCmsOverridesToI18n } from "@/lib/cms/apply-overrides";
import { setPreviewOverrides } from "@/lib/cms/preview-store";
import { CMS_PREVIEW_FIELD_CLICK, CMS_PREVIEW_OVERRIDES, CMS_PREVIEW_READY } from "@/lib/cms/preview-overrides";
import type { CmsOverrideMap } from "@/lib/cms/types";

/** Enables real-time draft preview when the site is loaded inside the CMS iframe. */
export function CmsPreviewBridge() {
  const pathname = usePathname();
  const [, setTick] = useState(0);
  const lastOverrides = useRef<CmsOverrideMap | null>(null);
  const lastLocale = useRef<string | undefined>(undefined);

  useEffect(() => {
    const inIframe = window.self !== window.top;
    if (!inIframe) return;

    const notifyReady = () => {
      window.parent.postMessage({ type: CMS_PREVIEW_READY }, window.location.origin);
    };

    const applyOverrides = async (overrides: CmsOverrideMap, locale?: string) => {
      lastOverrides.current = overrides;
      lastLocale.current = locale;
      setPreviewOverrides(overrides);
      setTick((n) => n + 1);
      await applyCmsOverridesToI18n(overrides, locale);
    };

    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== CMS_PREVIEW_OVERRIDES) return;
      const overrides = (event.data.overrides ?? {}) as CmsOverrideMap;
      const locale = typeof event.data.locale === "string" ? event.data.locale : undefined;
      void applyOverrides(overrides, locale);
    };

    const onClick = (e: MouseEvent) => {
      let el = e.target as HTMLElement | null;
      while (el && el !== document.body) {
        const key = el.getAttribute?.("data-cms-field");
        if (key) {
          e.preventDefault();
          e.stopPropagation();
          window.parent.postMessage({ type: CMS_PREVIEW_FIELD_CLICK, key }, window.location.origin);
          return;
        }
        el = el.parentElement;
      }
    };

    document.addEventListener("click", onClick, true);
    document.documentElement.classList.add("cms-preview-mode");

    const previewStyle = document.createElement("style");
    previewStyle.setAttribute("data-cms-preview", "1");
    previewStyle.textContent = `
      .cms-preview-mode [data-cms-field] { cursor: pointer; outline: 2px dashed transparent; outline-offset: 2px; transition: outline-color 0.15s; }
      .cms-preview-mode [data-cms-field]:hover { outline-color: rgba(212, 175, 55, 0.85); }
    `;
    document.head.appendChild(previewStyle);

    window.addEventListener("message", handler);

    const onI18nReady = () => {
      notifyReady();
      if (lastOverrides.current) {
        void applyOverrides(lastOverrides.current, lastLocale.current);
      }
    };

    if (i18n.isInitialized) {
      onI18nReady();
    } else {
      i18n.on("initialized", onI18nReady);
    }

    return () => {
      window.removeEventListener("message", handler);
      document.removeEventListener("click", onClick, true);
      document.documentElement.classList.remove("cms-preview-mode");
      previewStyle.remove();
      i18n.off("initialized", onI18nReady);
      setPreviewOverrides(null);
    };
  }, []);

  useEffect(() => {
    if (window.self === window.top) return;
    window.parent.postMessage({ type: CMS_PREVIEW_READY }, window.location.origin);
    if (lastOverrides.current) {
      setPreviewOverrides(lastOverrides.current);
      setTick((n) => n + 1);
      void applyCmsOverridesToI18n(lastOverrides.current, lastLocale.current);
    }
  }, [pathname]);

  return null;
}
