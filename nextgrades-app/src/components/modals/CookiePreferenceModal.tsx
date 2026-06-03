"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, Cookie } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useConsent } from "@/context/ConsentContext";
import { CookieCategoryToggle } from "@/components/cookies/CookieCategoryToggle";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function CookiePreferenceModal() {
  const { t } = useTranslation();
  const { showPreferences, closePreferences, preferences, savePreferences, acceptAll, rejectNonEssential } =
    useConsent();
  const [draft, setDraft] = useState({
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    functional: preferences.functional,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (showPreferences) {
      setDraft({
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        functional: preferences.functional,
      });
    }
  }, [showPreferences, preferences]);

  useEffect(() => {
    if (!showPreferences) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showPreferences]);

  useEffect(() => {
    if (!showPreferences) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreferences();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPreferences, closePreferences]);

  useEffect(() => {
    if (showPreferences && panelRef.current) {
      panelRef.current.focus();
    }
  }, [showPreferences]);

  if (!mounted || !showPreferences) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        aria-label={t("cookies.modal.close")}
        onClick={closePreferences}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-prefs-title"
        tabIndex={-1}
        className="fixed inset-x-0 bottom-0 z-[110] flex max-h-[min(92dvh,720px)] flex-col rounded-t-2xl border border-border-default bg-surface-elevated shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-h-[85vh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border-default px-5 py-4">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-[#D4AF37]" aria-hidden />
            <h2 id="cookie-prefs-title" className="text-lg font-bold text-foreground">
              {t("cookies.modal.title")}
            </h2>
          </div>
          <button
            type="button"
            onClick={closePreferences}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg text-text-muted hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            aria-label={t("cookies.modal.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <p className="mb-4 text-sm leading-relaxed text-text-muted">{t("cookies.modal.intro")}</p>
          <div className="space-y-3">
            <CookieCategoryToggle
              id="cookie-essential"
              label={t("cookies.categories.essential.title")}
              description={t("cookies.categories.essential.description")}
              checked
              disabled
              onChange={() => {}}
              alwaysOnLabel={t("cookies.categories.essential.alwaysOn")}
            />
            <CookieCategoryToggle
              id="cookie-analytics"
              label={t("cookies.categories.analytics.title")}
              description={t("cookies.categories.analytics.description")}
              checked={draft.analytics}
              onChange={(v) => setDraft((d) => ({ ...d, analytics: v }))}
            />
            <CookieCategoryToggle
              id="cookie-marketing"
              label={t("cookies.categories.marketing.title")}
              description={t("cookies.categories.marketing.description")}
              checked={draft.marketing}
              onChange={(v) => setDraft((d) => ({ ...d, marketing: v }))}
            />
            <CookieCategoryToggle
              id="cookie-functional"
              label={t("cookies.categories.functional.title")}
              description={t("cookies.categories.functional.description")}
              checked={draft.functional}
              onChange={(v) => setDraft((d) => ({ ...d, functional: v }))}
            />
          </div>
          <p className="mt-4 text-xs text-text-muted">
            {t("cookies.modal.legalNote")}{" "}
            <Link href="/privacy" className="font-medium text-[#D4AF37] underline-offset-2 hover:underline">
              {t("cookies.modal.privacyLink")}
            </Link>
            {" · "}
            <Link href="/privacy/cookies" className="font-medium text-[#D4AF37] underline-offset-2 hover:underline">
              {t("cookies.modal.cookiesLink")}
            </Link>
          </p>
        </div>

        <div className="shrink-0 space-y-2 border-t border-border-default p-5 safe-bottom">
          <Button
            variant="gold"
            size="md"
            className="w-full"
            onClick={() => savePreferences(draft)}
          >
            {t("cookies.modal.save")}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="md" className="w-full" onClick={acceptAll}>
              {t("cookies.banner.acceptAll")}
            </Button>
            <Button variant="outline" size="md" className="w-full" onClick={rejectNonEssential}>
              {t("cookies.banner.reject")}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
