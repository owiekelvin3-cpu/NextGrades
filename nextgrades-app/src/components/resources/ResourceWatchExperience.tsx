"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Clock, User, BookOpen, Lock, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ResourceInlineViewer } from "@/components/resources/ResourceInlineViewer";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { buildLoginUrl } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";
import { contentTypeLabel } from "@/lib/resources/constants";
import { resolveMediaKind, viewActionKey, type MediaKind } from "@/lib/resources/media-type";
import { resourceStreamPath } from "@/lib/resources/video";
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
  file_name?: string | null;
  mime_type?: string | null;
  thumbnail_url?: string | null;
  estimated_minutes?: number | null;
  difficulty_level?: string | null;
  locked?: boolean;
  canAccess?: boolean;
  mediaKind?: MediaKind;
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
          setError(t("resources.viewer.notFound", { defaultValue: "Resource not found." }));
          return;
        }

        if (detailData?.locked || detailData?.canAccess === false) {
          setError("locked");
          return;
        }

        const mediaKind =
          detailData?.mediaKind ??
          resolveMediaKind({
            content_type: detailData?.content_type,
            type: detailData?.type,
            file_name: detailData?.file_name,
            mime_type: detailData?.mime_type,
          });

        if (accessRes.status === 403) {
          setError("locked");
          return;
        }

        if (mediaKind === "video" || mediaKind === "pdf") {
          setStreamUrl(resourceStreamPath(resourceId));
        } else if (!accessRes.ok || !accessData.url) {
          setError(
            accessData.error ||
              t("resources.viewer.loadFailed", { defaultValue: "Could not load this resource." })
          );
          return;
        } else {
          setStreamUrl(accessData.url);
        }

        if (!detailData) {
          setDetail({
            id: resourceId,
            title: t("resources.viewer.title", { defaultValue: "Resource" }),
            mediaKind: "unknown",
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

  const trackView = useCallback(() => {
    if (tracked) return;
    setTracked(true);
    void fetch(`/api/resources/${resourceId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view" }),
    });
  }, [resourceId, tracked]);

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch(`/api/resources/${resourceId}/access?download=1`);
      const data = (await res.json()) as { url?: string };
      if (!res.ok || !data.url) return;
      void fetch(`/api/resources/${resourceId}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "download" }),
      });
      const anchor = document.createElement("a");
      anchor.href = data.url;
      anchor.download = detail?.file_name || detail?.title || "download";
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch {
      /* non-blocking */
    }
  }, [resourceId, detail?.file_name, detail?.title]);

  const description =
    detail?.full_description || detail?.description || detail?.short_description || "";

  const backHref = detail?.subject?.slug
    ? `/resources/${detail.subject.slug}`
    : "/resources";

  const mediaKind =
    detail?.mediaKind ??
    resolveMediaKind({
      content_type: detail?.content_type,
      type: detail?.type,
      file_name: detail?.file_name,
      mime_type: detail?.mime_type,
    });

  const actionKey = viewActionKey(mediaKind);
  const actionLabel = t(`resources.viewer.${actionKey}`, {
    defaultValue: actionKey === "watch" ? "Watch" : actionKey === "read" ? "Read" : "View",
  });

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
            {t("resources.viewer.back", { defaultValue: "Back to library" })}
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
                {t("resources.viewer.lockedDesc", {
                  defaultValue: "Upgrade your membership to access this resource on NextGrades.",
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
            <div
              className={cn(
                "p-12 text-center text-red-600 dark:text-red-400",
                appShell.elevatedCard,
                "border-red-200 dark:border-red-900/50"
              )}
            >
              {error}
            </div>
          ) : streamUrl && detail ? (
            <div className="space-y-8">
              <ResourceInlineViewer
                kind={mediaKind}
                url={streamUrl}
                title={detail.title}
                fileName={detail.file_name}
                poster={detail.thumbnail_url}
                onView={trackView}
                onDownload={() => void handleDownload()}
              />

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#D4AF37] mb-1">
                      {contentTypeLabel(detail.content_type || detail.type || "resource")}
                    </p>
                    <h1 className="text-2xl font-bold text-[#0D1B2A]">{detail.title}</h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDownload()}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
                  >
                    <Download className="h-4 w-4" />
                    {t("resources.viewer.download", { defaultValue: "Download" })}
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5">
                  {detail.subject?.name && (
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" /> {detail.subject.name}
                    </span>
                  )}
                  {detail.class?.name && <span>{detail.class.name}</span>}
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
                  <span className="rounded-full bg-[#D4AF37]/10 px-2.5 py-0.5 text-xs font-medium text-[#0D1B2A]">
                    {actionLabel}
                  </span>
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
