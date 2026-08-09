"use client";

import Link from "next/link";
import { Lock, Play, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { getResourceThumbnail, RESOURCES_DEFAULT_THUMBNAIL } from "@/lib/resources/images";
import { resourceIsLocked } from "@/lib/resources/library-display";
import { resourceWatchPath } from "@/lib/resources/video";
import type { LearningResource } from "@/components/resources/ResourceLearningCard";
import { cn } from "@/lib/utils";

function formatDuration(minutes?: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:00`;
  return `${m}:00`;
}

function formatViews(count?: number | null): string | null {
  if (count == null || count <= 0) return null;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
}

function authorInitials(name?: string | null): string {
  if (!name?.trim()) return "NG";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

type Props = {
  resource: LearningResource;
  subjectSlug?: string;
  libraryLocked?: boolean;
  onOpen?: () => void;
};

export function VideoCourseCard({ resource, subjectSlug, libraryLocked = false, onOpen }: Props) {
  const { t } = useTranslation();
  const locked = libraryLocked || resourceIsLocked(resource);
  const thumb = getResourceThumbnail(resource, subjectSlug);
  const duration = formatDuration(resource.estimated_minutes);
  const views = formatViews(resource.view_count);
  const href = locked ? "/resources/upgrade" : resourceWatchPath(resource.id);
  const authorName = resource.author?.full_name || t("resources.videoCourses.nextGrades", { defaultValue: "NextGrades" });

  const metaParts: string[] = [];
  if (views) {
    metaParts.push(
      t("resources.videoCourses.views", { count: views, defaultValue: "{{count}} views" })
    );
  }
  if (resource.subject?.name) metaParts.push(resource.subject.name);
  if (resource.class?.name) metaParts.push(resource.class.name);

  return (
    <article className="group">
      <Link
        href={href}
        onClick={onOpen}
        className="block"
        aria-label={
          locked
            ? t("resources.videoCourses.unlockCourse", { title: resource.title, defaultValue: "Unlock {{title}}" })
            : t("resources.videoCourses.watchCourse", { title: resource.title, defaultValue: "Watch {{title}}" })
        }
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#0D1B2A]/5 shadow-sm ring-1 ring-[var(--border-default)] transition duration-300 group-hover:shadow-md group-hover:ring-[#D4AF37]/30">
          <div className="relative aspect-video overflow-hidden">
            <MarketingImage
              src={thumb}
              fallbackSrc={RESOURCES_DEFAULT_THUMBNAIL}
              alt={resource.title}
              containerClassName="absolute inset-0"
              className={cn(
                "object-cover transition duration-500 group-hover:scale-[1.03]",
                locked && "brightness-[0.72] saturate-90"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/50 via-transparent to-transparent" />

            {resource.access_type === "premium" || resource.is_premium ? (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#D4AF37] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0D1B2A] shadow">
                <Crown className="h-3 w-3" />
                Premium
              </span>
            ) : null}

            {duration ? (
              <span className="absolute bottom-3 right-3 rounded-lg bg-[#0D1B2A]/85 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
                {duration}
              </span>
            ) : null}

            {locked ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0D1B2A]/25 backdrop-blur-[1px]">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg ring-2 ring-[#D4AF37]/40">
                  <Lock className="h-6 w-6 text-[#0D1B2A]" aria-hidden />
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37] text-[#0D1B2A] shadow-lg shadow-[#D4AF37]/30">
                  <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden />
                </span>
              </div>
            )}

            <div className="absolute -bottom-4 left-3 z-10">
              {resource.author?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resource.author.avatar_url}
                  alt={authorName}
                  className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-md ring-1 ring-[#D4AF37]/30"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#0D1B2A] text-[10px] font-bold text-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]/30">
                  {authorInitials(authorName)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1 px-3 pb-4 pt-6">
            <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-[var(--foreground)] transition group-hover:text-[#D4AF37]">
              {resource.title}
            </h3>
            <p className="truncate text-sm text-[var(--text-muted)]">{authorName}</p>
            {metaParts.length > 0 && (
              <p className="truncate text-xs text-[var(--text-muted)]/80">{metaParts.join(" · ")}</p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
