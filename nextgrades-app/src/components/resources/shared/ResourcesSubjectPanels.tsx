"use client";

import Link from "next/link";
import { ChevronRight, Download, Lock, Play, HelpCircle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { contentTypeLabel } from "@/lib/resources/constants";
import type { LearningResource } from "@/components/resources/ResourceLearningCard";
import { isFreeResource, isPremiumResource } from "@/lib/resources/ui-config";

type SidebarProps = {
  resources: LearningResource[];
  showAccountPanels?: boolean;
  loggedIn?: boolean;
};

export function ResourcesRightSidebar({ resources, showAccountPanels = false, loggedIn = false }: SidebarProps) {
  const { t } = useTranslation();
  const total = resources.length;
  const freeCount = resources.filter(isFreeResource).length;
  const premiumCount = resources.filter(isPremiumResource).length;
  const unlockItems = t("resources.subjectPage.unlockItems", { returnObjects: true }) as string[];

  return (
    <aside className="space-y-5">
      {showAccountPanels && total > 0 && (
        <div className="rounded-2xl bg-[#0D1B2A] p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">
            {t("resources.sidebar.catalogTitle")}
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center justify-between gap-3">
              <span className="text-gray-400">{t("resources.sidebar.totalMaterials")}</span>
              <span className="font-semibold">{total}</span>
            </li>
            {freeCount > 0 && (
              <li className="flex items-center justify-between gap-3">
                <span className="text-gray-400">{t("resources.free")}</span>
                <span className="font-semibold text-[#22C55E]">{freeCount}</span>
              </li>
            )}
            {premiumCount > 0 && (
              <li className="flex items-center justify-between gap-3">
                <span className="text-gray-400">{t("resources.premium")}</span>
                <span className="font-semibold text-[#D4AF37]">{premiumCount}</span>
              </li>
            )}
          </ul>
          <Link
            href={loggedIn ? "/dashboard/student/resources" : "/login"}
            className="mt-4 block text-center text-xs font-semibold text-[#D4AF37] hover:underline"
          >
            {t("resources.sidebar.signInForProgress")} →
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <Lock className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="font-bold text-[#0D1B2A]">{t("resources.subjectPage.unlockTitle")}</h3>
        <p className="mt-2 text-xs text-gray-600">{t("resources.subjectPage.unlockDesc")}</p>
        <ul className="mt-3 space-y-2 text-xs text-gray-600">
          {(Array.isArray(unlockItems) ? unlockItems : []).map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-[#D4AF37]">✓</span> {item}
            </li>
          ))}
        </ul>
        <Link
          href="/resources/upgrade"
          className="mt-4 block rounded-xl bg-[#D4AF37] px-4 py-2.5 text-center text-sm font-bold text-[#0D1B2A]"
        >
          {t("resources.upgrade.unlockCta")}
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
          <Sparkles className="h-4 w-4 text-amber-500" />
        </div>
        <h3 className="text-sm font-bold text-[#0D1B2A]">{t("resources.subjectPage.tipTitle")}</h3>
        <p className="mt-2 text-xs text-gray-500">{t("resources.subjectPage.tipBody")}</p>
        <Link href="/help" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37]">
          {t("resources.subjectPage.tipLink")} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}

export function ResourcesChapterList({
  chapters,
}: {
  chapters: { name: string; count: number; description?: string }[];
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-[#0D1B2A]">{t("resources.subjectPage.chapterOverview")}</h2>
      <ul className="divide-y divide-gray-100">
        {chapters.slice(0, 8).map((ch, i) => (
          <li key={ch.name} className="flex items-center gap-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-sm font-bold text-purple-600">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#0D1B2A]">{ch.name}</p>
              <p className="text-xs text-gray-500">
                {t("resources.subjectPage.materialsInChapter", { count: ch.count })}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
              {t("resources.subjectPage.itemCount", { count: ch.count })}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResourcesMaterialsTable({
  resources,
  onOpen,
}: {
  resources: LearningResource[];
  onOpen: (r: LearningResource) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-bold text-[#0D1B2A]">{t("resources.subjectPage.latestMaterials")}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3 font-semibold">{t("resources.subjectPage.colTitle")}</th>
              <th className="px-3 py-3 font-semibold">{t("resources.subjectPage.colType")}</th>
              <th className="hidden px-3 py-3 font-semibold md:table-cell">{t("resources.subjectPage.colChapter")}</th>
              <th className="hidden px-3 py-3 font-semibold lg:table-cell">{t("resources.subjectPage.colGrade")}</th>
              <th className="hidden px-3 py-3 font-semibold lg:table-cell">{t("resources.subjectPage.colAccess")}</th>
              <th className="px-5 py-3 text-right font-semibold">{t("resources.subjectPage.colAction")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {resources.slice(0, 10).map((r) => {
              const locked = r.locked ?? (r.is_premium && !r.canAccess);
              const isVideo = (r.content_type || "").includes("video");
              return (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <p className="line-clamp-1 font-medium text-[#0D1B2A]">{r.title}</p>
                    <p className="line-clamp-1 text-xs text-gray-400">{r.short_description}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {contentTypeLabel(r.content_type || r.type || "resource")}
                    </span>
                  </td>
                  <td className="hidden px-3 py-3 text-gray-500 md:table-cell">{r.category?.name || "—"}</td>
                  <td className="hidden px-3 py-3 text-gray-500 lg:table-cell">{r.class?.name || "—"}</td>
                  <td className="hidden px-3 py-3 lg:table-cell">
                    {locked ? (
                      <span className="text-xs font-semibold text-[#D4AF37]">{t("resources.premium")}</span>
                    ) : (
                      <span className="text-xs font-semibold text-[#22C55E]">{t("resources.free")}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onOpen(r)}
                      className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37] sm:px-3"
                    >
                      {locked ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : isVideo ? (
                        <Play className="h-3.5 w-3.5" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">
                        {locked
                          ? t("resources.premium")
                          : isVideo
                            ? t("resources.subjectPage.watch")
                            : t("resources.subjectPage.download")}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {resources.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-gray-500">{t("resources.noResults")}</p>
      )}
    </div>
  );
}

export function ResourcesSupportBar() {
  const { t } = useTranslation();

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-5 sm:flex-row">
      <div className="flex items-center gap-3">
        <HelpCircle className="h-5 w-5 text-[#D4AF37]" />
        <p className="text-sm text-gray-600">{t("resources.subjectPage.supportPrompt")}</p>
      </div>
      <Link
        href="/contact"
        className="rounded-xl border-2 border-[#D4AF37] px-5 py-2 text-sm font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/5"
      >
        {t("common.contact")}
      </Link>
    </div>
  );
}
