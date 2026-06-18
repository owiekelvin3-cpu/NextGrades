"use client";

import { useEffect, useState } from "react";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { Search, Shield, BookOpen, Download, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useResourcesCatalog } from "@/hooks/useResourcesCatalog";
import { ResourcesFilterSidebar } from "@/components/resources/shared/ResourcesFilterSidebar";
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
import { supabase } from "@/lib/supabase/client";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const ui = getSubjectUi(subjectSlug);

  const catalog = useResourcesCatalog({
    subject: subjectSlug,
    classLevel: classLevel ?? "",
    semester: semester ?? "",
  });

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsLoggedIn(Boolean(data.session?.user));
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  const breadcrumbTail = className
    ? `${subjectName} › ${className}`
    : subjectName;

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

  return (
    <>
      <section className="relative overflow-hidden bg-[#0D1B2A] text-white">
        <MarketingHeroBlend src={ui.heroImage} alt="" variant="dark-full" priority sizes="100vw" opacity={0.8} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-site-nav sm:px-6 md:pt-28 lg:px-8">
          <p className="mb-2 text-sm text-gray-400">
            {t("resources.subjectPage.breadcrumbHome")} › {t("resources.subjectPage.breadcrumbResources")} ›{" "}
            {t("resources.subjectPage.breadcrumbMaterials")} › {breadcrumbTail}
          </p>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">{title}</h1>
              <p className="mb-8 max-w-xl text-gray-300">{heroDesc}</p>
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

      <section className={`${appShell.sectionSubtle} py-10`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <ResourcesFilterSidebar
                subjects={catalog.subjects}
                classes={catalog.classes}
                subjectSlug={subjectSlug}
                classLevel={catalog.classLevel}
                semester={catalog.semester}
                accessFilter={catalog.accessFilter}
                materialTypes={catalog.materialTypes}
                subjectCounts={catalog.subjectCounts}
                onSubjectChange={catalog.setSubjectSlug}
                onClassChange={catalog.setClassLevel}
                onSemesterChange={catalog.setSemester}
                onAccessChange={catalog.setAccessFilter}
                onMaterialTypesChange={catalog.setMaterialTypes}
                onReset={catalog.resetFilters}
                subjectLinkBase="/resources"
              />
            </div>

            <div className="space-y-6 lg:col-span-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-[#0D1B2A]">
                  {className
                    ? t("resources.subjectPage.classContent", { className })
                    : t("resources.subjectPage.allContent", { subject: subjectName })}
                </h2>
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={catalog.search}
                    onChange={(e) => catalog.setSearch(e.target.value)}
                    placeholder={t("resources.searchPlaceholder")}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm"
                  />
                </div>
              </div>

              {isLoggedIn && classLevel && (
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
                    <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
                      <p className="text-2xl font-bold text-[#0D1B2A]">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {catalog.loading ? (
                <LoadingBlock />
              ) : (
                <>
                  {isLoggedIn && <ResourcesChapterList chapters={catalog.chapters} />}
                  <ResourcesMaterialsTable resources={catalog.resources} onOpen={(r) => void catalog.openResource(r)} />
                  <ResourcesCtaBanner />
                  <ResourcesFeatureRow />
                </>
              )}
            </div>

            <div className="lg:col-span-3">
              <ResourcesRightSidebar resources={catalog.resources} showAccountPanels={isLoggedIn} />
            </div>
          </div>
          <ResourcesSupportBar />
        </div>
      </section>
    </>
  );
}
