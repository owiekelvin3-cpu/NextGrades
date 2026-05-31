"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Lock, Download, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { mobile } from "@/lib/mobile/tokens";
import type { LearningResource } from "@/components/resources/ResourceLearningCard";
import { contentTypeLabel } from "@/lib/resources/constants";
import { getResourceThumbnail } from "@/lib/resources/images";
import { isPremiumResource } from "@/lib/resources/ui-config";
import { isVideoResource, resourceWatchPath } from "@/lib/resources/video";
import { Button } from "@/components/ui/Button";

type Props = {
  resource: LearningResource;
  onOpen?: () => void;
  variant?: "free" | "premium";
  subjectSlug?: string;
};

export function MobileResourceCard({ resource, onOpen, variant, subjectSlug }: Props) {
  const premium = variant === "premium" || isPremiumResource(resource);
  const locked = resource.locked ?? (premium && resource.canAccess === false);
  const thumb = getResourceThumbnail(resource, subjectSlug);
  const type = contentTypeLabel(resource.content_type || resource.type || "resource");
  const isVideo = isVideoResource(resource);
  const teacher = resource.author?.full_name || "NextGrades";
  const date = resource.created_at
    ? new Date(resource.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "";

  const actionHref = locked
    ? "/resources/upgrade"
    : isVideo
      ? resourceWatchPath(resource.id)
      : undefined;

  return (
    <article className={cn(mobile.cardInteractive, "flex flex-col")}>
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-subtle">
        <Image
          src={thumb}
          alt={resource.title}
          fill
          className={cn("object-cover", locked && "brightness-75")}
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized={thumb.startsWith("http")}
        />
        <span className="absolute left-3 top-3 rounded-lg bg-[#0D1B2A]/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          {isVideo ? "Video" : type}
        </span>
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95">
              <Lock className="h-5 w-5 text-[#0D1B2A]" />
            </span>
          </div>
        )}
        {!locked && isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37] text-[#0D1B2A] shadow-lg">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </span>
          </div>
        )}
      </div>

      <div className={cn(mobile.cardPad, "flex flex-1 flex-col gap-3")}>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {resource.class?.name || resource.subject?.name || "—"}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-foreground">
            {resource.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {teacher}
          </span>
          {date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {date}
            </span>
          )}
        </div>

        <div className="mt-auto pt-1">
          {actionHref ? (
            <Button
              variant={locked ? "outline" : "gold"}
              size="md"
              href={actionHref}
              className="w-full min-h-12"
              onClick={onOpen}
            >
              {locked ? (
                <>
                  <Lock className="h-4 w-4" />
                  Unlock
                </>
              ) : isVideo ? (
                <>
                  <Play className="h-4 w-4" />
                  Watch
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Open
                </>
              )}
            </Button>
          ) : (
            <Button variant="gold" size="md" className="w-full min-h-12" onClick={onOpen}>
              <Download className="h-4 w-4" />
              Open
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
