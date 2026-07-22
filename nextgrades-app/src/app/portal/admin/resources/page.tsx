"use client";

import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function AdminResourcesPage() {
  const { t } = useTranslation();

  return (
    <DashboardPage
      role="admin"
      titleKey="dashboardPages.admin.resources.title"
      descriptionKey="dashboardPages.admin.resources.description"
    >
      <Card hoverable={false} className="flex flex-col items-center px-6 py-14 text-center sm:px-10">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gold-muted)]">
          <FileText className="h-7 w-7 text-[var(--brand-gold)]" aria-hidden />
        </div>
        <h2 className="text-lg font-bold text-foreground">{t("adminResources.emptyTitle")}</h2>
        <p className="mt-2 max-w-lg text-sm text-text-muted">{t("adminResources.emptyDesc")}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button variant="gold" href="/portal/admin/cms/resources">
            {t("adminResources.openCms")}
          </Button>
          <Link
            href="/resources"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-gold)] hover:underline"
          >
            {t("adminResources.viewPublic")}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Card>
    </DashboardPage>
  );
}
