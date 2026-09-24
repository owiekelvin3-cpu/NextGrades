"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Archive,
  FileText,
  Video,
  Image as ImageIcon,
  Folder,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";
import { themeSelectCompactClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";
import { TEACHER_PUBLISHING_ENABLED } from "@/lib/resources/teacher-publishing";

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
  moderation_status?: string | null;
  access_type: string;
  price: number;
  view_count: number;
  download_count: number;
  created_at: string;
  category: {
    id: string;
    name: string;
    icon: string;
  } | null;
  folder: {
    id: string;
    name: string;
  } | null;
}

function getResourceStatusLabel(
  resource: Resource,
  t: (key: string) => string
): { label: string; className: string } {
  if (resource.moderation_status === "pending" && resource.status === "draft") {
    return { label: t("teacherContent.statusPending"), className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" };
  }
  if (resource.moderation_status === "rejected") {
    return { label: t("teacherContent.statusNeedsRevision"), className: "bg-red-500/10 text-red-500" };
  }
  switch (resource.status) {
    case "published":
      return { label: t("teacherContent.statusPublished"), className: "bg-green-500/10 text-green-500" };
    case "draft":
      return { label: t("teacherContent.statusDraft"), className: "bg-gray-500/10 text-gray-500" };
    case "archived":
      return { label: t("teacherContent.statusArchived"), className: "bg-red-500/10 text-red-500" };
    case "private":
      return { label: t("teacherContent.statusPrivate"), className: "bg-gray-500/10 text-gray-500" };
    case "scheduled":
      return { label: t("teacherContent.statusScheduled"), className: "bg-blue-500/10 text-blue-500" };
    default:
      return { label: resource.status.replace("_", " "), className: "bg-gray-500/10 text-gray-500" };
  }
}

function getAccessLabel(access: string, t: (key: string) => string): string {
  switch (access) {
    case "free":
      return t("teacherContent.accessFree");
    case "premium":
      return t("teacherContent.accessPremium");
    case "locked":
      return t("teacherContent.accessLocked");
    case "members_only":
      return t("teacherContent.accessMembersOnly");
    default:
      return access.replace("_", " ");
  }
}

export default function TeacherContentPage() {
  const { theme } = useTheme();
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
      });
      const response = await fetch(`/api/teacher/resources?${params}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("teacherContent.loadFailed"));
      }
      setResources(data.resources || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("teacherContent.loadFailed");
      setFetchError(message);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, sortBy, sortOrder]);

  useEffect(() => {
    void fetch("/api/teacher/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    void fetchResources();
  }, [fetchResources]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("teacherContent.deleteConfirm"))) return;

    try {
      const response = await fetch(`/api/teacher/resources/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        success(t("teacherContent.deleteSuccess"));
        fetchResources();
      }
    } catch (error) {
      toastError(t("teacherContent.deleteFailed"));
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
        success(t("teacherContent.archiveSuccess"));
        fetchResources();
      }
    } catch {
      toastError(t("teacherContent.archiveFailed"));
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (resource: Resource) => getResourceStatusLabel(resource, t).className;
  const getStatusLabel = (resource: Resource) => getResourceStatusLabel(resource, t).label;

  const getAccessColor = (access: string) => {
    switch (access) {
      case "free": return "bg-green-500/10 text-green-500";
      case "premium": return "bg-yellow-500/10 text-yellow-500";
      case "locked": return "bg-red-500/10 text-red-500";
      case "members_only": return "bg-purple-500/10 text-purple-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-5 h-5" />;
      case "image": return <ImageIcon className="w-5 h-5" />;
      case "pdf": return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.myMaterials")}
      description={
        TEACHER_PUBLISHING_ENABLED
          ? t("teacherDashboard.contentPageDesc")
          : t("teacherContent.contentPageDescAdmin")
      }
      headerAction={
        TEACHER_PUBLISHING_ENABLED ? (
          <Button variant="gold" size="md" href="/dashboard/teacher/upload">
            <Plus className="mr-2 h-5 w-5" />
            {t("teacherDashboard.nav.publish")}
          </Button>
        ) : undefined
      }
    >
      <div className="mx-auto max-w-7xl">
          {fetchError && (
            <Card className={`mb-6 border-l-4 border-red-500 p-4`}>
              <p className="text-sm text-red-600">{fetchError}</p>
            </Card>
          )}

          {/* Filters */}
          <Card className={`p-4 mb-6`}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted`} />
                <input
                  type="text"
                  placeholder={t("teacherContent.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "bg-[#0D1B2A] border-white/10 text-white placeholder-gray-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  } focus:outline-none focus:ring-2 focus:ring-[#D4AF37]`}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={filterSelect(statusFilter)}
                >
                  <option value="all">{t("teacherContent.statusAll")}</option>
                  <option value="published">{t("teacherContent.statusPublished")}</option>
                  <option value="draft">{t("teacherContent.statusDraft")}</option>
                  <option value="pending_review">{t("teacherContent.statusPending")}</option>
                  <option value="private">{t("teacherContent.statusPrivate")}</option>
                  <option value="scheduled">{t("teacherContent.statusScheduled")}</option>
                  <option value="archived">{t("teacherContent.statusArchived")}</option>
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-text-muted`} />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={filterSelect(categoryFilter)}
                >
                  <option value="all">{t("teacherContent.categoryAll")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-text-muted`} />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split("-");
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  className={filterSelect(`${sortBy}-${sortOrder}`)}
                >
                  <option value="created_at-desc">{t("teacherContent.sortNewestFirst")}</option>
                  <option value="created_at-asc">{t("teacherContent.sortOldestFirst")}</option>
                  <option value="view_count-desc">{t("teacherContent.sortMostViewed")}</option>
                  <option value="download_count-desc">{t("teacherContent.sortMostDownloaded")}</option>
                  <option value="title-asc">{t("teacherContent.sortTitleAsc")}</option>
                  <option value="title-desc">{t("teacherContent.sortTitleDesc")}</option>
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-text-muted`} />
              </div>
            </div>
          </Card>

          {/* Resources Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className={`p-6`}>
                  <div className="animate-pulse">
                    <div className="w-full h-40 rounded-lg bg-gray-200 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <Card className={`p-12 text-center`}>
              <Folder className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className={`text-xl font-semibold mb-2 text-foreground`}>
                {t("teacherContent.emptyTitle")}
              </h3>
              <p className={`mb-6 text-text-muted`}>
                {searchQuery
                  ? t("teacherContent.emptySearch")
                  : TEACHER_PUBLISHING_ENABLED
                    ? t("teacherContent.emptyDefault")
                    : t("teacherContent.emptyAdminManaged")}
              </p>
              {!searchQuery && TEACHER_PUBLISHING_ENABLED && (
                <Button variant="gold" size="md" href="/dashboard/teacher/upload">
                  <Plus className="w-5 h-5 mr-2" />
                  {t("teacherContent.uploadFirstCta")}
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card className={`overflow-hidden`}>
                    {/* Thumbnail */}
                    <div className="relative h-40 bg-gradient-to-br from-[#D4AF37]/20 to-[#4DA3FF]/20 flex items-center justify-center">
                      {resource.thumbnail_url ? (
                        <img
                          src={resource.thumbnail_url}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-white"}`}>
                          {getTypeIcon(resource.type)}
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge className={getStatusColor(resource)}>
                          {getStatusLabel(resource)}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-semibold text-lg text-foreground line-clamp-2`}>
                          {resource.title}
                        </h3>
                      </div>

                      {resource.description && (
                        <p className={`text-sm mb-3 line-clamp-2 text-text-muted`}>
                          {resource.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        {resource.category && (
                          <Badge variant="outline" className={`text-xs ${theme === "dark" ? "border-white/20 text-white" : "border-gray-200 text-gray-700"}`}>
                            {resource.category.name}
                          </Badge>
                        )}
                        <Badge className={getAccessColor(resource.access_type)}>
                          {getAccessLabel(resource.access_type, t)}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className={`flex items-center gap-1 text-text-muted`}>
                          <Eye className="w-4 h-4" />
                          <span>{resource.view_count}</span>
                        </div>
                        <div className={`flex items-center gap-1 text-text-muted`}>
                          <Download className="w-4 h-4" />
                          <span>{resource.download_count}</span>
                        </div>
                        {resource.price > 0 && (
                          <div className={`flex items-center gap-1 text-[#D4AF37] font-semibold`}>
                            <span>€{resource.price.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {TEACHER_PUBLISHING_ENABLED && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`flex-1 ${theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                            href={`/dashboard/teacher/content/${resource.id}/edit`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            {t("teacherContent.edit")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                            onClick={() => handleArchive(resource.id)}
                            title={t("teacherContent.archive")}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                            onClick={() => handleDelete(resource.id)}
                            title={t("teacherContent.delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
    </TeacherDashboardLayout>
  );
}
