"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileBottomNav, MOBILE_BOTTOM_NAV_PADDING } from "@/components/mobile/MobileBottomNav";
import { CmsEditorProvider, useCmsEditor } from "@/context/CmsEditorContext";
import {
  CMS_PAGE_NAV_GROUPS,
  CMS_SIDEBAR_TOOLS,
  CMS_SIDEBAR_SECTIONS,
  CMS_HUB_HREF,
} from "@/lib/cms/cms-nav";
import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";
import { useSidebar } from "@/context/SidebarContext";
import { appShell } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";
import { ChevronLeft, Globe, Loader2, Menu, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CmsPublishBar } from "./CmsPublishBar";

function isPageEditorPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return /\/cms\/pages\/[^/]+/.test(pathname);
}

function isInCms(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === CMS_HUB_HREF || pathname.startsWith(`${CMS_HUB_HREF}/`);
}

function CmsNavLink({
  item,
  active,
  compact,
  onNavigate,
}: {
  item: { id: string; href: string; label: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={compact ? item.label : undefined}
      onClick={onNavigate}
      className={cn(
        "mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        compact && "justify-center px-2",
        active ? "bg-[var(--brand-gold)] text-[var(--brand-navy)]" : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-surface)] hover:text-[var(--sidebar-text-active)]"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!compact && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function CmsSidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const pageMatch = pathname?.match(/\/cms\/pages\/([^/]+)/);
  const activePageId = pageMatch?.[1] ?? null;
  const inCms = isInCms(pathname);

  return (
    <nav className="flex-1 overflow-y-auto px-2 py-4">
      <Link
        href={CMS_HUB_HREF}
        onClick={onNavigate}
        className={cn(
          "mb-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
          pathname === CMS_HUB_HREF
            ? "bg-[var(--brand-gold)] text-[var(--brand-navy)]"
            : "text-white hover:bg-white/10"
        )}
      >
        <Globe className="h-4 w-4 shrink-0" />
        {t("cmsEditor.allPages", { defaultValue: "All pages" })}
      </Link>

      {inCms ? (
        <>
          <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-[var(--sidebar-text)]/70">
            {t("cmsEditor.sidebarPages", { defaultValue: "Edit by page" })}
          </p>
          {CMS_PAGE_NAV_GROUPS.map((group) => (
            <div key={group.id} className="mb-3">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--sidebar-text)]/70">
                {group.label}
              </p>
              {group.pages.map((item) => {
                const active = pathname === item.href || activePageId === item.id;
                return (
                  <CmsNavLink key={item.id} item={item} active={active} onNavigate={onNavigate} />
                );
              })}
            </div>
          ))}

          <p className="mt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--sidebar-text)]/70">
            {t("cmsEditor.sidebarSite", { defaultValue: "Site settings" })}
          </p>
          {CMS_SIDEBAR_SECTIONS.filter((s) => s.id !== "pages-hub").map((item) => {
            const active =
              pathname === item.href || (item.href !== CMS_HUB_HREF && pathname?.startsWith(`${item.href}/`));
            return <CmsNavLink key={item.id} item={item} active={Boolean(active)} onNavigate={onNavigate} />;
          })}

          <p className="mt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--sidebar-text)]/70">
            {t("cmsEditor.sidebarAdvanced", { defaultValue: "Advanced" })}
          </p>
          {CMS_SIDEBAR_TOOLS.map((item) => {
            const active = pathname?.startsWith(item.href) ?? false;
            return <CmsNavLink key={item.id} item={item} active={active} onNavigate={onNavigate} />;
          })}
        </>
      ) : null}
    </nav>
  );
}

