"use client";

import Link from "next/link";
import { Cookie } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useConsent } from "@/context/ConsentContext";
import { cn } from "@/lib/utils";

export function CookieBanner() {
  const { t } = useTranslation();
  const { showBanner, acceptAll, rejectNonEssential, openPreferences } = useConsent();

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className={cn(
        "cookie-banner-enter fixed inset-x-0 bottom-0 z-[95] border-t border-border-default bg-surface-elevated/98 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md",
        "pb-[max(1rem,env(safe-area-inset-bottom))]"
      )}
      style={{
        marginBottom: "var(--cookie-banner-offset, 0px)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15">
              <Cookie className="h-5 w-5 text-[#D4AF37]" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 id="cookie-banner-title" className="text-sm font-bold text-foreground sm:text-base">
                {t("cookies.banner.title")}
              </h2>
              <p id="cookie-banner-desc" className="mt-1 text-xs leading-relaxed text-text-muted sm:text-sm">
                {t("cookies.banner.description")}{" "}
                <Link
                  href="/privacy/cookies"
                  className="font-medium text-[#D4AF37] underline-offset-2 hover:underline"
                >
                  {t("cookies.banner.learnMore")}
                </Link>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openPreferences}
              className="min-h-[44px] rounded-xl border border-border-default px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-[#D4AF37] touch-manipulation"
            >
              {t("cookies.banner.customize")}
            </button>
            <button
              type="button"
              onClick={rejectNonEssential}
              className="min-h-[44px] rounded-xl border border-border-default px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-[#D4AF37] touch-manipulation"
            >
              {t("cookies.banner.reject")}
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="min-h-[44px] rounded-xl bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-[#0D1B2A] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 touch-manipulation"
            >
              {t("cookies.banner.acceptAll")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
