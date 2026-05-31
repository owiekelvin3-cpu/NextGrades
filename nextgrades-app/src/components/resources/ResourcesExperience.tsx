"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { ResourceLearningCard, type LearningResource } from "@/components/resources/ResourceLearningCard";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useToast } from "@/context/ToastContext";
import {
  CONTENT_TYPES,
  DIFFICULTY_LEVELS,
  AGE_RANGES,
  LANGUAGES,
} from "@/lib/resources/constants";
import { buildLoginUrl } from "@/lib/auth/redirect";
import { isVideoResource, resourceWatchPath } from "@/lib/resources/video";
import { Search, Filter, ChevronRight, FileText } from "lucide-react";

type Category = { id: string; name: string };
type CatalogSubject = { id: string; name: string; slug?: string | null };
type CatalogClass = { id: string; name: string; level: number };

export function ResourcesExperience() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggle, isBookmarked, bookmarks } = useBookmarks();

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogSubjects, setCatalogSubjects] = useState<CatalogSubject[]>([]);
  const [catalogClasses, setCatalogClasses] = useState<CatalogClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [contentType, setContentType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subjectSlug, setSubjectSlug] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [accessFilter, setAccessFilter] = useState<"all" | "free" | "premium">("all");
  const [teacherId, setTeacherId] = useState("");
  const [language, setLanguage] = useState("");
  const [sort, setSort] = useState<"recent" | "popular" | "downloads">("recent");

  useEffect(() => {
    setSubjectSlug(searchParams.get("subject") || "");
    setClassLevel(searchParams.get("class") || "");
    setSemester(searchParams.get("semester") || "");
  }, [searchParams]);

  useEffect(() => {
    void Promise.all([
      fetch("/api/teacher/categories").then((r) => r.json()),
      fetch("/api/catalog").then((r) => r.json()),
    ]).then(([cats, catalog]) => {
      if (Array.isArray(cats)) setCategories(cats);
      if (catalog?.subjects) setCatalogSubjects(catalog.subjects);
      if (catalog?.classes) setCatalogClasses(catalog.classes);
    });
  }, []);

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100", sort });
      if (search.trim()) params.set("search", search.trim());
      if (contentType) params.set("contentType", contentType);
      if (categoryId) params.set("category", categoryId);
      if (subjectSlug) params.set("subject", subjectSlug);
      if (classLevel) params.set("class", classLevel);
      if (semester) params.set("semester", semester);
      if (ageRange) params.set("ageRange", ageRange);
      if (difficulty) params.set("difficulty", difficulty);
      if (accessFilter !== "all") params.set("access", accessFilter);
      if (teacherId) params.set("teacher", teacherId);
      if (language) params.set("language", language);

      const res = await fetch(`/api/resources/public?${params}`);
      if (res.ok) {
        setResources(await res.json());
      } else {
        setResources([]);
      }
    } finally {
      setLoading(false);
    }
  }, [
    search,
    contentType,
    categoryId,
    subjectSlug,
    classLevel,
    semester,
    ageRange,
    difficulty,
    accessFilter,
    teacherId,
    language,
    sort,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => void loadResources(), 250);
    return () => clearTimeout(timer);
  }, [loadResources]);

  const teachers = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of resources) {
      if (r.author?.id && r.author.full_name) map.set(r.author.id, r.author.full_name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [resources]);

  const savedItems = useMemo(() => resources.filter((r) => bookmarks.includes(r.id)), [bookmarks, resources]);

  const resetFilters = () => {
    setContentType("");
    setCategoryId("");
    setSubjectSlug("");
    setClassLevel("");
    setSemester("");
    setAgeRange("");
    setDifficulty("");
    setAccessFilter("all");
    setTeacherId("");
    setLanguage("");
    setSearch("");
    setSort("recent");
  };

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

  const handleOpen = async (resource: LearningResource) => {
    if (resource.locked) {
      toast.info(t("resources.premiumRequired", { defaultValue: "Premium membership or enrollment required." }));
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
        router.push(buildLoginUrl(`/resources`));
        return;
      }

      if (!res.ok || !data.url) {
        toast.info(
          t("resources.premiumRequired", { defaultValue: "Premium membership or enrollment required." })
        );
        return;
      }

      void trackAction(resource.id, "download");
      window.open(data.url, "_blank", "noopener,noreferrer");
      toast.success(t("resources.downloadStarted", { defaultValue: `Opening "${resource.title}"…` }));
    } catch {
      toast.error(t("misc.errorGeneric", { defaultValue: "Something went wrong. Please try again." }));
    }
  };

  const text = theme === "dark" ? "text-white" : "text-[#0D1B2A]";
  const muted = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const panel = theme === "dark" ? "bg-[#112240] border-white/10" : "bg-white border-gray-200";
  const selectCls = `w-full rounded-lg border px-3 py-2 text-sm ${theme === "dark" ? "bg-[#0D1B2A] border-white/15 text-white" : "bg-white border-gray-200"}`;

  if (loading && resources.length === 0) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <LoadingBlock />
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6">
            <Card className={`p-6 ${panel}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold flex items-center gap-2 ${text}`}>
                  <Filter className="w-4 h-4 text-[#D4AF37]" />
                  {t("resources.filters.title", { defaultValue: "Filters" })}
                </h3>
                <button type="button" onClick={resetFilters} className="text-xs text-[#D4AF37] hover:underline">
                  {t("resources.filters.reset", { defaultValue: "Reset" })}
                </button>
              </div>
              <div className="space-y-4 text-sm">
                {catalogSubjects.length > 0 && (
                  <div>
                    <p className={`font-medium mb-2 ${muted}`}>
                      {t("resources.filters.subject", { defaultValue: "Subject" })}
                    </p>
                    <select value={subjectSlug} onChange={(e) => setSubjectSlug(e.target.value)} className={selectCls}>
                      <option value="">{t("resources.filters.allSubjects", { defaultValue: "All subjects" })}</option>
                      {catalogSubjects.map((s) => (
                        <option key={s.id} value={s.slug || s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {catalogClasses.length > 0 && (
                  <div>
                    <p className={`font-medium mb-2 ${muted}`}>
                      {t("resources.filters.grade", { defaultValue: "Grade" })}
                    </p>
                    <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className={selectCls}>
                      <option value="">{t("resources.filters.allGrades", { defaultValue: "All grades" })}</option>
                      {catalogClasses.map((c) => (
                        <option key={c.id} value={String(c.level)}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <p className={`font-medium mb-2 ${muted}`}>
                    {t("resources.filters.semester", { defaultValue: "Semester" })}
                  </p>
                  <select value={semester} onChange={(e) => setSemester(e.target.value)} className={selectCls}>
                    <option value="">{t("resources.filters.allSemesters", { defaultValue: "All semesters" })}</option>
                    <option value="1">{t("resources.filters.semester1", { defaultValue: "Semester 1" })}</option>
                    <option value="2">{t("resources.filters.semester2", { defaultValue: "Semester 2" })}</option>
                  </select>
                </div>
                <div>
                  <p className={`font-medium mb-2 ${muted}`}>Content Type</p>
                  <select value={contentType} onChange={(e) => setContentType(e.target.value)} className={selectCls}>
                    <option value="">All types</option>
                    {CONTENT_TYPES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className={`font-medium mb-2 ${muted}`}>Category</p>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectCls}>
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className={`font-medium mb-2 ${muted}`}>Age Range</p>
                  <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className={selectCls}>
                    <option value="">All ages</option>
                    {AGE_RANGES.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className={`font-medium mb-2 ${muted}`}>Difficulty</p>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={selectCls}>
                    <option value="">All levels</option>
                    {DIFFICULTY_LEVELS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className={`font-medium mb-2 ${muted}`}>{t("resources.filters.access", { defaultValue: "Access" })}</p>
                  {(["all", "free", "premium"] as const).map((a) => (
                    <label key={a} className={`flex items-center gap-2 mb-2 cursor-pointer ${muted}`}>
                      <input type="radio" name="access" checked={accessFilter === a} onChange={() => setAccessFilter(a)} className="accent-[#D4AF37]" />
                      {a === "all" ? "All" : a.charAt(0).toUpperCase() + a.slice(1)}
                    </label>
                  ))}
                </div>
                {teachers.length > 0 && (
                  <div>
                    <p className={`font-medium mb-2 ${muted}`}>Teacher</p>
                    <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={selectCls}>
                      <option value="">All teachers</option>
                      {teachers.map((tch) => (
                        <option key={tch.id} value={tch.id}>{tch.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <p className={`font-medium mb-2 ${muted}`}>Language</p>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectCls}>
                    <option value="">All languages</option>
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {savedItems.length > 0 && (
              <Card className={`p-6 ${panel}`}>
                <h3 className={`font-bold mb-3 ${text}`}>
                  {t("resources.saved", { defaultValue: "Saved" })} ({savedItems.length})
                </h3>
                <ul className="space-y-2">
                  {savedItems.slice(0, 4).map((r) => (
                    <li key={r.id} className={`text-sm ${muted} truncate`}>{r.title}</li>
                  ))}
                </ul>
              </Card>
            )}
          </aside>

          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${muted}`} />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("resources.searchPlaceholder", { defaultValue: "Search resources…" })}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border ${theme === "dark" ? "bg-[#112240] border-white/10 text-white" : "bg-white border-gray-200"}`}
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className={`rounded-xl border px-4 py-3 ${theme === "dark" ? "bg-[#112240] border-white/10 text-white" : "bg-white border-gray-200"}`}
              >
                <option value="recent">{t("resources.sortNewest", { defaultValue: "Most recent" })}</option>
                <option value="popular">{t("resources.sortPopular", { defaultValue: "Most popular" })}</option>
                <option value="downloads">Most downloaded</option>
              </select>
            </div>

            <p className={`mb-4 text-sm ${muted}`}>
              {resources.length} {t("resources.topBarResults", { defaultValue: "results" })}
            </p>

            {resources.length === 0 ? (
              <Card className={`p-12 text-center ${panel}`}>
                <FileText className="mx-auto mb-4 h-12 w-12 text-[#D4AF37]" />
                <p className={muted}>{t("resources.noResults", { defaultValue: "No resources match your filters." })}</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {resources.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <ResourceLearningCard
                      resource={r}
                      index={i}
                      isBookmarked={isBookmarked(r.id)}
                      onBookmark={() => {
                        toggle(r.id);
                        toast.info(isBookmarked(r.id) ? "Removed from saved" : "Saved to bookmarks");
                      }}
                      onDownload={() => void handleOpen(r)}
                      onView={() => void trackAction(r.id, "view")}
                      premiumCta={t("resources.premiumCta", { defaultValue: "Unlock" })}
                      freeCta={t("resources.freeButton", { defaultValue: "Open" })}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            <Card className={`mt-10 p-8 flex flex-col md:flex-row items-center justify-between gap-6 ${theme === "dark" ? "bg-gradient-to-r from-[#112240] to-[#0D1B2A]" : "bg-[#0D1B2A]"}`}>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{t("resources.ctaTitle")}</h3>
                <p className="text-gray-300 text-sm">{t("resources.ctaSubtitle")}</p>
              </div>
              <Link href="/pricing">
                <Button variant="gold" size="lg">
                  {t("resources.ctaButton")} <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
