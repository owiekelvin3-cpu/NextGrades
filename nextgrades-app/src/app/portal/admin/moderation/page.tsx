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

type ModerationItem = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  moderation_status: string;
  access_type: string;
  created_at: string;
  profiles?: { full_name: string | null };
  category?: { name: string } | null;
};

export default function AdminModerationPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/moderation?status=${filter}`);
      if (res.ok) setItems(await res.json());
      else setItems([]);
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
      toast.success(status === "approved" ? "Resource approved" : "Resource rejected");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActing(null);
    }
  };

  return (
    <DashboardPage
      role="admin"
      titleKey="dashboardPages.admin.resources.title"
      descriptionKey="dashboardCommon.comingSoonDesc"
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <Button
            key={s}
            variant={filter === s ? "gold" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {loading ? (
        <LoadingBlock />
      ) : items.length === 0 ? (
        <EmptyState
          title={t("dashboardPages.admin.resources.title", { defaultValue: "Content moderation" })}
          description={`No ${filter} resources.`}
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className={`p-6`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <Badge variant="gold">{item.type}</Badge>
                    <Badge>{item.access_type}</Badge>
                  </div>
                  {item.description && (
                    <p className="mb-2 text-sm text-text-muted line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-xs text-text-muted">
                    {item.profiles?.full_name ?? "Teacher"} ·{" "}
                    {item.category?.name ?? "Uncategorized"} ·{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Preview
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
