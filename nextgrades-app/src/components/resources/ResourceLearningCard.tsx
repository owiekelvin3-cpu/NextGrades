"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/context/ThemeContext";
import { contentTypeLabel, DEFAULT_THUMBNAIL, AGE_RANGES } from "@/lib/resources/constants";
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  Download,
  Eye,
  Lock,
  User,
} from "lucide-react";

export type LearningResource = {
  id: string;
  title: string;
  description?: string | null;
  short_description?: string | null;
  type?: string;
  content_type?: string;
  url: string;
  thumbnail_url?: string | null;
  access_type?: string;
  is_premium?: boolean;
  download_count?: number | null;
  view_count?: number | null;
  difficulty_level?: string;
  age_range?: string;
  estimated_minutes?: number | null;
  language?: string;
  created_at?: string;
  category?: { id: string; name: string; icon?: string } | null;
  author?: { id: string; full_name: string; avatar_url?: string | null } | null;
};

function ageLabel(value?: string) {
  return AGE_RANGES.find((a) => a.value === value)?.label ?? "All Ages";
}

function resourceAccess(r: LearningResource) {
  return r.access_type === "premium" || r.is_premium ? "premium" : "free";
}

type Props = {
  resource: LearningResource;
  index?: number;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onDownload?: () => void;
  onView?: () => void;
  premiumCta?: string;
  freeCta?: string;
};

export function ResourceLearningCard({
  resource,
  index = 0,
  isBookmarked = false,
  onBookmark,
  onDownload,
  onView,
  premiumCta = "Unlock",
  freeCta = "Open",
}: Props) {
  const { theme } = useTheme();
  const access = resourceAccess(resource);
  const text = theme === "dark" ? "text-white" : "text-[#0D1B2A]";
  const muted = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const panel = theme === "dark" ? "bg-[#112240] border-white/10" : "bg-white border-gray-200";
  const thumb = resource.thumbnail_url || DEFAULT_THUMBNAIL;
  const summary = resource.short_description || resource.description || "—";
  const typeLabel = contentTypeLabel(resource.content_type || resource.type || "resource");

  return (
    <Card className={`overflow-hidden h-full flex flex-col group ${panel}`}>
      <div className="relative aspect-[16/9] bg-[#0D1B2A]/5 overflow-hidden">
        <Image
          src={thumb}
          alt={resource.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading={index < 4 ? "eager" : "lazy"}
          unoptimized={thumb.startsWith("http") && !thumb.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || "supabase")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge className="bg-[#0D1B2A]/80 text-white backdrop-blur-sm border-0">{typeLabel}</Badge>
          <Badge
            className={
              access === "premium"
                ? "bg-[#D4AF37] text-[#0D1B2A] border-0"
                : "bg-[#22C55E] text-white border-0"
            }
          >
            {access === "premium" ? "Premium" : "Free"}
          </Badge>
        </div>
        {onBookmark && (
          <button
            type="button"
            onClick={onBookmark}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
            aria-label="Bookmark"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-[#D4AF37]" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs font-semibold text-[#D4AF37] truncate">
            {resource.category?.name || "Learning Resource"}
          </p>
          <span className={`text-xs shrink-0 ${muted}`}>{ageLabel(resource.age_range)}</span>
        </div>

        <h3 className={`font-bold text-lg mb-2 line-clamp-2 ${text}`}>{resource.title}</h3>
        <p className={`text-sm mb-4 flex-1 line-clamp-2 ${muted}`}>{summary}</p>

        <div className={`flex flex-wrap items-center gap-3 text-xs mb-4 ${muted}`}>
          {resource.author?.full_name && (
            <span className="inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {resource.author.full_name}
            </span>
          )}
          {resource.estimated_minutes != null && resource.estimated_minutes > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {resource.estimated_minutes} min
            </span>
          )}
          <span className="inline-flex items-center gap-1 capitalize">
            {resource.difficulty_level || "beginner"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {resource.view_count ?? 0}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/5 dark:border-white/10">
          <span className={`text-xs ${muted}`}>{resource.download_count ?? 0} downloads</span>
          {access === "premium" ? (
            <Link href="/pricing" onClick={onView}>
              <Button variant="gold" size="sm">
                <Lock className="w-4 h-4 mr-1" />
                {premiumCta}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="w-4 h-4 mr-1" />
              {freeCta}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
