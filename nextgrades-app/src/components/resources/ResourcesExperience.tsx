"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useToast } from "@/context/ToastContext";
import { TAB_TO_CATEGORY, type ResourceAccess } from "@/lib/resources/catalog";
import {
  Search,
  Filter,
  Star,
  Bookmark,
  BookmarkCheck,
  Download,
  Lock,
  Calendar,
  Bell,
  ChevronRight,
  X,
  FileText,
} from "lucide-react";

type PublicResource = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  thumbnail_url: string | null;
  access_type: string;
  is_premium: boolean;
  download_count: number | null;
  created_at: string;
  category?: { id: string; name: string } | null;
  subject?: { id: string; name: string } | null;
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop",
];

function resourceAccess(r: PublicResource): ResourceAccess {
  return r.access_type === "premium" || r.is_premium ? "premium" : "free";
}

export function ResourcesExperience() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const { toggle, isBookmarked, bookmarks } = useBookmarks();

  const tabLabels = useLocalizedContent<string[]>("resourcesPage.tabs");
  const grades = useLocalizedContent<string[]>("resourcesPage.gradesFilter");
  const semesters = useLocalizedContent<string[]>("resourcesPage.semestersFilter");
  const materialTypes = useLocalizedContent<string[]>("resourcesPage.materialTypes");

  const [resources, setResources] = useState<PublicResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState(0);
  const [grade, setGrade] = useState(0);
  const [semester, setSemester] = useState(0);
  const [accessFilter, setAccessFilter] = useState<"all" | ResourceAccess>("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sort, setSort] = useState<"newest" | "popular" | "title">("newest");
  const [showReminder, setShowReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("16:00");

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resources/public?limit=100");
      if (res.ok) {
        setResources(await res.json());
      } else {
        setResources([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const filtered = useMemo(() => {
    const category = TAB_TO_CATEGORY[activeTab] ?? "all";
    const subjectName = subject === 0 ? null : grades[subject] ?? null;
    const q = search.trim().toLowerCase();

    let list = resources.filter((r) => {
      const access = resourceAccess(r);
      const catName = (r.category?.name || "").toLowerCase();
      if (category !== "all" && !catName.includes(category) && category !== "materials") return false;
      if (accessFilter !== "all" && access !== accessFilter) return false;
      if (subjectName && r.subject?.name && r.subject.name !== subjectName) return false;
      if (selectedTypes.length && !selectedTypes.some((ty) => r.type.toLowerCase().includes(ty.toLowerCase()))) return false;
      if (q && !`${r.title} ${r.description || ""} ${r.subject?.name || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sort === "popular") list = [...list].sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0));
    if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [activeTab, search, subject, accessFilter, selectedTypes, sort, grades, resources]);

  const savedItems = useMemo(() => resources.filter((r) => bookmarks.includes(r.id)), [bookmarks, resources]);

  const resetFilters = () => {
    setSubject(0);
    setGrade(0);
    setSemester(0);
    setAccessFilter("all");
    setSelectedTypes([]);
    setSearch("");
    setActiveTab(0);
  };

  const handleDownload = (resource: PublicResource) => {
    const access = resourceAccess(resource);
    if (access === "premium") {
      toast.info(t("resources.premiumRequired", { defaultValue: "Premium membership required — view pricing." }));
      return;
    }
    if (resource.url) {
      window.open(resource.url, "_blank", "noopener,noreferrer");
      toast.success(t("resources.downloadStarted", { defaultValue: `Opening "${resource.title}"…` }));
    }
  };

  const text = theme === "dark" ? "text-white" : "text-[#0D1B2A]";
  const muted = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const panel = theme === "dark" ? "bg-[#112240] border-white/10" : "bg-white border-gray-200";
  const safeTabLabels = Array.isArray(tabLabels) ? tabLabels : [];
  const safeGrades = Array.isArray(grades) ? grades : [];
  const safeSemesters = Array.isArray(semesters) ? semesters : [];
  const safeMaterialTypes = Array.isArray(materialTypes) ? materialTypes : [];

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <LoadingBlock />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={`py-4 border-b sticky top-20 z-30 backdrop-blur-lg ${theme === "dark" ? "bg-[#0D1B2A]/95 border-white/10" : "bg-white/95 border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-1">
            {safeTabLabels.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === i
                    ? "bg-[#D4AF37] text-[#0D1B2A]"
                    : theme === "dark"
                      ? "bg-white/10 text-gray-300 hover:bg-white/15"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              <Card className={`p-6 ${panel}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold flex items-center gap-2 ${text}`}>
                    <Filter className="w-4 h-4 text-[#D4AF37]" />
                    {t("resources.filters.title")}
                  </h3>
                  <button type="button" onClick={resetFilters} className="text-xs text-[#D4AF37] hover:underline">
                    {t("resources.filters.reset")}
                  </button>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className={`font-medium mb-2 ${muted}`}>{t("resources.filters.access")}</p>
                    {(["all", "free", "premium"] as const).map((a) => (
                      <label key={a} className={`flex items-center gap-2 mb-2 cursor-pointer ${muted}`}>
                        <input
                          type="radio"
                          name="access"
                          checked={accessFilter === a}
                          onChange={() => setAccessFilter(a)}
                          className="accent-[#D4AF37]"
                        />
                        {a === "all"
                          ? t("resources.filters.accessAll")
                          : a === "free"
                            ? t("resources.filters.accessFree")
                            : t("resources.filters.accessPremium")}
                      </label>
                    ))}
                  </div>
                  <div>
                    <p className={`font-medium mb-2 ${muted}`}>{t("resources.filters.subject")}</p>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(Number(e.target.value))}
                      className={`w-full rounded-lg border px-3 py-2 ${theme === "dark" ? "bg-[#0D1B2A] border-white/15 text-white" : "bg-white border-gray-200"}`}
                    >
                      {safeGrades.map((g, i) => (
                        <option key={g} value={i}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  {safeMaterialTypes.map((type) => (
                    <label key={type} className={`flex items-center gap-2 cursor-pointer ${muted}`}>
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() =>
                          setSelectedTypes((prev) =>
                            prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type]
                          )
                        }
                        className="accent-[#D4AF37] rounded"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </Card>

              {savedItems.length > 0 && (
                <Card className={`p-6 ${panel}`}>
                  <h3 className={`font-bold mb-3 ${text}`}>
                    {t("resources.saved", { defaultValue: "Saved" })} ({savedItems.length})
                  </h3>
                  <ul className="space-y-2">
                    {savedItems.slice(0, 4).map((r) => (
                      <li key={r.id} className={`text-sm ${muted} truncate`}>
                        {r.title}
                      </li>
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
                    placeholder={t("resources.searchPlaceholder")}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border ${theme === "dark" ? "bg-[#112240] border-white/10 text-white" : "bg-white border-gray-200"}`}
                  />
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className={`rounded-xl border px-4 py-3 ${theme === "dark" ? "bg-[#112240] border-white/10 text-white" : "bg-white border-gray-200"}`}
                >
                  <option value="newest">{t("resources.sortNewest")}</option>
                  <option value="popular">{t("resources.sortPopular", { defaultValue: "Most popular" })}</option>
                  <option value="title">A–Z</option>
                </select>
              </div>

              <p className={`mb-4 text-sm ${muted}`}>
                {filtered.length} {t("resources.topBarResults", { defaultValue: "results" })}
              </p>

              {filtered.length === 0 ? (
                <Card className={`p-12 text-center ${panel}`}>
                  <FileText className="mx-auto mb-4 h-12 w-12 text-[#D4AF37]" />
                  <p className={muted}>{t("resources.noResults", { defaultValue: "No resources match your filters." })}</p>
                  <Button variant="gold" className="mt-4" href="/login?redirect=/resources">
                    {t("resources.signInForMore", { defaultValue: "Sign in for more resources" })}
                  </Button>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {filtered.map((r, i) => {
                    const access = resourceAccess(r);
                    const image = r.thumbnail_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Card className={`overflow-hidden h-full flex flex-col ${panel}`}>
                          <div className="h-40 relative bg-gray-100">
                            {r.thumbnail_url ? (
                              <img src={image} alt={r.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-[#0D1B2A]/5">
                                <FileText className="h-12 w-12 text-[#D4AF37]" />
                              </div>
                            )}
                            <Badge
                              className={`absolute top-3 left-3 ${access === "premium" ? "bg-[#D4AF37] text-[#0D1B2A]" : "bg-[#22C55E] text-white"}`}
                            >
                              {r.type.toUpperCase()}
                            </Badge>
                            <button
                              type="button"
                              onClick={() => {
                                toggle(r.id);
                                toast.info(
                                  isBookmarked(r.id)
                                    ? t("resources.removedBookmark", { defaultValue: "Removed from saved" })
                                    : t("resources.addedBookmark", { defaultValue: "Saved to bookmarks" })
                                );
                              }}
                              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
                            >
                              {isBookmarked(r.id) ? (
                                <BookmarkCheck className="w-5 h-5 text-[#D4AF37]" />
                              ) : (
                                <Bookmark className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <p className="text-xs text-[#D4AF37] font-semibold mb-1">
                              {r.subject?.name || r.category?.name || "Resource"}
                            </p>
                            <h3 className={`font-bold mb-2 ${text}`}>{r.title}</h3>
                            <p className={`text-sm mb-4 flex-1 ${muted}`}>{r.description || "—"}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs flex items-center gap-1 ${muted}`}>
                                <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                                {r.download_count ?? 0} downloads
                              </span>
                              {access === "premium" ? (
                                <Link href="/pricing">
                                  <Button variant="gold" size="sm">
                                    <Lock className="w-4 h-4 mr-1" />
                                    {t("resources.premiumCta", { defaultValue: "Unlock" })}
                                  </Button>
                                </Link>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => handleDownload(r)}>
                                  <Download className="w-4 h-4 mr-1" />
                                  {t("resources.freeButton", { defaultValue: "Download" })}
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
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
    </>
  );
}
