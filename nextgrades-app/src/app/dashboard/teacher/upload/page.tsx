"use client";

import { PublishContentForm } from "@/components/teacher/PublishContentForm";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";
import { useTranslation } from "react-i18next";

export default function TeacherPublishPage() {
  const { t } = useTranslation();

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.publish", { defaultValue: "Publish new" })}
      description={t("teacherDashboard.publishPageDesc", {
        defaultValue: "Upload worksheets, videos, or guides — published items appear on the public Resources page.",
      })}
    >
      <div className="mx-auto max-w-4xl">
        <PublishContentForm />
      </div>
    </TeacherDashboardLayout>
  );
}
