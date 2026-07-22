"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CMS_PAGE_NAV_GROUPS } from "@/lib/cms/cms-nav";
import { CMS_SIDEBAR_SECTIONS } from "@/lib/cms/cms-nav";
import { ADMIN_CMS_PREFIX } from "@/lib/admin/portal-paths";
import { cmsFetch } from "@/lib/cms/cms-fetch";
import { seedCmsContent } from "@/lib/cms/cms-api";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ArrowRight,
  CloudUpload,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";

type CmsStats = {
  totalFields: number;
  unpublishedFields: number;
  byPage: Record<string, { total: number; customized: number }>;
};

export function CmsHubDashboard({ focusPages = false }: { focusPages?: boolean }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(true);
  const [stats, setStats] = useState<CmsStats | null>(null);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await cmsFetch("/api/cms/bulk");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load CMS");
      setSeeded(Boolean(data.seeded));
      setStats(data.stats ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("cmsEditor.loadError", { defaultValue: "Could not load content" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, []);

  const runSetup = async () => {
    setSeeding(true);
    try {
      await seedCmsContent();
      toast.success(t("cmsEditor.setupSuccess", { defaultValue: "Website content ready to edit" }));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("cmsEditor.setupError", { defaultValue: "Setup failed" }));
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-text-muted">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-gold)]" />
      </div>
    );
  }

  if (!seeded) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Card hoverable={false} className="max-w-lg p-8 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-[var(--brand-gold)]" />
          <h2 className="mt-4 text-xl font-bold text-foreground">
            {t("cmsEditor.setupTitle", { defaultValue: "Set up your website content" })}
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            {t("cmsEditor.setupDesc", {
              defaultValue:
                "One-time setup copies your current website text into the editor so you can change everything here.",
            })}
          </p>
          <Button variant="gold" className="mt-6" disabled={seeding} onClick={() => void runSetup()}>
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="mr-2 h-4 w-4" />}
            {t("cmsEditor.setupButton", { defaultValue: "Initialize content" })}
          </Button>
        </Card>
      </div>
    );
  }

  const siteTools = CMS_SIDEBAR_SECTIONS.filter((s) => s.id !== "pages-hub");

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {focusPages
              ? t("adminHub.allPages", { defaultValue: "All pages" })
              : t("cmsEditor.title", { defaultValue: "Edit website content" })}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            {t("adminHub.choosePageDesc", {
              defaultValue: "Select any page below, then update text and images. Save to publish changes on nextgrades.at.",
            })}
          </p>
        </div>
        <a href="https://nextgrades.at" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            {t("cmsEditor.previewLive", { defaultValue: "Preview live site" })}
          </Button>
        </a>
      </div>

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card hoverable={false} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("cmsEditor.statFields", { defaultValue: "Editable fields" })}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalFields}</p>
          </Card>
          <Card hoverable={false} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("cmsEditor.statDrafts", { defaultValue: "Unsaved drafts" })}
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--alert-warning-fg)]">{stats.unpublishedFields}</p>
          </Card>
          <Card hoverable={false} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("cmsEditor.statPages", { defaultValue: "Pages" })}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {CMS_PAGE_NAV_GROUPS.reduce((n, g) => n + g.pages.length, 0)}
            </p>
          </Card>
        </div>
      ) : null}

      {CMS_PAGE_NAV_GROUPS.map((group) => (
        <section key={group.id}>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-muted">{group.label}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.pages.map((page) => {
              const Icon = page.icon;
              const pageStats = stats?.byPage?.[page.id];
              return (
                <Link
                  key={page.id}
                  href={`${ADMIN_CMS_PREFIX}/pages/${page.id}`}
                  className="group rounded-xl border border-border-default bg-surface-elevated p-5 transition-all hover:border-[var(--brand-gold)]/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-gold)]/15">
                      <Icon className="h-5 w-5 text-[var(--brand-gold)]" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">{page.label}</h3>
                  {page.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-text-muted">{page.description}</p>
                  ) : null}
                  <p className="mt-3 text-xs font-medium text-[var(--brand-gold)]">
                    {t("adminHub.editPage", { defaultValue: "Edit page" })} →
                  </p>
                  {pageStats ? (
                    <p className="mt-1 text-xs text-text-muted">
                      {t("adminHub.fieldsCount", {
                        defaultValue: "{{count}} fields",
                        count: pageStats.total,
                      })}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {!focusPages && siteTools.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-muted">
            {t("cmsEditor.sidebarSite", { defaultValue: "Site settings" })}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {siteTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-elevated px-4 py-3 text-sm font-medium text-foreground hover:border-[var(--brand-gold)]/40"
                >
                  <Icon className="h-4 w-4 text-[var(--brand-gold)]" />
                  {tool.label}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
