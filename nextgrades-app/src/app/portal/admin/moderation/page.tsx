"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useTranslation } from "react-i18next";
import { useToast } from "@/context/ToastContext";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type ModerationItem = {
  id: string;
  title: string;
  description: string | null;
  short_description?: string | null;
  type: string;
  content_type?: string | null;
  url: string | null;
  storage_path?: string | null;
  moderation_status: string;
  access_type: string;
  is_premium?: boolean;
  price?: number | string | null;
  created_at: string;
  author?: { full_name: string | null } | null;
  category?: { name: string } | null;
  subject?: { name: string } | null;
  class?: { name: string } | null;
};

const FILTERS = ["pending", "approved", "rejected"] as const;

export default function AdminModerationPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [acting, setActing] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/moderation?status=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load moderation queue");
      }
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
      setLoadError(e instanceof Error ? e.message : "Failed to load moderation queue");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const moderate = async (id: string, status: "approved" | "rejected") => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/moderation/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moderation_status: status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast.success(
        status === "approved" ? t("adminModeration.approved") : t("adminModeration.rejected")
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("adminModeration.actionFailed"));
    } finally {
      setActing(null);
    }
  };

  return (
    <DashboardPage
      role="admin"
      titleKey="dashboardPages.admin.moderation.title"
      descriptionKey="dashboardPages.admin.moderation.description"
    >
      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-border-default bg-surface-elevated p-2">
        {FILTERS.map((s) => (
          <Button
            key={s}
            variant={filter === s ? "gold" : "ghost"}
            size="sm"
            className={cn(filter !== s && "text-text-muted")}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {loadError && (
        <Card hoverable={false} className="mb-4 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-600">{loadError}</p>
        </Card>
      )}

      {loading ? (
        <LoadingBlock />
      ) : items.length === 0 ? (
        <EmptyState
          title={t("dashboardPages.admin.moderation.title")}
          description={t("dashboardPages.admin.moderation.empty", {
            status: filter,
            defaultValue: `No ${filter} resources.`,
          })}
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} hoverable={false} className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <Badge variant="gold">{item.content_type || item.type}</Badge>
                    <Badge variant={item.access_type === "premium" ? "warning" : "success"}>
                      {item.access_type === "premium" ? "Premium" : "Free"}
                    </Badge>
                  </div>
                  {(item.short_description || item.description) && (
                    <p className="mb-2 line-clamp-2 text-sm text-text-muted">
                      {item.short_description || item.description}
                    </p>
                  )}
                  <p className="text-xs text-text-muted">
                    {item.author?.full_name ?? "Teacher"} ·{" "}
                    {[item.subject?.name, item.class?.name].filter(Boolean).join(" · ") ||
                      item.category?.name ||
                      "Uncategorized"}{" "}
                    · {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    href={`/portal/admin/resources/${item.id}/edit`}
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Review
                  </Button>
                  {filter === "pending" && (
                    <>
                      <Button
                        variant="gold"
                        size="sm"
                        disabled={acting === item.id}
                        onClick={() => void moderate(item.id, "approved")}
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={acting === item.id}
                        onClick={() => void moderate(item.id, "rejected")}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardPage>
  );
}
