"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Clock, User, BookOpen, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NextGradesVideoPlayer } from "@/components/resources/NextGradesVideoPlayer";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { buildLoginUrl } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";
import { contentTypeLabel } from "@/lib/resources/constants";
import { Button } from "@/components/ui/Button";
import { appShell } from "@/lib/theme/shell";

type ResourceDetail = {
  id: string;
  title: string;
  description?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  content_type?: string | null;
  type?: string | null;
  thumbnail_url?: string | null;
  estimated_minutes?: number | null;
  difficulty_level?: string | null;
  locked?: boolean;
  canAccess?: boolean;
  isVideo?: boolean;
  subject?: { id: string; name: string; slug?: string | null } | null;
  class?: { id: string; name: string; level?: number } | null;
  category?: { id: string; name: string } | null;
  author?: { id: string; full_name: string; avatar_url?: string | null } | null;
};

export function ResourceWatchExperience({ resourceId }: { resourceId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [detail, setDetail] = useState<ResourceDetail | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [detailRes, accessRes] = await Promise.all([
          fetch(`/api/resources/${resourceId}/detail`),
          fetch(`/api/resources/${resourceId}/access`),
        ]);

        if (cancelled) return;

        if (accessRes.status === 401) {
          router.replace(buildLoginUrl(`/resources/watch/${resourceId}`));
          return;
        }

        const accessData = (await accessRes.json()) as { url?: string; error?: string };

        let detailData: ResourceDetail | null = null;
        if (detailRes.ok) {
          detailData = (await detailRes.json()) as ResourceDetail;
          setDetail(detailData);
        } else if (detailRes.status === 404) {
          setError(t("resources.video.notFound", { defaultValue: "Video not found." }));
          return;
        }

        if (detailData?.locked || detailData?.canAccess === false) {
          setError("locked");
          return;
        }

        if (!accessRes.ok || !accessData.url) {
          if (accessRes.status === 403) {
            setError("locked");
          } else {
            setError(accessData.error || t("resources.video.loadFailed", { defaultValue: "Could not load video." }));
          }
          return;
        }

        setStreamUrl(accessData.url);

        if (!detailData) {
          setDetail({
            id: resourceId,
            title: t("resources.video.watch", { defaultValue: "Watch" }),
          });
        }
      } catch {
        if (!cancelled) {
          setError(t("misc.errorGeneric", { defaultValue: "Something went wrong." }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [resourceId, router, t]);

  const trackView = () => {
    if (tracked) return;
    setTracked(true);
    void fetch(`/api/resources/${resourceId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view" }),
    });
  };

  const description =
    detail?.full_description || detail?.description || detail?.short_description || "";

  const backHref = detail?.subject?.slug
    ? `/resources/${detail.subject.slug}`
    : "/resources";

  return (
    <div className={cn("min-h-screen flex flex-col", appShell.sectionSubtle)}>
      <Navbar />

      <main className="flex-1 pb-12 pt-site-nav">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-[#D4AF37] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("resources.video.back", { defaultValue: "Back to resources" })}
          </Link>

          {loading ? (
            <LoadingBlock />
          ) : error === "locked" ? (
            <div className={cn("p-12 text-center", appShell.elevatedCard)}>
              <Lock className="mx-auto mb-4 h-12 w-12 text-[#D4AF37]" />
              <h1 className="text-xl font-bold text-foreground mb-2">
                {t("resources.premiumRequired", { defaultValue: "Premium membership required" })}
              </h1>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                {t("resources.video.lockedDesc", {
                  defaultValue: "Upgrade your membership to watch this video on NextGrades.",
                })}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="gold" href="/resources/upgrade">
                  {t("resources.ctaButton", { defaultValue: "Become a member" })}
                </Button>
                <Button variant="outline" href="/login">
                  {t("navbar.login", { defaultValue: "Login" })}
                </Button>
              </div>
            </div>
          ) : error ? (
            <div className={cn("p-12 text-center text-red-600 dark:text-red-400", appShell.elevatedCard, "border-red-200 dark:border-red-900/50")}>
              {error}
            </div>
          ) : streamUrl && detail ? (
            <div className="space-y-8">
              <NextGradesVideoPlayer
                src={streamUrl}
                poster={detail.thumbnail_url}
                title={detail.title}
                onPlay={trackView}
              />

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#D4AF37] mb-1">
                      {contentTypeLabel(detail.content_type || detail.type || "video")}
                    </p>
                    <h1 className="text-2xl font-bold text-[#0D1B2A]">{detail.title}</h1>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5">
                  {detail.subject?.name && (
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" /> {detail.subject.name}
                    </span>
                  )}
                  {detail.class?.name && (
                    <span>{detail.class.name}</span>
                  )}
                  {detail.author?.full_name && (
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-4 w-4" /> {detail.author.full_name}
                    </span>
                  )}
                  {detail.estimated_minutes != null && detail.estimated_minutes > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {detail.estimated_minutes} min
                    </span>
                  )}
                  {detail.category?.name && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium">
                      {detail.category.name}
                    </span>
                  )}
                </div>

                {description && (
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <p className="whitespace-pre-wrap">{description}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
