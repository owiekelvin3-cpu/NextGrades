"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LearningResource } from "@/components/resources/ResourceLearningCard";
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";
import { buildLoginUrl } from "@/lib/auth/redirect";
import { isFreeResource, isPremiumResource } from "@/lib/resources/ui-config";
import { isVideoResource, resourceWatchPath } from "@/lib/resources/video";

export type CatalogSubject = { id: string; name: string; slug?: string | null };
export type CatalogClass = { id: string; name: string; level: number };

type FetchParams = {
  search?: string;
  subject?: string;
  classLevel?: string;
  semester?: string;
  access?: "all" | "free" | "premium";
  contentType?: string;
  contentTypes?: string[];
  sort?: "recent" | "popular" | "downloads";
  limit?: number;
};

export function useResourcesCatalog(initial?: FetchParams) {
  const toast = useToast();
  const router = useRouter();
  const { t } = useTranslation();

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [classes, setClasses] = useState<CatalogClass[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(initial?.search ?? "");
  const [subjectSlug, setSubjectSlug] = useState(initial?.subject ?? "");
  const [classLevel, setClassLevel] = useState(initial?.classLevel ?? "");
  const [semester, setSemester] = useState(initial?.semester ?? "");
  const [accessFilter, setAccessFilter] = useState<"all" | "free" | "premium">(initial?.access ?? "all");
  const [contentType, setContentType] = useState(initial?.contentType ?? "");
  const [contentTypes, setContentTypes] = useState<string[]>(initial?.contentTypes ?? []);
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);
  const [sort, setSort] = useState<"recent" | "popular" | "downloads">(initial?.sort ?? "recent");

  useEffect(() => {
    void fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        if (data?.subjects) setSubjects(data.subjects);
        if (data?.classes) setClasses(data.classes);
      });
  }, []);

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(initial?.limit ?? 200), sort });
      if (search.trim()) params.set("search", search.trim());
      if (subjectSlug) params.set("subject", subjectSlug);
      if (classLevel) params.set("class", classLevel);
      if (semester) params.set("semester", semester);
      if (accessFilter !== "all") params.set("access", accessFilter);
      if (contentType) params.set("contentType", contentType);

      const res = await fetch(`/api/resources/public?${params}`);
      let data: LearningResource[] = res.ok ? await res.json() : [];

      const typeFilter = contentTypes.length ? contentTypes : materialTypes.length ? materialTypes : [];
      if (typeFilter.length) {
        data = data.filter((r) => typeFilter.includes(r.content_type || r.type || ""));
      }

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        data = data.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            (r.description ?? "").toLowerCase().includes(q) ||
            (r.short_description ?? "").toLowerCase().includes(q)
        );
      }

      setResources(data);
    } finally {
      setLoading(false);
    }
  }, [search, subjectSlug, classLevel, semester, accessFilter, contentType, contentTypes, materialTypes, sort, initial?.limit]);

  useEffect(() => {
    const timer = setTimeout(() => void loadResources(), 200);
    return () => clearTimeout(timer);
  }, [loadResources]);

  const freeResources = useMemo(() => resources.filter(isFreeResource), [resources]);
  const premiumResources = useMemo(() => resources.filter(isPremiumResource), [resources]);

  const subjectCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of resources) {
      const slug = r.subject?.slug || r.subject?.name?.toLowerCase() || "other";
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
    return counts;
  }, [resources]);

  const chapters = useMemo(() => {
    const map = new Map<string, { name: string; count: number; description?: string }>();
    for (const r of resources) {
      const name = r.category?.name || "General";
      const existing = map.get(name);
      if (existing) existing.count += 1;
      else map.set(name, { name, count: 1, description: r.category?.name });
    }
    return Array.from(map.values());
  }, [resources]);

  const trackAction = async (id: string, action: "view" | "download") => {
    try {
      await fetch(`/api/resources/${id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    } catch {
      /* non-blocking */
    }
  };

  const openResource = async (resource: LearningResource) => {
    if (resource.locked) {
      router.push("/resources/upgrade");
      return;
    }

    if (isVideoResource(resource)) {
      router.push(resourceWatchPath(resource.id));
      return;
    }

    try {
      const res = await fetch(`/api/resources/${resource.id}/access`);
      const data = await res.json();
      if (res.status === 401) {
        router.push(buildLoginUrl(window.location.pathname));
        return;
      }
      if (!res.ok || !data.url) {
        toast.info(t("resources.premiumRequired"));
        return;
      }
      void trackAction(resource.id, "download");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error(t("misc.errorGeneric"));
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSubjectSlug("");
    setClassLevel("");
    setSemester("");
    setAccessFilter("all");
    setContentType("");
    setContentTypes([]);
    setMaterialTypes([]);
    setSort("recent");
  };

  return {
    resources,
    freeResources,
    premiumResources,
    subjects,
    classes,
    loading,
    search,
    setSearch,
    subjectSlug,
    setSubjectSlug,
    classLevel,
    setClassLevel,
    semester,
    setSemester,
    accessFilter,
    setAccessFilter,
    contentType,
    setContentType,
    contentTypes,
    setContentTypes,
    materialTypes,
    setMaterialTypes,
    sort,
    setSort,
    subjectCounts,
    chapters,
    resetFilters,
    openResource,
    trackAction,
    reload: loadResources,
  };
}
