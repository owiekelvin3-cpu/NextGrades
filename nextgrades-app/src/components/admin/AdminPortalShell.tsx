"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTopBar } from "@/components/mobile/MobileTopBar";
import { MobileBottomNav, MOBILE_BOTTOM_NAV_PADDING } from "@/components/mobile/MobileBottomNav";
import { appShell } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

/** Persistent admin shell - mounts once per portal session (sidebar + nav). */
export function AdminPortalShell({ children }: { children: React.ReactNode }) {
  const { width: sidebarWidth } = useSidebar();

  return (
    <div
      className={appShell.dashboardShell}
      style={{ ["--sidebar-width" as string]: `${sidebarWidth}px` }}
    >
      <Sidebar role="admin" />

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[margin-left] duration-300 ease-out md:ml-[var(--sidebar-width)]",
          MOBILE_BOTTOM_NAV_PADDING
        )}
      >
        <MobileTopBar role="admin" />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <MobileBottomNav role="admin" />
    </div>
  );
}
