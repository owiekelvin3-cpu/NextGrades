"use client";

import dynamic from "next/dynamic";
import { NotificationProvider } from "@/context/NotificationContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { DashboardAuthGuard } from "@/components/auth/DashboardAuthGuard";
import PageTransition from "@/components/PageTransition";


const ChatProvider = dynamic(
  () => import("@/components/chat/ChatProvider").then((m) => m.ChatProvider),
  { ssr: false }
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardAuthGuard>
      <NotificationProvider>
        <SidebarProvider>
          <ChatProvider>
            <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden">
              <PageTransition>{children}</PageTransition>
            </div>
          </ChatProvider>
        </SidebarProvider>
      </NotificationProvider>
    </DashboardAuthGuard>
  );
}
