"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getSubjectUi } from "@/lib/resources/ui-config";
import { getResourcesSubjectImage } from "@/lib/resources/images";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { RESOURCES_DEFAULT_THUMBNAIL } from "@/lib/resources/images";

type Subject = { id: string; name: string; slug?: string | null };

type Props = {
  subjects: Subject[];
  subjectCounts?: Map<string, number>;
  className?: string;
};

export function SubjectBrowseGrid({ subjects, subjectCounts, className }: Props) {
  const { t } = useTranslation();

  if (subjects.length === 0) return null;

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
          {t("resources.browseBySubject")}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t("resources.browseBySubjectDesc")}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-4">
        {subjects.map((s, index) => {
          const slug = s.slug || s.id;
          const ui = getSubjectUi(slug);
          const Icon = ui.icon;
          const count = subjectCounts?.get(slug) ?? 0;
          const imageUrl = getResourcesSubjectImage(slug, index);

          return (
            <Link
              key={s.id}
              href={`/resources/${slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--card-background)] shadow-sm transition hover:border-[var(--brand-gold)]/30 hover:shadow-md"
            >
              <div className="relative h-24 overflow-hidden bg-[var(--surface-subtle)] sm:h-28">
                <MarketingImage
                  src={imageUrl}
                  fallbackSrc={RESOURCES_DEFAULT_THUMBNAIL}
                  alt=""
                  containerClassName="h-full w-full"
                  className="transition duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-navy)]/70 to-transparent" />
                <div
                  className="absolute bottom-2 left-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-gold)] shadow-md"
                  style={{ color: "var(--brand-navy)" }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <h3 className="text-sm font-bold text-[var(--foreground)] sm:text-base">{s.name}</h3>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {count > 0
                    ? t("resources.materialsCount", { count })
                    : t("resources.exploreSubjectMaterials")}
                </p>
                <span
                  className="mt-2 inline-flex items-center gap-0.5 text-xs font-semibold sm:mt-3 sm:text-sm"
                  style={{ color: ui.color }}
                >
                  {t("resources.exploreSubject")}
                  <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
