"use client";

import Link from "next/link";
import { Lock, Play, Eye, BookOpen, Gift, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { getResourceThumbnail, RESOURCES_DEFAULT_THUMBNAIL } from "@/lib/resources/images";
import type { LearningResource } from "@/components/resources/ResourceLearningCard";
import {
  formatResourceCatalogLine,
  formatResourceSummary,
  formatResourceTypeBadge,
  resourceIsLocked,
  resourceIsPremium,
} from "@/lib/resources/library-display";
import { isVideoResource, resourceWatchPath } from "@/lib/resources/video";
import { resolveMediaKind, viewActionKey } from "@/lib/resources/media-type";
import { useTranslation } from "react-i18next";

function actionIcon(kind: ReturnType<typeof resolveMediaKind>) {
  if (kind === "video") return Play;
  if (kind === "pdf" || kind === "text") return BookOpen;
  return Eye;
}

export function LibraryCardThumbnail({
  resource,
  subjectSlug,
  locked,
  className,
}: {
  resource: LearningResource;
  subjectSlug?: string;
  locked?: boolean;
  className?: string;
}) {
  const thumb = getResourceThumbnail(resource, subjectSlug);
  const isVideo = isVideoResource(resource);

  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden bg-[var(--surface-subtle)]", className)}>
      <MarketingImage
        src={thumb}
        fallbackSrc={RESOURCES_DEFAULT_THUMBNAIL}
        alt={resource.title}
        containerClassName="absolute inset-0"
        className={cn(
          "object-cover transition duration-500 group-hover:scale-[1.03]",
          locked && "brightness-[0.55] saturate-75"
        )}
        sizes="(max-width: 640px) 100vw, 25vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/80 via-[#0D1B2A]/15 to-transparent" />
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-[#0D1B2A]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
          {formatResourceTypeBadge(resource)}
        </span>
        {resourceIsPremium(resource) ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#D4AF37] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0D1B2A]">
            <Crown className="h-3 w-3" />
            Premium
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#166534]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            <Gift className="h-3 w-3" />
            Free
          </span>
        )}
      </div>
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg">
            <Lock className="h-5 w-5 text-[#0D1B2A]" />
          </span>
        </div>
      )}
      {!locked && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37] text-[#0D1B2A] shadow-lg">
            {isVideo ? (
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </span>
        </div>
      )}
    </div>
  );
}

export function LibraryCardBody({
  resource,
  subjectSlug,
  onOpen,
  compact = false,
}: {
  resource: LearningResource;
  subjectSlug?: string;
  onOpen: () => void;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const locked = resourceIsLocked(resource);
  const mediaKind = resolveMediaKind(resource);
  const actionKey = viewActionKey(mediaKind);
  const ActionIcon = actionIcon(mediaKind);
  const meta = formatResourceCatalogLine(resource, {
    semester: (sem) =>
      t("resources.filters.semesterShort", {
        defaultValue: "{{sem}}. Semester",
        sem,
      }),
    metaFallback: t("resources.libraryMetaFallback", { defaultValue: "NextGrades Library" }),
  });
  const summary = formatResourceSummary(resource, {
    summaryFallback: t("resources.librarySummaryFallback", {
      defaultValue: "Curated learning material from the NextGrades library.",
    }),
  });

  const actionHref = locked ? "/resources/upgrade" : resourceWatchPath(resource.id);
  const actionLabel = locked
    ? t("resources.premiumCta", { defaultValue: "Unlock access" })
    : t(`resources.viewer.${actionKey}`, {
        defaultValue: actionKey === "watch" ? "Watch" : actionKey === "read" ? "Read" : "View",
      });

  return (
    <div className={cn("flex flex-1 flex-col", compact ? "p-4" : "p-4 sm:p-5")}>
      {resource.category?.name && (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">
          {resource.category.name}
        </p>
      )}
      <p className="text-xs font-medium text-[var(--text-muted)]">{meta}</p>
      <h3
        className={cn(
          "mt-1.5 line-clamp-2 font-bold leading-snug text-[var(--foreground)]",
          compact ? "text-base" : "text-[15px] sm:text-base"
        )}
      >
        {!locked ? (
          <Link
            href={resourceWatchPath(resource.id)}
            className="transition hover:text-[#D4AF37]"
          >
            {resource.title}
          </Link>
        ) : (
          resource.title
        )}
      </h3>
      <p
        className={cn(
          "mt-2 line-clamp-2 flex-1 text-[var(--text-muted)]",
          compact ? "text-xs min-h-[2.25rem]" : "text-sm min-h-[2.75rem]"
        )}
      >
        {summary}
      </p>

      <div className="mt-4 border-t border-[var(--border-default)] pt-4">
        <Link
          href={actionHref}
          onClick={onOpen}
          className={cn(
            "inline-flex w-full min-h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition",
            locked
              ? "border border-[var(--border-default)] bg-[var(--surface-subtle)] text-[var(--foreground)] hover:border-[#D4AF37]/40"
              : "bg-[#D4AF37] text-[#0D1B2A] hover:bg-[#e0bc4a]"
          )}
        >
          {locked ? (
            <>
              <Lock className="h-4 w-4" />
              {actionLabel}
            </>
          ) : (
            <>
              <ActionIcon className="h-4 w-4" />
              {actionLabel}
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
