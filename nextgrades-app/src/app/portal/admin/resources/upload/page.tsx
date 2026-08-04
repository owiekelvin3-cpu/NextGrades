"use client";

import { PublishContentForm } from "@/components/teacher/PublishContentForm";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

export default function AdminResourceUploadPage() {
  const { t } = useTranslation();

  return (
    <DashboardPage
      role="admin"
      titleKey="adminResources.uploadTitle"
      descriptionKey="adminResources.uploadDesc"
      actions={
        <Button variant="outline" size="sm" href="/portal/admin/resources">
          {t("adminResources.backToList", { defaultValue: "Back to library" })}
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl">
        <PublishContentForm
          isAdmin
          redirectPath="/portal/admin/resources"
        />
      </div>
    </DashboardPage>
  );
}
