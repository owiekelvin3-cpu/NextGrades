"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { NotificationProvider } from "@/context/NotificationContext";
import { SidebarProvider } from "@/context/SidebarContext";
import PageTransition from "@/components/PageTransition";
import { AdminPortalGuard } from "@/components/admin/AdminPortalGuard";
import { ADMIN_PORTAL_LOGIN } from "@/lib/admin/portal-paths";

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === ADMIN_PORTAL_LOGIN;

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <AdminPortalGuard>
      <PageTransition>{children}</PageTransition>
    </AdminPortalGuard>
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
