"use client";

import Link from "next/link";
import { BookOpen, ExternalLink, Shield, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STEP_ICONS = [ExternalLink, Shield, BookOpen, Users];

export function AdminAccessGuide() {
  const { t } = useTranslation();

  const steps = t("adminDashboard.accessGuideSteps", { returnObjects: true }) as string[];
  const safeSteps = Array.isArray(steps) ? steps : [];

  return (
    <Card
      hoverable={false}
      className="border-[var(--brand-gold)]/20 bg-gradient-to-br from-[var(--brand-gold-muted)] to-surface-elevated p-6 sm:p-7"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-gold)]/15">
          <Shield className="h-5 w-5 text-[var(--brand-gold)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{t("adminDashboard.accessGuideTitle")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-text-muted">{t("adminDashboard.accessGuideIntro")}</p>
        </div>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2">
        {safeSteps.map((step, index) => {
          const Icon = STEP_ICONS[index] ?? Shield;
          return (
            <li
              key={index}
              className="flex gap-3 rounded-xl border border-border-default/60 bg-surface-elevated/80 p-3 text-sm text-text-muted"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-gold-muted)] text-xs font-bold text-[var(--brand-gold)]">
                {index + 1}
              </span>
              <span className="flex items-start gap-2 pt-0.5">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                {step}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="gold" size="sm" href="/portal/admin/cms">
          {t("adminDashboard.accessGuideCmsLink")}
        </Button>
        <Button variant="outline" size="sm" href="/portal/admin/users">
          {t("adminDashboard.accessGuideUsersLink")}
        </Button>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-gold)] hover:underline"
        >
          {t("adminDashboard.accessGuidePublicLink")}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
