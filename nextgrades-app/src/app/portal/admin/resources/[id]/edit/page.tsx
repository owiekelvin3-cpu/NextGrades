"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { PublishContentForm } from "@/components/teacher/PublishContentForm";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";

export default function AdminEditResourcePage() {
  const { t } = useTranslation();
  const { error: toastError } = useToast();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void fetch(`/api/teacher/resources/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Resource not found");
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
            semester: data.semester || "",
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
        toastError(err instanceof Error ? err.message : "Failed to load resource");
      })
      .finally(() => setLoading(false));
  }, [id, toastError]);

  return (
    <DashboardPage
      role="admin"
      titleKey="adminResources.editTitle"
      descriptionKey="adminResources.editDesc"
      actions={
        <Button variant="outline" size="sm" href="/portal/admin/resources">
          {t("adminResources.backToList", { defaultValue: "Back to library" })}
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl">
        {loading ? (
          <LoadingBlock />
        ) : initialData ? (
          <PublishContentForm
            resourceId={id}
            initialData={initialData as never}
            isAdmin
            redirectPath="/portal/admin/resources"
          />
        ) : (
          <p className="text-text-muted">
            {t("adminResources.notFound", { defaultValue: "Resource not found." })}{" "}
            <Link href="/portal/admin/resources" className="text-[var(--brand-gold)] hover:underline">
              {t("adminResources.backToList", { defaultValue: "Back to library" })}
            </Link>
          </p>
        )}
      </div>
    </DashboardPage>
  );
}
