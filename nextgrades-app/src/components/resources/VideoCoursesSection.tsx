"use client";

import { useMemo, useState } from "react";
import { Film } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LearningResource } from "@/components/resources/ResourceLearningCard";
import type { CatalogSubject } from "@/hooks/useResourcesCatalog";
import { VideoCourseCard } from "@/components/resources/VideoCourseCard";
import { isVideoCourseResource } from "@/lib/resources/video";
import { cn } from "@/lib/utils";

type Props = {
  resources: LearningResource[];
  subjects: CatalogSubject[];
  libraryLocked?: boolean;
  onOpen: (resource: LearningResource) => void;
};

export function VideoCoursesSection({ resources, subjects, libraryLocked = false, onOpen }: Props) {
  const { t } = useTranslation();
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const videoCourses = useMemo(
    () => resources.filter(isVideoCourseResource),
    [resources]
  );

  const subjectFilters = useMemo(() => {
    const slugSet = new Set<string>();
    for (const course of videoCourses) {
      const slug = course.subject?.slug || course.subject?.name?.toLowerCase().replace(/\s+/g, "-");
      if (slug) slugSet.add(slug);
    }
    return subjects.filter((s) => slugSet.has(s.slug || s.id));
  }, [videoCourses, subjects]);

  const filtered = useMemo(() => {
    if (subjectFilter === "all") return videoCourses;
    return videoCourses.filter((r) => {
      const slug = r.subject?.slug || r.subject?.name?.toLowerCase().replace(/\s+/g, "-") || "";
      return slug === subjectFilter;
    });
  }, [videoCourses, subjectFilter]);

  if (videoCourses.length === 0) return null;

  return (
    <section id="video-courses" className="scroll-mt-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0D1B2A] text-[#D4AF37] shadow-sm">
            <Film className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D4AF37]">
              {t("resources.videoCourses.eyebrow", { defaultValue: "Video learning" })}
            </p>
            <h2 className="text-2xl font-bold text-[var(--foreground)] md:text-3xl">
              {t("resources.videoCourses.title", { defaultValue: "Video Courses" })}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
              {t("resources.videoCourses.subtitle", {
                defaultValue: "Structured video courses across all subjects — watch inline in the library.",
              })}
            </p>
          </div>
        </div>
        <p className="text-sm font-medium text-[var(--text-muted)]">
          {t("resources.videoCourses.count", {
            count: filtered.length,
            defaultValue: "{{count}} courses",
          })}
        </p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setSubjectFilter("all")}
          className={cn(
            "shrink-0 touch-manipulation rounded-full px-4 py-2 text-sm font-semibold transition",
            subjectFilter === "all"
              ? "bg-[#0D1B2A] text-white shadow-sm"
              : "bg-[var(--surface-elevated)] text-[var(--foreground)] ring-1 ring-[var(--border-default)] hover:ring-[#D4AF37]/40"
          )}
        >
          {t("resources.all", { defaultValue: "All" })}
        </button>
        {subjectFilters.map((s) => {
          const slug = s.slug || s.id;
          const active = subjectFilter === slug;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSubjectFilter(active ? "all" : slug)}
              className={cn(
                "shrink-0 touch-manipulation rounded-full px-4 py-2 text-sm font-semibold transition",
                active
                  ? "bg-[#0D1B2A] text-white shadow-sm"
                  : "bg-[var(--surface-elevated)] text-[var(--foreground)] ring-1 ring-[var(--border-default)] hover:ring-[#D4AF37]/40"
              )}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((resource) => (
          <VideoCourseCard
            key={resource.id}
            resource={resource}
            libraryLocked={libraryLocked}
            onOpen={() => onOpen(resource)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-elevated)] px-6 py-10 text-center text-sm text-[var(--text-muted)]">
          {t("resources.videoCourses.emptyFilter", {
            defaultValue: "No video courses for this subject yet.",
          })}
        </p>
      )}
    </section>
  );
}
