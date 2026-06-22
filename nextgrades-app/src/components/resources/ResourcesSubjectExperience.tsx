"use client";

import { useState } from "react";
import Link from "next/link";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { Search, Shield, BookOpen, Download, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useResourcesCatalog } from "@/hooks/useResourcesCatalog";
import { useResourceMemberAccess } from "@/hooks/useResourceMemberAccess";
import { ResourcesCategoryTabs } from "@/components/resources/shared/ResourcesCategoryTabs";
import {
  ResourcesChapterList,
  ResourcesMaterialsTable,
  ResourcesRightSidebar,
  ResourcesSupportBar,
} from "@/components/resources/shared/ResourcesSubjectPanels";
import { ResourcesCtaBanner, ResourcesFeatureRow } from "@/components/resources/shared/ResourceCards";
import { tabContentTypes, getSubjectUi, type ResourceTabId } from "@/lib/resources/ui-config";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { appShell } from "@/lib/theme/shell";
import { theme as th } from "@/lib/theme/tokens";
import { hero, section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

type Props = {
  subjectSlug: string;
  subjectName: string;
  classLevel?: string;
  className?: string;
  semester?: string;
};

export function ResourcesSubjectExperience({ subjectSlug, subjectName, classLevel, className, semester }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ResourceTabId>("all");
  const { loggedIn, hasMemberAccess } = useResourceMemberAccess();
  const ui = getSubjectUi(subjectSlug);

  const catalog = useResourcesCatalog({
    subject: subjectSlug,
    classLevel: classLevel ?? "",
    semester: semester ?? "",
  });

  const handleTabChange = (tab: ResourceTabId) => {
    setActiveTab(tab);
    catalog.setContentTypes(tabContentTypes(tab) ?? []);
  };

  const title = className
    ? `${subjectName} – ${className}${semester ? ` · ${semester}. Semester` : ""}`
    : subjectName;

  const semesterInfo = semester ? t("resources.subjectPage.heroDescSemester", { semester }) : "";
  const classInfo = className
    ? t("resources.subjectPage.heroDescClassInfo", { className, semesterInfo })
    : "";
  const heroDesc = t("resources.subjectPage.heroDesc", { subject: subjectName, classInfo });

  const breadcrumbTail = className ? `${subjectName} › ${className}` : subjectName;

  const heroBenefits = [
    { icon: BookOpen, label: t("resources.subjectPage.benefitAgeAppropriate") },
    { icon: Shield, label: t("resources.subjectPage.benefitProtected") },
    { icon: Star, label: t("resources.subjectPage.benefitStructured") },
    { icon: Download, label: t("resources.subjectPage.benefitDownloadable") },
  ];

  const statLabels = {
    chapters: t("resources.subjectPage.statChapters"),
    materials: t("resources.subjectPage.statMaterials"),
    exercises: t("resources.subjectPage.statExercises"),
    videos: t("resources.subjectPage.statVideos"),
  };

  const accessOptions: { value: "all" | "free" | "premium"; label: string }[] = [
    { value: "all", label: t("resources.accessAll") },
    { value: "free", label: t("resources.accessFree") },
    { value: "premium", label: t("resources.accessPremium") },
  ];

  return (
    <>
      <section className={cn("bg-[#0D1B2A] text-white", hero.section)}>
        <MarketingHeroBlend src={ui.heroImage} alt="" variant="dark-full" priority sizes="100vw" opacity={0.8} />
        <div className={hero.inner}>
          <p className="mb-2 text-sm text-gray-400">
            {t("resources.subjectPage.breadcrumbHome")} › {t("resources.subjectPage.breadcrumbResources")} ›{" "}
            {t("resources.subjectPage.breadcrumbMaterials")} › {breadcrumbTail}
          </p>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">{title}</h1>
              <p className="mb-4 max-w-xl text-gray-300">{heroDesc}</p>
              <p className="mb-8 text-sm font-medium text-[#D4AF37]">500+ Lernmaterialien</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {heroBenefits.map(({ icon: Icon, label }) => (
                  <div key={label} className="text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <p className="text-xs font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden min-h-[240px] lg:block" aria-hidden />
          </div>
        </div>
      </section>

      <ResourcesCategoryTabs active={activeTab} onChange={handleTabChange} />

      <section className={`${appShell.sectionSubtle} py-8 md:py-10`}>
        <div className={`${section.container} space-y-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {className
                  ? t("resources.subjectPage.classContent", { className })
                  : t("resources.subjectPage.allContent", { subject: subjectName })}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{t("resources.topBarResults")}: {catalog.resources.length}</p>
            </div>
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                type="search"
                value={catalog.search}
                onChange={(e) => catalog.setSearch(e.target.value)}
                placeholder={t("resources.searchPlaceholder")}
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-background)] py-2.5 pl-10 pr-4 text-sm text-[var(--input-foreground)] outline-none focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[var(--brand-gold-ring)]"
              />
            </div>
          </div>

          {catalog.classes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => catalog.setClassLevel("")}
                className={cn(
                  "btn-pill",
                  !catalog.classLevel ? th.btnPillActive : th.btnPillOutline
                )}
              >
                {t("resources.allClasses")}
              </button>
              {catalog.classes.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/resources/${subjectSlug}/${cls.level}`}
                  className={cn(
                    "btn-pill",
                    String(cls.level) === catalog.classLevel ? th.btnPillActive : th.btnPillOutline
                  )}
                >
                  {cls.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {accessOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => catalog.setAccessFilter(option.value)}
                className={cn(
                  "btn-pill",
                  catalog.accessFilter === option.value ? th.btnPillOutlineActive : th.btnPillOutline
                )}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={catalog.resetFilters}
              className="ml-auto text-sm font-medium text-[#D4AF37] hover:underline"
            >
              {t("resources.resetFilters")}
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8 xl:col-span-9">
              {hasMemberAccess && classLevel && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: statLabels.chapters, value: catalog.chapters.length },
                    { label: statLabels.materials, value: catalog.resources.length },
                    {
                      label: statLabels.exercises,
                      value: catalog.resources.filter((r) => (r.content_type || "").includes("practice")).length,
                    },
                    {
                      label: statLabels.videos,
                      value: catalog.resources.filter((r) => (r.content_type || "").includes("video")).length,
                    },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-[var(--border-default)] bg-[var(--card-background)] p-4 text-center shadow-sm">
                      <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
                      <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {catalog.loading ? (
                <LoadingBlock />
              ) : (
                <>
                  {hasMemberAccess && <ResourcesChapterList chapters={catalog.chapters} />}
                  <ResourcesMaterialsTable resources={catalog.resources} onOpen={(r) => void catalog.openResource(r)} />
                  <ResourcesCtaBanner />
                  <ResourcesFeatureRow />
                </>
              )}
            </div>

            <div className="lg:col-span-4 xl:col-span-3">
              <ResourcesRightSidebar
                resources={catalog.resources}
                showAccountPanels={hasMemberAccess}
                loggedIn={loggedIn}
              />
            </div>
          </div>

          <ResourcesSupportBar />
        </div>
      </section>
    </>
  );
}
