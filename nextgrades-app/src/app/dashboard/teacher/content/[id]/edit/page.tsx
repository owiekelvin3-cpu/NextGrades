"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PublishContentForm } from "@/components/teacher/PublishContentForm";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function EditResourcePage() {
  const { theme } = useTheme();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void fetch(`/api/teacher/resources/${id}`)
      .then((r) => r.json())
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
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Sidebar role="teacher" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 md:pt-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="sm" href="/dashboard/teacher/content">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
              Edit Resource
            </h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Update details, thumbnail, or pricing
            </p>
          </div>
        </div>
        {loading ? (
          <LoadingBlock />
        ) : initialData ? (
          <PublishContentForm resourceId={id} initialData={initialData as never} />
        ) : (
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            Resource not found.{" "}
            <Link href="/dashboard/teacher/content" className="text-[#D4AF37] hover:underline">
              Return to My Resources
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
