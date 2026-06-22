"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileBottomNav, MOBILE_BOTTOM_NAV_PADDING } from "@/components/mobile/MobileBottomNav";
import { CmsEditorProvider, useCmsEditor } from "@/context/CmsEditorContext";
import {
  CMS_SIDEBAR_PAGES,
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

function isVisualEditorPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return /\/cms\/pages\/[^/]+/.test(pathname);
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
        "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        compact && "justify-center px-2",
        active ? "bg-[var(--brand-gold)] text-[var(--brand-navy)]" : "text-gray-300 hover:bg-white/10 hover:text-white"
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
  const pageMatch = pathname?.match(/\/cms\/pages\/([^/]+)/);
  const activePageId = pageMatch?.[1] ?? null;
  const onPagesSection = pathname?.includes("/cms/pages");

  return (
    <nav className="flex-1 overflow-y-auto px-2 py-4">
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Sections</p>
      {CMS_SIDEBAR_SECTIONS.map((item) => {
        const active =
          pathname === item.href ||
          pathname?.startsWith(`${item.href}/`) ||
          (item.id === "pages-hub" &&
            (onPagesSection || pathname === CMS_HUB_HREF || pathname?.startsWith(`${CMS_HUB_HREF}/pages`)));
        return (
          <CmsNavLink key={item.id} item={item} active={Boolean(active)} onNavigate={onNavigate} />
        );
      })}

      {onPagesSection && (
        <>
          <p className="mt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Page editor
          </p>
          {CMS_SIDEBAR_PAGES.map((item) => {
            const active = pathname === item.href || activePageId === item.id;
            return <CmsNavLink key={item.id} item={item} active={active} onNavigate={onNavigate} />;
          })}
        </>
      )}

      <p className="mt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Advanced</p>
      {CMS_SIDEBAR_TOOLS.filter((tool) => !CMS_SIDEBAR_SECTIONS.some((section) => section.href === tool.href)).map(
        (item) => {
          const active = pathname?.startsWith(item.href) ?? false;
          return <CmsNavLink key={item.id} item={item} active={active} onNavigate={onNavigate} />;
        }
      )}
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
  const closeMobile = () => onMobileClose();

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-[var(--brand-navy)] text-white lg:flex">
        <div className="border-b border-white/10 px-4 py-5">
          <Link
            href={ADMIN_PORTAL_HOME}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-[var(--brand-gold)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Admin
          </Link>
          <h2 className="mt-2 flex items-center gap-2 text-lg font-bold">
            <Globe className="h-5 w-5 text-[var(--brand-gold)]" />
            CMS
          </h2>
          <p className="mt-1 text-xs text-gray-400">Manage your entire site</p>
        </div>
        <CmsSidebarNav pathname={pathname} />
      </aside>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            aria-label="Close CMS menu"
            onClick={closeMobile}
          />
          <aside className="fixed inset-y-0 left-[var(--sidebar-width)] z-50 flex w-[min(18rem,calc(100vw-var(--sidebar-width)-1rem))] flex-col border-r border-white/10 bg-[var(--brand-navy)] text-white shadow-2xl lg:hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <Globe className="h-5 w-5 text-[var(--brand-gold)]" />
                  CMS
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">Manage your entire site</p>
              </div>
              <button
                type="button"
                onClick={closeMobile}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
                aria-label="Close CMS menu"
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

function VisualEditorGate({ children, pageId }: { children: React.ReactNode; pageId: string | null }) {
  const { loading, needsSetup, runSetup } = useCmsEditor();

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-text-muted">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-gold)]" />
        <p>Loading content studio…</p>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md rounded-2xl border border-[var(--brand-gold)]/30 bg-surface-elevated p-8 text-center shadow-lg">
          <Sparkles className="mx-auto h-12 w-12 text-[var(--brand-gold)]" />
          <h2 className="mt-4 text-xl font-bold text-foreground">Set up your CMS</h2>
          <p className="mt-2 text-text-muted">
            Copy your website text and images into the database so you can edit everything here.
          </p>
          <Button variant="gold" className="mt-6" onClick={() => void runSetup()}>
            Initialize content
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
  const pathname = usePathname();
  const { width: sidebarWidth } = useSidebar();
  const visualEditor = isVisualEditorPath(pathname);
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
              CMS
            </Button>
            <Link
              href={ADMIN_PORTAL_HOME}
              className="text-sm text-text-muted hover:text-[var(--brand-gold)]"
            >
              Back to admin
            </Link>
          </div>

          {visualEditor ? (
            <VisualEditorGate pageId={activePageId}>{children}</VisualEditorGate>
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
  const visualEditor = isVisualEditorPath(pathname);

  if (!visualEditor) {
    return <CmsShellInner>{children}</CmsShellInner>;
  }

  return (
    <CmsEditorProvider>
      <CmsShellInner>{children}</CmsShellInner>
    </CmsEditorProvider>
  );
}
