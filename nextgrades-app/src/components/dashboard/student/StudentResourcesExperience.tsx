"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Star,
  Download,
  MoreHorizontal,
  FileText,
  Video,
  Headphones,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import type { Material } from "@/lib/api/client";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { useBookmarks } from "@/hooks/useBookmarks";
import { fetchStudentResourcesPageData, formatBytes } from "@/lib/dashboard/student-overview";
import { StudentDashboardLayout } from "./StudentDashboardLayout";
import { studentPanel, materialTypeLabel, materialTypeColor } from "./student-ui";
import { cn } from "@/lib/utils";

type Tab = "all" | "course" | "type" | "favorites";
const PAGE_SIZE = 8;

function MaterialIcon({ type }: { type: string }) {
  if (type === "video") return <Video className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

export function StudentResourcesExperience() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const { toggle, isBookmarked } = useBookmarks();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [enrollments, setEnrollments] = useState<{ subject_name?: string }[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchStudentResourcesPageData()
      .then((d) => {
        if (!d) return;
        setMaterials(d.materials);
        setEnrollments(d.enrollments);
      })
      .finally(() => setLoading(false));
  }, []);

  const title = t("studentDashboard.nav.materials");
  const description = t("studentDashboard.materialsDesc", {
    defaultValue: "Here you can find all materials for your courses.",
  });

  const subjectNames = useMemo(
    () => [...new Set(enrollments.map((e) => e.subject_name).filter(Boolean))] as string[],
    [enrollments]
  );

  const filtered = useMemo(() => {
    let list = materials;
    if (tab === "favorites") list = list.filter((m) => isBookmarked(m.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.title.toLowerCase().includes(q));
    }
    if (courseFilter) list = list.filter((m) => m.title.includes(courseFilter));
    if (typeFilter) list = list.filter((m) => m.type === typeFilter);
    return list;
  }, [materials, tab, search, courseFilter, typeFilter, isBookmarked]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const favoriteMaterials = materials.filter((m) => isBookmarked(m.id)).slice(0, 4);
  const totalBytes = materials.reduce((s, m) => s + (m.file_size ?? 0), 0);
  const storagePercent = totalBytes > 0 ? Math.min(100, Math.round((totalBytes / (5 * 1024 * 1024 * 1024)) * 100)) : 0;

  useEffect(() => setPage(1), [tab, search, courseFilter, typeFilter]);

  if (loading) {
    return (
      <StudentDashboardLayout title={title} description={description}>
        <LoadingBlock />
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout title={title} description={description}>
      <div className="mx-auto grid max-w-[1400px] gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-6 border-b border-gray-200">
            {(
              [
                ["all", t("studentDashboard.tabAllMaterials", { defaultValue: "All materials" })],
                ["course", t("studentDashboard.tabByCourse", { defaultValue: "By course" })],
                ["type", t("studentDashboard.tabByType", { defaultValue: "By type" })],
                ["favorites", t("studentDashboard.tabFavorites", { defaultValue: "Favorites" })],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "border-b-2 pb-3 text-sm font-medium transition",
                  tab === id ? "border-[#D4AF37] text-[#0D1B2A]" : "border-transparent text-gray-500"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("studentDashboard.searchMaterials", { defaultValue: "Search materials…" })}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("studentDashboard.filter", { defaultValue: "Filter" })}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
            >
              <option value="">{t("studentDashboard.selectCourse", { defaultValue: "Select course" })}</option>
              {subjectNames.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
            >
              <option value="">{t("studentDashboard.selectType", { defaultValue: "Select type" })}</option>
              {["pdf", "video", "excel", "image", "other"].map((tp) => (
                <option key={tp} value={tp}>
                  {materialTypeLabel(tp, t)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setCourseFilter("");
                setTypeFilter("");
                setSearch("");
              }}
              className="text-sm text-gray-500 hover:text-[#0D1B2A]"
            >
              {t("studentDashboard.resetFilters", { defaultValue: "Reset filters" })}
            </button>
          </div>

          <div className={studentPanel("overflow-hidden")}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#FAFBFC] text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">{t("studentDashboard.colMaterial", { defaultValue: "Material" })}</th>
                    <th className="px-5 py-3">{t("studentDashboard.colCourse", { defaultValue: "Course" })}</th>
                    <th className="px-5 py-3">{t("studentDashboard.colType", { defaultValue: "Type" })}</th>
                    <th className="px-5 py-3">{t("studentDashboard.colAdded", { defaultValue: "Added" })}</th>
                    <th className="px-5 py-3 text-right">{t("studentDashboard.colActions", { defaultValue: "Actions" })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                        {t("studentDashboard.noMaterials")}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", materialTypeColor(m.type))}>
                              <MaterialIcon type={m.type} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[#0D1B2A]">{m.title}</p>
                              <p className="text-xs text-gray-400">
                                {m.file_size ? formatBytes(m.file_size) : m.type}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">—</td>
                        <td className="px-5 py-4">
                          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", materialTypeColor(m.type))}>
                            {materialTypeLabel(m.type, t)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {m.created_at
                            ? new Date(m.created_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => toggle(m.id)}
                              className={cn(
                                "rounded-lg p-2 transition",
                                isBookmarked(m.id) ? "text-[#D4AF37]" : "text-gray-400 hover:text-[#D4AF37]"
                              )}
                              aria-label="Favorite"
                            >
                              <Star className={cn("h-4 w-4", isBookmarked(m.id) && "fill-current")} />
                            </button>
                            {m.url && (
                              <a
                                href={m.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg p-2 text-gray-400 hover:text-[#0D1B2A]"
                                aria-label="Download"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}
                            <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-gray-50" aria-label="More">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
                <p className="text-xs text-gray-500">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}{" "}
                  {t("studentDashboard.ofTotal", { total: filtered.length, defaultValue: `of ${filtered.length} materials` })}
                </p>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg p-1.5 text-gray-500 disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium",
                        page === p ? "bg-[#D4AF37] text-[#0D1B2A]" : "text-gray-500 hover:bg-gray-100"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg p-1.5 text-gray-500 disabled:opacity-40">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className={studentPanel("p-5 text-center")}>
            <h3 className="text-sm font-semibold text-[#0D1B2A]">
              {t("studentDashboard.storageSpace", { defaultValue: "Storage space" })}
            </h3>
            <div className="relative mx-auto my-4 flex h-24 w-24 items-center justify-center">
              <svg className="-rotate-90" width="96" height="96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - storagePercent / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-bold text-[#0D1B2A]">{storagePercent}%</span>
            </div>
            <p className="text-xs text-gray-500">
              {totalBytes > 0 ? `${formatBytes(totalBytes)} ${t("studentDashboard.storageUsed", { defaultValue: "used" })}` : t("studentDashboard.noMaterials")}
            </p>
            <Link href="/dashboard/student/settings" className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 py-2 text-sm font-medium text-[#0D1B2A] hover:bg-gray-50">
              {t("studentDashboard.manageStorage", { defaultValue: "Manage storage" })}
            </Link>
          </div>

          <div className={studentPanel("p-5")}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0D1B2A]">{t("studentDashboard.myFavorites", { defaultValue: "My favorites" })}</h3>
              <button type="button" onClick={() => setTab("favorites")} className="text-xs font-medium text-[#D4AF37]">
                {t("studentDashboard.showAll", { defaultValue: "Show all" })}
              </button>
            </div>
            {favoriteMaterials.length === 0 ? (
              <p className="text-xs text-gray-500">{t("studentDashboard.noFavorites", { defaultValue: "No favorites yet." })}</p>
            ) : (
              <ul className="space-y-3">
                {favoriteMaterials.map((m) => (
                  <li key={m.id} className="flex items-center gap-2">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", materialTypeColor(m.type))}>
                      <MaterialIcon type={m.type} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-[#0D1B2A]">{m.title}</p>
                      <p className="text-[10px] text-gray-400">{materialTypeLabel(m.type, t)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#FFF9E6] p-5">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/20">
              <Headphones className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-sm font-semibold text-[#0D1B2A]">{t("studentDashboard.materialNotFound", { defaultValue: "Material not found?" })}</h3>
            <p className="mt-1 text-xs text-gray-600">
              {t("studentDashboard.materialNotFoundDesc", { defaultValue: "If a material is missing, contact your teacher or our support team." })}
            </p>
            <Link href="/contact" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#D4AF37] hover:underline">
              {t("studentDashboard.goToSupport", { defaultValue: "Go to support" })}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </StudentDashboardLayout>
  );
}
