"use client";

import Link from "next/link";
import { Download, Lock, Play, Gift, Crown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LearningResource } from "@/components/resources/ResourceLearningCard";
import { contentTypeLabel } from "@/lib/resources/constants";
import { getResourceThumbnail, RESOURCES_DEFAULT_THUMBNAIL } from "@/lib/resources/images";
import { isPremiumResource } from "@/lib/resources/ui-config";
import { isVideoResource, resourceWatchPath } from "@/lib/resources/video";
import { appShell } from "@/lib/theme/shell";
import { theme as th } from "@/lib/theme/tokens";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { useTranslation } from "react-i18next";

type HubCardProps = {
  resource: LearningResource;
  onOpen: () => void;
  variant?: "free" | "premium";
  subjectSlug?: string;
};

function ResourceThumb({
  src,
  alt,
  locked,
}: {
  src: string;
  alt: string;
  locked?: boolean;
}) {
  return (
    <MarketingImage
      src={src}
      fallbackSrc={RESOURCES_DEFAULT_THUMBNAIL}
      alt={alt}
      containerClassName="absolute inset-0"
      className={cn("transition duration-300 group-hover:scale-[1.02]", locked && "brightness-50")}
      sizes="(max-width: 640px) 100vw, 25vw"
    />
  );
}

export function ResourceHubCard({ resource, onOpen, variant, subjectSlug }: HubCardProps) {
  const { t } = useTranslation();
  const premium = variant === "premium" || isPremiumResource(resource);
  const locked = resource.locked ?? (premium && resource.canAccess === false);
  const thumb = getResourceThumbnail(resource, subjectSlug);
  const type = contentTypeLabel(resource.content_type || resource.type || "resource");
  const isVideo = isVideoResource(resource);

  return (
    <article className={cn("group flex flex-col overflow-hidden transition hover:shadow-md", appShell.elevatedCard)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-subtle)]">
        {locked ? (
          <ResourceThumb src={thumb} alt={resource.title} locked />
        ) : isVideo ? (
          <Link href={resourceWatchPath(resource.id)} className="block h-full w-full">
            <ResourceThumb src={thumb} alt={resource.title} />
          </Link>
        ) : (
          <ResourceThumb src={thumb} alt={resource.title} />
        )}
        <span className="absolute left-3 top-3 rounded-md bg-[#0D1B2A]/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          {isVideo ? "Video" : type.includes("Video") ? "Video" : "PDF"}
        </span>
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
              <Lock className="h-5 w-5 text-[#0D1B2A]" />
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-[var(--text-muted)]">
          {resource.class?.name || resource.subject?.name || "-"}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold text-[var(--foreground)]">
          {isVideo && !locked ? (
            <Link href={resourceWatchPath(resource.id)} className="hover:text-[#D4AF37] transition">
              {resource.title}
            </Link>
          ) : (
            resource.title
          )}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-xs text-[var(--text-muted)]">
          {resource.short_description || resource.description || ""}
        </p>
        <div className="mt-4 flex items-center justify-between">
          {premium ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37]">
              <Lock className="h-3.5 w-3.5" /> {t("resources.membersOnly", { defaultValue: "Members only" })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#22C55E]">
              <Gift className="h-3.5 w-3.5" /> {t("resources.freeLabel", { defaultValue: "Free" })}
            </span>
          )}
          {locked ? (
            <Link
              href="/resources/upgrade"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]"
            >
              <Lock className="h-4 w-4" />
            </Link>
          ) : isVideo ? (
            <Link
              href={resourceWatchPath(resource.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]"
            >
              <Play className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

type SubjectCardProps = {
  name: string;
  slug: string;
  count: number;
  color: string;
  icon: React.ReactNode;
  imageUrl?: string;
};

export function ResourceSubjectTile({ name, slug, count, color, icon, imageUrl }: SubjectCardProps) {
  const { t } = useTranslation();
  const thumb = imageUrl || getResourceThumbnail({ subject: { slug, name } }, slug);

  return (
    <Link
      href={`/resources/${slug}`}
      className={cn("group flex flex-col overflow-hidden transition hover:shadow-md", appShell.elevatedCard)}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-[#0D1B2A]">
        <MarketingImage
          src={thumb}
          fallbackSrc={RESOURCES_DEFAULT_THUMBNAIL}
          alt={name}
          containerClassName="absolute inset-0"
          className="transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, 20vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/60 to-transparent" />
      </div>
      <div className="flex flex-col p-5">
        <div
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {icon}
        </div>
        <h3 className="font-bold text-foreground">{name}</h3>
        <p className="mt-1 text-xs text-text-muted">
          {t("resources.materialsCount", { count, defaultValue: `${count} materials` })}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color }}>
          {t("resources.exploreSubject", { defaultValue: "Explore" })}{" "}
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
        <span className="mt-2 h-0.5 w-8 rounded-full transition-all group-hover:w-full" style={{ backgroundColor: color }} />
      </div>
    </Link>
  );
}

export function SectionHeader({
  title,
  badge,
  badgeVariant = "green",
  actionHref,
  actionLabel,
  icon,
}: {
  title: string;
  badge?: string;
  badgeVariant?: "green" | "gold";
  actionHref?: string;
  actionLabel?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {badge && (
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              badgeVariant === "green" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEF3C7] text-[#92400E]"
            )}
          >
            {badge}
          </span>
        )}
      </div>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="text-sm font-semibold text-[#3B82F6] hover:underline">
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}

export function ResourcesCtaBanner() {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-[#0D1B2A] px-6 py-8 md:px-10 md:py-10">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/20">
            <Crown className="h-6 w-6 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{t("resources.ctaTitle")}</h3>
            <p className="mt-1 max-w-xl text-sm text-gray-300">{t("resources.ctaSubtitle")}</p>
          </div>
        </div>
        <Link
          href="/resources/upgrade"
          className={cn(th.btnGold, th.focusRing, "inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-6 py-3 text-sm")}
        >
          {t("resources.ctaButton")} <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function ResourcesFeatureRow() {
  const { t } = useTranslation();
  const features = [
    { title: t("resources.features.feature1Title"), desc: t("resources.features.feature1Desc") },
    { title: t("resources.features.feature2Title"), desc: t("resources.features.feature2Desc") },
    { title: t("resources.features.feature3Title"), desc: t("resources.features.feature3Desc") },
    { title: t("resources.features.feature4Title"), desc: t("resources.features.feature4Desc") },
  ];
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((f) => (
        <div key={f.title} className="text-center">
          <p className="text-sm font-bold text-foreground">{f.title}</p>
          <p className="mt-1 text-xs text-text-muted">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
