"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";
import { PublishContentForm } from "@/components/teacher/PublishContentForm";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useParams } from "next/navigation";

export default function EditResourcePage() {
  const { theme } = useTheme();
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
    <TeacherDashboardLayout
      title="Edit Resource"
      headerAction={
        <Button variant="outline" size="sm" href="/dashboard/teacher/content">
          Back to library
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl">
        <p className={`mb-6 text-sm text-text-muted`}>
          Update details, thumbnail, or pricing
        </p>
        {loading ? (
          <LoadingBlock />
        ) : initialData ? (
          <PublishContentForm resourceId={id} initialData={initialData as never} />
        ) : (
          <p className="text-text-muted">
            Resource not found.{" "}
            <Link href="/dashboard/teacher/content" className="text-[#D4AF37] hover:underline">
              Return to My Resources
            </Link>
          </p>
        )}
      </div>
    </TeacherDashboardLayout>
  );
}
