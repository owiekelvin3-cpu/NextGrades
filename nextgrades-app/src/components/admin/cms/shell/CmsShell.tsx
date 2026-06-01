"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileBottomNav, MOBILE_BOTTOM_NAV_PADDING } from "@/components/mobile/MobileBottomNav";
import { MobileTopBar } from "@/components/mobile/MobileTopBar";
import { CmsEditorProvider, useCmsEditor } from "@/context/CmsEditorContext";
import { CMS_SIDEBAR_PAGES, CMS_SIDEBAR_TOOLS, CMS_HUB_HREF } from "@/lib/cms/cms-nav";
import { useSidebar } from "@/context/SidebarContext";
import { appShell } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";
import { ChevronLeft, Globe, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CmsPublishBar } from "./CmsPublishBar";

function CmsShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { width: sidebarWidth } = useSidebar();
  const { loading, needsSetup, runSetup } = useCmsEditor();

  const pageMatch = pathname?.match(/\/website-content\/pages\/([^/]+)/);
  const activePageId = pageMatch?.[1] ?? null;

  return (
    <div className={cn(appShell.dashboardShell, "bg-[#E8EAEF]")} style={{ ["--sidebar-width" as string]: `${sidebarWidth}px` }}>
      <Sidebar role="admin" />

      <div className={cn("flex min-h-screen flex-1 md:ml-[var(--sidebar-width)]", MOBILE_BOTTOM_NAV_PADDING)}>
        {/* CMS sub-sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200/80 bg-[#0D1B2A] text-white lg:flex">
          <div className="border-b border-white/10 px-4 py-5">
            <Link href={CMS_HUB_HREF} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37]">
              <ChevronLeft className="h-4 w-4" />
              Admin
            </Link>
            <h2 className="mt-2 flex items-center gap-2 text-lg font-bold">
              <Globe className="h-5 w-5 text-[#D4AF37]" />
              Website Content
            </h2>
            <p className="mt-1 text-xs text-gray-400">Manage your entire site</p>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Pages</p>
            {CMS_SIDEBAR_PAGES.map((item) => {
              const active = pathname === item.href || activePageId === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-[#D4AF37] text-[#0D1B2A]" : "text-gray-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}

            <p className="mt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Tools</p>
            {CMS_SIDEBAR_TOOLS.map((item) => {
              const active = pathname?.startsWith(item.href) ?? false;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-white/15 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {loading && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-500">
              <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
              <p>Loading content studio…</p>
            </div>
          )}

          {!loading && needsSetup && (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="max-w-md rounded-2xl border border-[#D4AF37]/30 bg-white p-8 text-center shadow-lg">
                <Sparkles className="mx-auto h-12 w-12 text-[#D4AF37]" />
                <h2 className="mt-4 text-xl font-bold text-[#0D1B2A]">Set up your CMS</h2>
                <p className="mt-2 text-gray-600">Copy your website text and images into the database so you can edit everything here.</p>
                <Button variant="gold" className="mt-6" onClick={() => void runSetup()}>
                  Initialize content
                </Button>
              </div>
            </div>
          )}

          {!loading && !needsSetup && (
            <>
              <div className="flex-1 overflow-hidden">{children}</div>
              <CmsPublishBar pageId={activePageId} />
            </>
          )}
        </div>
      </div>

      <MobileBottomNav role="admin" />
    </div>
  );
}

export function CmsShell({ children }: { children: React.ReactNode }) {
  return (
    <CmsEditorProvider>
      <CmsShellInner>{children}</CmsShellInner>
    </CmsEditorProvider>
  );
}
