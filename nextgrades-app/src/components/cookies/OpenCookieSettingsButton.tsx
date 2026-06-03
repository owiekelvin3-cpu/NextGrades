"use client";

import { Cookie } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useConsentOptional } from "@/context/ConsentContext";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "link" | "button";
};

export function OpenCookieSettingsButton({ className, variant = "link" }: Props) {
  const { t } = useTranslation();
  const consent = useConsentOptional();

  if (!consent) return null;

  const base =
    variant === "button"
      ? "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border-default px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-[#D4AF37] touch-manipulation"
      : "inline-flex items-center gap-1.5 text-sm font-medium text-[#D4AF37] underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded";

  return (
    <button
      type="button"
      onClick={consent.openPreferences}
      className={cn(base, className)}
      aria-label={t("cookies.openSettings")}
    >
      <Cookie className="h-4 w-4 shrink-0" aria-hidden />
      {t("cookies.openSettings")}
    </button>
  );
}
