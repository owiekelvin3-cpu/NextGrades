"use client";

import Link from "next/link";
import { BookOpen, ExternalLink, Shield, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { appShell } from "@/lib/theme/shell";

const STEP_ICONS = [ExternalLink, Shield, BookOpen, Users];

export function AdminAccessGuide() {
  const { t } = useTranslation();

  const steps = t("adminDashboard.accessGuideSteps", { returnObjects: true }) as string[];
  const safeSteps = Array.isArray(steps) ? steps : [];

  return (
    <Card className="border-[#D4AF37]/20 bg-[#D4AF37]/5 p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15">
          <Shield className="h-5 w-5 text-[#D4AF37]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{t("adminDashboard.accessGuideTitle")}</h2>
          <p className="mt-1 text-sm text-text-muted">{t("adminDashboard.accessGuideIntro")}</p>
        </div>
      </div>

      <ol className="space-y-3">
        {safeSteps.map((step, index) => {
          const Icon = STEP_ICONS[index] ?? Shield;
          return (
            <li key={index} className="flex gap-3 text-sm text-text-muted">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-xs font-bold text-[#D4AF37]">
                {index + 1}
              </span>
              <span className="flex items-start gap-2 pt-0.5">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden />
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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D4AF37] hover:underline"
        >
          {t("adminDashboard.accessGuidePublicLink")}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