function CmsShellSidebar({
  pathname,
  mobileOpen,
  onMobileClose,
}: {
  pathname: string | null;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const { t } = useTranslation();
  const closeMobile = () => onMobileClose();

  const header = (
    <>
      <Link
        href={ADMIN_PORTAL_HOME}
        className="flex items-center gap-2 text-sm text-[var(--sidebar-text)] hover:text-[var(--brand-gold)]"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("cmsEditor.backToAdmin", { defaultValue: "Back to admin" })}
      </Link>
      <h2 className="mt-2 flex items-center gap-2 text-lg font-bold">
        <Globe className="h-5 w-5 text-[var(--brand-gold)]" />
        {t("cmsEditor.title", { defaultValue: "Edit website content" })}
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-[var(--sidebar-text)]">
        {t("cmsEditor.subtitle", { defaultValue: "Update text and images on your live website" })}
      </p>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[var(--brand-navy)] text-white lg:flex">
        <div className="border-b border-white/10 px-4 py-5">{header}</div>
        <CmsSidebarNav pathname={pathname} />
      </aside>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <aside className="fixed inset-y-0 left-[var(--sidebar-width)] z-50 flex w-[min(20rem,calc(100vw-var(--sidebar-width)-1rem))] flex-col border-r border-white/10 bg-[var(--brand-navy)] text-white shadow-2xl lg:hidden">
            <div className="flex items-start justify-between border-b border-white/10 px-4 py-4">
              <div>{header}</div>
              <button
                type="button"
                onClick={closeMobile}
                className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-surface)]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CmsSidebarNav pathname={pathname} onNavigate={closeMobile} />
          </aside>
        </>
      ) : null}
    </>
  );
}

function PageEditorGate({ children, pageId }: { children: React.ReactNode; pageId: string | null }) {
  const { t } = useTranslation();
  const { loading, needsSetup, runSetup } = useCmsEditor();

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-text-muted">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-gold)]" />
        <p>{t("cmsEditor.loading", { defaultValue: "Loading content…" })}</p>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md rounded-2xl border border-[var(--brand-gold)]/30 bg-surface-elevated p-8 text-center shadow-lg">
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
          <Button variant="gold" className="mt-6" onClick={() => void runSetup()}>
            {t("cmsEditor.setupButton", { defaultValue: "Initialize content" })}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-hidden">{children}</div>
      <CmsPublishBar pageId={pageId} />
    </>
  );
}

function CmsShellInner({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { width: sidebarWidth } = useSidebar();
  const pageEditor = isPageEditorPath(pathname);
  const pageMatch = pathname?.match(/\/cms\/pages\/([^/]+)/);
  const activePageId = pageMatch?.[1] ?? null;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  return (
    <div className={cn(appShell.dashboardShell, "bg-surface-muted")} style={{ ["--sidebar-width" as string]: `${sidebarWidth}px` }}>
      <Sidebar role="admin" />

      <div className={cn("flex min-h-screen flex-1 md:ml-[var(--sidebar-width)]", MOBILE_BOTTOM_NAV_PADDING)}>
        <CmsShellSidebar
          pathname={pathname}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border-default bg-surface-elevated px-4 py-3 lg:hidden">
            <Button variant="outline" size="sm" onClick={() => setMobileNavOpen(true)}>
              <Menu className="mr-2 h-4 w-4" />
              {t("cmsEditor.titleShort", { defaultValue: "Content" })}
            </Button>
            <Link href={ADMIN_PORTAL_HOME} className="text-sm text-text-muted hover:text-[var(--brand-gold)]">
              {t("cmsEditor.backToAdmin", { defaultValue: "Back to admin" })}
            </Link>
          </div>

          {pageEditor ? (
            <PageEditorGate pageId={activePageId}>{children}</PageEditorGate>
          ) : (
            <div className="flex-1 overflow-auto">{children}</div>
          )}
        </div>
      </div>

      <MobileBottomNav role="admin" />
    </div>
  );
}

export function CmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageEditor = isPageEditorPath(pathname);

  if (!pageEditor) {
    return <CmsShellInner>{children}</CmsShellInner>;
  }

  return (
    <CmsEditorProvider>
      <CmsShellInner>{children}</CmsShellInner>
    </CmsEditorProvider>
  );
}
