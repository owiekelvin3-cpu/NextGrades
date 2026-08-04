"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  FileText,
  Video,
  Image as ImageIcon,
  Archive,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useToast } from "@/context/ToastContext";
import { themeSelectCompactClass } from "@/lib/theme/form-fields";

interface Category {
  id: string;
  name: string;
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  thumbnail_url: string | null;
  status: string;
  moderation_status: string | null;
  access_type: string;
  view_count: number;
  download_count: number;
  created_at: string;
  category: { id: string; name: string; icon: string } | null;
}

export function AdminResourcesExperience() {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const filterSelect = (value: string) => themeSelectCompactClass(value, "pr-10");

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const params = new URLSearchParams({
        status: statusFilter,
        category: categoryFilter,
        sortBy,
        sortOrder,
        limit: "50",
      });
      const response = await fetch(`/api/teacher/resources?${params}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("adminResources.loadFailed", { defaultValue: "Failed to load resources" }));
      }
      setResources(data.resources || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("adminResources.loadFailed", { defaultValue: "Failed to load resources" });
      setFetchError(message);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, sortBy, sortOrder, t]);

  useEffect(() => {
    void fetch("/api/teacher/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    void fetchResources();
  }, [fetchResources]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("adminResources.deleteConfirm", { defaultValue: "Delete this resource permanently?" }))) return;
    try {
      const response = await fetch(`/api/teacher/resources/${id}`, { method: "DELETE" });
      if (response.ok) {
        success(t("adminResources.deleteSuccess", { defaultValue: "Resource deleted" }));
        fetchResources();
      } else {
        const data = await response.json();
        toastError(data.error || t("adminResources.deleteFailed", { defaultValue: "Delete failed" }));
      }
    } catch {
      toastError(t("adminResources.deleteFailed", { defaultValue: "Delete failed" }));
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/moderation/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moderation_status: "approved" }),
      });
      if (response.ok) {
        success(t("adminModeration.approved", { defaultValue: "Resource approved" }));
        fetchResources();
      } else {
        const data = await response.json();
        toastError(data.error || t("adminModeration.actionFailed", { defaultValue: "Action failed" }));
      }
    } catch {
      toastError(t("adminModeration.actionFailed", { defaultValue: "Action failed" }));
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch(`/api/teacher/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });
      if (response.ok) {
        success(t("adminResources.archiveSuccess", { defaultValue: "Resource archived" }));
        fetchResources();
      }
    } catch {
      toastError(t("adminResources.archiveFailed", { defaultValue: "Archive failed" }));
    }
  };

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTypeIcon = (type: string) => {
    if (type === "video") return <Video className="h-5 w-5" />;
    if (type === "image") return <ImageIcon className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const statusBadge = (resource: Resource) => {
    if (resource.moderation_status === "pending") {
      return <Badge variant="warning">{t("adminResources.statusPending", { defaultValue: "Pending review" })}</Badge>;
    }
    if (resource.status === "published") {
      return <Badge variant="success">{t("adminResources.statusPublished", { defaultValue: "Published" })}</Badge>;
    }
    if (resource.status === "archived") {
      return <Badge variant="outline">{t("adminResources.statusArchived", { defaultValue: "Archived" })}</Badge>;
    }
    return <Badge variant="outline">{resource.status}</Badge>;
  };

  return (
    <DashboardPage
      role="admin"
      titleKey="dashboardPages.admin.resources.title"
      descriptionKey="dashboardPages.admin.resources.description"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="gold" size="md" href="/portal/admin/resources/upload">
            <Plus className="mr-2 h-4 w-4" />
            {t("adminResources.uploadNew", { defaultValue: "Upload resource" })}
          </Button>
          <Button variant="secondary" size="md" href="/portal/admin/moderation">
            {t("adminResources.reviewQueue", { defaultValue: "Review queue" })}
          </Button>
          <Link
            href="/resources"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border-default px-4 text-sm font-medium text-foreground transition hover:border-[var(--border-strong)]"
          >
            {t("adminResources.viewPublic", { defaultValue: "View public page" })}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      }
    >
      {fetchError && (
        <Card hoverable={false} className="mb-6 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-600">{fetchError}</p>
        </Card>
      )}

      <Card hoverable={false} className="admin-panel mb-6 p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={t("adminResources.searchPlaceholder", { defaultValue: "Search resources…" })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input-border bg-input-background py-2 pl-10 pr-4 text-sm text-input-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterSelect(statusFilter)}>
            <option value="all">{t("adminResources.statusAll", { defaultValue: "All status" })}</option>
            <option value="published">{t("adminResources.statusPublished", { defaultValue: "Published" })}</option>
            <option value="draft">{t("adminResources.statusDraft", { defaultValue: "Draft" })}</option>
            <option value="archived">{t("adminResources.statusArchived", { defaultValue: "Archived" })}</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={filterSelect(categoryFilter)}>
            <option value="all">{t("adminResources.categoryAll", { defaultValue: "All categories" })}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split("-");
              setSortBy(by);
              setSortOrder(order);
            }}
            className={filterSelect(`${sortBy}-${sortOrder}`)}
          >
            <option value="created_at-desc">{t("adminResources.sortNewest", { defaultValue: "Newest" })}</option>
            <option value="created_at-asc">{t("adminResources.sortOldest", { defaultValue: "Oldest" })}</option>
            <option value="title-asc">{t("adminResources.sortTitle", { defaultValue: "Title" })}</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <LoadingBlock />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          title={t("adminResources.emptyTitle", { defaultValue: "No resources yet" })}
          description={
            searchQuery
              ? t("adminResources.emptySearch", { defaultValue: "Try adjusting your search or filters" })
              : t("adminResources.emptyDesc", { defaultValue: "Upload learning materials to publish them on the public Resources page." })
          }
          action={
            <Button variant="gold" size="md" href="/portal/admin/resources/upload">
              {t("adminResources.uploadNew", { defaultValue: "Upload resource" })}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card hoverable={false} className="admin-panel p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-gold-muted)] text-[var(--brand-gold)]">
                      {getTypeIcon(resource.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-foreground">{resource.title}</h3>
                        {statusBadge(resource)}
                        {resource.access_type === "premium" && (
                          <Badge variant="warning">{t("adminResources.premium", { defaultValue: "Premium" })}</Badge>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-text-muted">
                        {resource.category?.name || "—"} · {resource.view_count} {t("adminResources.views", { defaultValue: "views" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    {resource.moderation_status === "pending" && (
                      <Button variant="gold" size="sm" onClick={() => handleApprove(resource.id)}>
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        {t("adminResources.approve", { defaultValue: "Approve" })}
                      </Button>
                    )}
                    {resource.status === "published" && resource.url && (
                      <Link
                        href={`/resources/watch/${resource.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-foreground transition hover:bg-surface-subtle"
                      >
                        <Eye className="h-4 w-4" />
                        {t("adminResources.preview", { defaultValue: "Preview" })}
                      </Link>
                    )}
                    <Button variant="outline" size="sm" href={`/portal/admin/resources/${resource.id}/edit`}>
                      <Edit className="mr-1 h-4 w-4" />
                      {t("adminResources.edit", { defaultValue: "Edit" })}
                    </Button>
                    {resource.status !== "archived" && (
                      <Button variant="ghost" size="sm" onClick={() => handleArchive(resource.id)}>
                        <Archive className="mr-1 h-4 w-4" />
                        {t("adminResources.archive", { defaultValue: "Archive" })}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(resource.id)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="mr-1 h-4 w-4" />
                      {t("adminResources.delete", { defaultValue: "Delete" })}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardPage>
  );
}
