"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  Download,
  MoreHorizontal,
  FileText,
  Video,
  Headphones,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import type { Material } from "@/lib/api/client";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { useBookmarks } from "@/hooks/useBookmarks";
import { fetchStudentResourcesPageData, formatBytes } from "@/lib/dashboard/student-overview";
import { StudentDashboardLayout } from "./StudentDashboardLayout";
import { studentPanel, materialTypeLabel, materialTypeColor, st } from "./student-ui";
import { StudentTabBar } from "./StudentTabBar";
import { StudentPagination } from "./StudentPagination";
import { mobile } from "@/lib/mobile/tokens";
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
      <div className={st.pageGrid}>
        <div className={st.mainColumn}>
          <StudentTabBar
            tabs={[
              { id: "all", label: t("studentDashboard.tabAllMaterials", { defaultValue: "All materials" }), shortLabel: t("studentDashboard.tabAllShort", { defaultValue: "All" }) },
              { id: "course", label: t("studentDashboard.tabByCourse", { defaultValue: "By course" }), shortLabel: t("studentDashboard.tabCourseShort", { defaultValue: "Course" }) },
              { id: "type", label: t("studentDashboard.tabByType", { defaultValue: "By type" }), shortLabel: t("studentDashboard.tabTypeShort", { defaultValue: "Type" }) },
              { id: "favorites", label: t("studentDashboard.tabFavorites", { defaultValue: "Favorites" }), shortLabel: t("studentDashboard.tabFavShort", { defaultValue: "Favorites" }) },
            ]}
            active={tab}
            onChange={(id) => setTab(id as Tab)}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("studentDashboard.searchMaterials", { defaultValue: "Search materials…" })}
                className="w-full min-h-12 rounded-2xl border border-border-default bg-surface-elevated py-3 pl-12 pr-4 text-base outline-none focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[var(--brand-gold)]/25"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowMobileFilters((v) => !v)}
              className={cn(
                "flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border-default bg-surface-elevated px-4 text-sm font-medium md:hidden",
                showMobileFilters && "border-[var(--brand-gold)] text-[var(--brand-gold)]"
              )}
            >
              <Filter className="h-4 w-4" />
              {t("studentDashboard.filter", { defaultValue: "Filter" })}
            </button>
          </div>

          {showMobileFilters && (
            <div className="grid grid-cols-1 gap-2 rounded-2xl border border-border-default bg-surface-elevated p-3 sm:grid-cols-2 md:hidden">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full rounded-xl border border-border-default bg-surface-subtle px-3 py-2.5 text-sm"
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
                className="w-full rounded-xl border border-border-default bg-surface-subtle px-3 py-2.5 text-sm"
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
                className="col-span-full text-center text-sm text-text-muted hover:text-foreground"
              >
                {t("studentDashboard.resetFilters", { defaultValue: "Reset filters" })}
              </button>
            </div>
          )}

          <div className="hidden flex-wrap gap-3 md:flex">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="rounded-xl border border-border-default bg-surface-elevated px-3 py-2 text-sm text-text-muted"
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
              className="rounded-xl border border-border-default bg-surface-elevated px-3 py-2 text-sm text-text-muted"
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
              className="text-sm text-text-muted hover:text-foreground"
            >
              {t("studentDashboard.resetFilters", { defaultValue: "Reset filters" })}
            </button>
          </div>

          {/* Mobile card list */}
          <div className={cn(studentPanel("overflow-hidden md:hidden"), "space-y-0")}>
            <div className="space-y-3 p-3">
            {pageItems.length === 0 ? (
              <div className={studentPanel("p-8 text-center text-text-muted")}>
                {t("studentDashboard.noMaterials")}
              </div>
            ) : (
              pageItems.map((m) => (
                <article key={m.id} className={cn(mobile.cardInteractive, mobile.cardPad, "flex gap-4")}>
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", materialTypeColor(m.type))}>
                    <MaterialIcon type={m.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground line-clamp-2">{m.title}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {materialTypeLabel(m.type, t)} · {m.file_size ? formatBytes(m.file_size) : m.type}
                    </p>
                    {m.created_at && (
                      <p className="mt-1 text-xs text-text-muted">
                        {new Date(m.created_at).toLocaleDateString(locale)}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => toggle(m.id)}
                      className={cn(mobile.touchTarget, "flex items-center justify-center rounded-xl text-[#D4AF37]")}
                      aria-label="Favorite"
                    >
                      <Star className={cn("h-5 w-5", isBookmarked(m.id) && "fill-[#D4AF37]")} />
                    </button>
                    {m.url && (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(mobile.touchTarget, "flex items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]")}
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}
            </div>
            <StudentPagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              summaryLabel={`${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} ${t("studentDashboard.ofTotal", { total: filtered.length, defaultValue: `of ${filtered.length} materials` })}`}
            />
          </div>

          <div className={cn(studentPanel("overflow-hidden"), "hidden md:block")}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border-default bg-surface-subtle dark:bg-surface-elevated/[0.03] text-xs font-semibold uppercase tracking-wide text-text-muted">
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
                      <td colSpan={5} className="px-5 py-12 text-center text-text-muted">
                        {t("studentDashboard.noMaterials")}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((m) => (
                      <tr key={m.id} className="hover:bg-surface-subtle dark:bg-white/[0.04]/50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", materialTypeColor(m.type))}>
                              <MaterialIcon type={m.type} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{m.title}</p>
                              <p className="text-xs text-text-muted/80">
                                {m.file_size ? formatBytes(m.file_size) : m.type}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-text-muted">—</td>
                        <td className="px-5 py-4">
                          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", materialTypeColor(m.type))}>
                            {materialTypeLabel(m.type, t)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-text-muted">
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
                                isBookmarked(m.id) ? "text-[#D4AF37]" : "text-text-muted/80 hover:text-[#D4AF37]"
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
                                className="rounded-lg p-2 text-text-muted/80 hover:text-foreground"
                                aria-label="Download"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}
                            <button type="button" className="rounded-lg p-2 text-text-muted/80 hover:bg-surface-subtle dark:bg-white/[0.04]" aria-label="More">
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
              <StudentPagination
                page={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                summaryLabel={`${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} ${t("studentDashboard.ofTotal", { total: filtered.length, defaultValue: `of ${filtered.length} materials` })}`}
              />
            )}
          </div>
        </div>

        <aside className={st.asideWidgets}>
          <div className={studentPanel("p-5 text-center")}>
            <h3 className="text-sm font-semibold text-foreground">
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
              <span className="absolute text-sm font-bold text-foreground">{storagePercent}%</span>
            </div>
            <p className="text-xs text-text-muted">
              {totalBytes > 0 ? `${formatBytes(totalBytes)} ${t("studentDashboard.storageUsed", { defaultValue: "used" })}` : t("studentDashboard.noMaterials")}
            </p>
            <Link href="/dashboard/student/settings" className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-border-default py-2 text-sm font-medium text-foreground hover:bg-surface-subtle dark:bg-white/[0.04]">
              {t("studentDashboard.manageStorage", { defaultValue: "Manage storage" })}
            </Link>
          </div>

          <div className={studentPanel("p-5")}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{t("studentDashboard.myFavorites", { defaultValue: "My favorites" })}</h3>
              <button type="button" onClick={() => setTab("favorites")} className="text-xs font-medium text-[#D4AF37]">
                {t("studentDashboard.showAll", { defaultValue: "Show all" })}
              </button>
            </div>
            {favoriteMaterials.length === 0 ? (
              <p className="text-xs text-text-muted">{t("studentDashboard.noFavorites", { defaultValue: "No favorites yet." })}</p>
            ) : (
              <ul className="space-y-3">
                {favoriteMaterials.map((m) => (
                  <li key={m.id} className="flex items-center gap-2">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", materialTypeColor(m.type))}>
                      <MaterialIcon type={m.type} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">{m.title}</p>
                      <p className="text-[10px] text-text-muted/80">{materialTypeLabel(m.type, t)}</p>
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
            <h3 className="text-sm font-semibold text-foreground">{t("studentDashboard.materialNotFound", { defaultValue: "Material not found?" })}</h3>
            <p className="mt-1 text-xs text-text-muted">
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
