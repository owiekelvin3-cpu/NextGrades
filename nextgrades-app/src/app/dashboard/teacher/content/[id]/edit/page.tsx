"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { TEACHER_PUBLISHING_ENABLED } from "@/lib/resources/teacher-publishing";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";
import { PublishContentForm } from "@/components/teacher/PublishContentForm";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { useState } from "react";

export default function EditResourcePage() {
  const { t } = useTranslation();
  const { error: toastError } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!TEACHER_PUBLISHING_ENABLED) {
      router.replace("/dashboard/teacher/content");
    }
  }, [router]);

  useEffect(() => {
    if (!TEACHER_PUBLISHING_ENABLED) return;

    void fetch(`/api/teacher/resources/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || t("teacherContent.notFound"));
        return data;
      })
      .then((data) => {
        if (data?.id) {
          const tagIds =
            data.resource_tag_relations?.map((r: { tag_id: string }) => r.tag_id) ?? [];
          setInitialData({
            title: data.title || "",
            short_description: data.short_description || data.description || "",
            full_description: data.full_description || "",
            content_type: data.content_type || "learning_material",
            category_id: data.category_id || "",
            subject_id: data.subject_id || "",
            class_id: data.class_id || "",
            class_ids: Array.isArray(data.class_ids) && data.class_ids.length
              ? data.class_ids
              : data.class_id
                ? [data.class_id]
                : [],
            tag_ids: tagIds,
            difficulty_level: data.difficulty_level || "beginner",
            age_range: data.age_range || "all_ages",
            estimated_minutes: data.estimated_minutes ? String(data.estimated_minutes) : "",
            language: data.language || "en",
            status: data.status || "draft",
            access_type: data.access_type || "free",
            price: data.price ? String(data.price) : "",
            external_url: data.url || "",
          });
        }
      })
      .catch((err) => {
        toastError(err instanceof Error ? err.message : t("teacherContent.loadResourceFailed"));
      })
      .finally(() => setLoading(false));
  }, [id, toastError, t]);

  if (!TEACHER_PUBLISHING_ENABLED) {
    return null;
  }

  return (
    <TeacherDashboardLayout
      title={t("teacherContent.editTitle")}
      headerAction={
        <Button variant="outline" size="sm" href="/dashboard/teacher/content">
          {t("teacherContent.backToLibrary")}
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl">
        <p className={`mb-6 text-sm text-text-muted`}>
          {t("teacherContent.editSubtitle")}
        </p>
        {loading ? (
          <LoadingBlock />
        ) : initialData ? (
          <PublishContentForm resourceId={id} initialData={initialData as never} />
        ) : (
          <p className="text-text-muted">
            {t("teacherContent.notFound")}{" "}
            <Link href="/dashboard/teacher/content" className="text-[#D4AF37] hover:underline">
              {t("teacherContent.returnToLibrary")}
            </Link>
          </p>
        )}
      </div>
    </TeacherDashboardLayout>
  );
}
