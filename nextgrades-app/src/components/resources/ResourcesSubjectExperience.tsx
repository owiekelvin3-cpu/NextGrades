"use client";

import { useState } from "react";
import { MarketingImage } from "@/components/marketing/MarketingImage";
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
    ? `${subjectName} – ${className}${semester ? ` · Semester ${semester}` : ""}`
    : subjectName;

  return (
    <>
      <section className="relative overflow-hidden bg-[#0D1B2A] text-white">
        <div className="absolute inset-0 opacity-30">
          <MarketingImage src={ui.heroImage} alt="" containerClassName="absolute inset-0" className="object-cover" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/90 to-[#0D1B2A]/60" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-site-nav sm:px-6 md:pt-28 lg:px-8">
          <p className="text-sm text-gray-400 mb-2">
            Home › Resources › {className ? "Learning materials" : subjectName} › {title}
          </p>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
              <p className="text-gray-300 mb-8 max-w-xl">
                Structured learning materials, worksheets, videos and guides — tailored to your grade and semester.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: BookOpen, label: "Age-appropriate" },
                  { icon: Shield, label: "Protected" },
                  { icon: Star, label: "Structured" },
                  { icon: Download, label: "Downloadable" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <p className="text-xs font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block relative h-64">
              <MarketingImage src={ui.heroImage} alt={subjectName} containerClassName="absolute inset-0 rounded-2xl" className="object-cover object-right rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      <ResourcesCategoryTabs active={activeTab} onChange={handleTabChange} />

      <section className={`${appShell.sectionSubtle} py-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8">
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

            <div className="lg:col-span-6 space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-[#0D1B2A]">
                  {className ? `${className} content` : `All content – ${subjectName}`}
                </h2>
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={catalog.search}
                    onChange={(e) => catalog.setSearch(e.target.value)}
                    placeholder={t("resources.searchPlaceholder", { defaultValue: "Search…" })}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm"
                  />
                </div>
              </div>

              {classLevel && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Chapters", value: catalog.chapters.length },
                    { label: "Materials", value: catalog.resources.length },
                    { label: "Exercises", value: catalog.resources.filter((r) => (r.content_type || "").includes("practice")).length },
                    { label: "Videos", value: catalog.resources.filter((r) => (r.content_type || "").includes("video")).length },
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
                  <ResourcesChapterList chapters={catalog.chapters} />
                  <ResourcesMaterialsTable resources={catalog.resources} onOpen={(r) => void catalog.openResource(r)} />
                  <ResourcesCtaBanner />
                  <ResourcesFeatureRow />
                </>
              )}
            </div>

            <div className="lg:col-span-3">
              <ResourcesRightSidebar resources={catalog.resources} />
            </div>
          </div>
          <ResourcesSupportBar />
        </div>
      </section>
    </>
  );
}
