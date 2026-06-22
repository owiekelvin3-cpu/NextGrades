"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CMS_PAGES } from "@/lib/cms/page-meta";
import { CMS_SIDEBAR_TOOLS, CMS_HUB_HREF } from "@/lib/cms/cms-nav";
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
  FileText,
  ImageIcon,
  Loader2,
  Palette,
  Search,
  Sparkles,
} from "lucide-react";

type CmsStats = {
  totalFields: number;
  unpublishedFields: number;
  byPage: Record<string, { total: number; customized: number }>;
};

export function CmsHubDashboard({ focusPages = false }: { focusPages?: boolean }) {
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
      toast.error(e instanceof Error ? e.message : "Could not load CMS");
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
      toast.success("Website content initialized");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Setup failed");
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
        <Card className="max-w-lg p-8 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-[var(--brand-gold)]" />
          <h2 className="mt-4 text-xl font-bold text-foreground">Set up your CMS</h2>
          <p className="mt-2 text-text-muted">
            Import all website text and images from your locale files into the database so admins can edit
            everything without code changes.
          </p>
          <Button variant="gold" className="mt-6" disabled={seeding} onClick={() => void runSetup()}>
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="mr-2 h-4 w-4" />}
            Initialize content
          </Button>
        </Card>
      </div>
    );
  }

  const quickTools = CMS_SIDEBAR_TOOLS.filter((t) =>
    ["seo", "media", "theme", "navigation", "history"].includes(t.id)
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {focusPages ? "Pages" : "Website content"}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Edit any text or image on nextgrades.at — changes go live when you publish.
          </p>
        </div>
        <a href="https://nextgrades.at" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            View live site
          </Button>
        </a>
      </div>

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Total fields</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalFields}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Unpublished drafts</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{stats.unpublishedFields}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Pages</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{CMS_PAGES.length}</p>
          </Card>
        </div>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Pages</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CMS_PAGES.map((page) => {
            const Icon = page.icon;
            const pageStats = stats?.byPage?.[page.id];
            return (
              <Link
                key={page.id}
                href={`${ADMIN_CMS_PREFIX}/pages/${page.id}`}
                className="group rounded-xl border border-border-default bg-surface-elevated p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-gold)]/15">
                    <Icon className="h-5 w-5 text-[var(--brand-gold)]" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{page.label}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-text-muted">{page.description}</p>
                {pageStats ? (
                  <p className="mt-2 text-xs text-text-muted">
                    {pageStats.customized}/{pageStats.total} customized
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>

      {!focusPages ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Tools</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickTools.map((tool) => {
              const icon =
                tool.id === "seo" ? Search : tool.id === "media" ? ImageIcon : tool.id === "theme" ? Palette : FileText;
              const Icon = icon;
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
            <Link
              href={`${CMS_HUB_HREF}/blog`}
              className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-elevated px-4 py-3 text-sm font-medium text-foreground hover:border-[var(--brand-gold)]/40"
            >
              <FileText className="h-4 w-4 text-[var(--brand-gold)]" />
              Blog
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
