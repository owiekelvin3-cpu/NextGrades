"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TEACHER_PUBLISHING_ENABLED } from "@/lib/resources/teacher-publishing";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";
import { PublishContentForm } from "@/components/teacher/PublishContentForm";
import { useTranslation } from "react-i18next";

export default function TeacherPublishPage() {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (!TEACHER_PUBLISHING_ENABLED) {
      router.replace("/dashboard/teacher/content");
    }
  }, [router]);

  if (!TEACHER_PUBLISHING_ENABLED) {
    return null;
  }

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.publish")}
      description={t("teacherDashboard.publishPageDesc")}
    >
      <div className="mx-auto max-w-4xl">
        <PublishContentForm />
      </div>
    </TeacherDashboardLayout>
  );
}
