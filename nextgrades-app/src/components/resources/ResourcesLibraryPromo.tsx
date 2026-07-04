"use client";

import { BookOpen, Crown, Lock, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { buildLoginUrl } from "@/lib/auth/redirect";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

/** Separated 500+ membership block — PDF Bibliothek page 9. */
export function ResourcesLibraryPromo() {
  const { t } = useTranslation();
  const mt = useMarketingTheme();

  return (
    <Card className={cn("overflow-hidden border-2 border-[var(--brand-gold)]/30 shadow-md", mt.card)}>
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col items-center justify-center border-b border-[var(--border-default)] bg-[var(--surface-muted)]/80 px-8 py-10 text-center lg:border-b-0 lg:border-r lg:py-12">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-gold-muted)]">
            <BookOpen className="h-8 w-8 text-[var(--brand-gold)]" aria-hidden />
          </div>
          <p className="text-5xl font-extrabold tracking-tight text-[var(--foreground)] md:text-6xl">
            {t("resources.libraryGate.materialsCount")}
          </p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
            {t("resources.libraryGate.materialsLabel")}
          </p>
        </div>

        <div className="px-6 py-8 md:px-10 md:py-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            {t("resources.libraryGate.badge")}
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] md:text-3xl">
            {t("resources.libraryGate.title")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
            {t("resources.libraryGate.subtitle")}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button variant="gold" size="md" href="/resources/upgrade" className="w-full sm:w-auto">
              <Crown className="h-4 w-4" />
              {t("resources.libraryGate.upgradeCta")}
            </Button>
            <Button variant="outline" size="md" href={buildLoginUrl("/resources")} className="w-full sm:w-auto">
              <LogIn className="h-4 w-4" />
              {t("resources.libraryGate.loginCta")}
            </Button>
            <Button variant="ghost" size="md" href="/pricing" className="w-full sm:w-auto">
              {t("resources.libraryGate.pricingCta")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
