"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { NotificationProvider } from "@/context/NotificationContext";
import { SidebarProvider } from "@/context/SidebarContext";
import PageTransition from "@/components/PageTransition";
import { AdminPortalGuard } from "@/components/admin/AdminPortalGuard";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { ADMIN_PORTAL_LOGIN } from "@/lib/admin/portal-paths";

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === ADMIN_PORTAL_LOGIN;

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <AdminErrorBoundary>
      <AdminPortalGuard>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <PageTransition>{children}</PageTransition>
        </div>
      </AdminPortalGuard>
    </AdminErrorBoundary>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#0D1B2A]">
          <Suspense fallback={null}>
            <PortalLayoutInner>{children}</PortalLayoutInner>
          </Suspense>
        </div>
      </SidebarProvider>
    </NotificationProvider>
  );
}
