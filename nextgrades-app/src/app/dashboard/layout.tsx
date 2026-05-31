"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { NotificationProvider } from "@/context/NotificationContext";

const ChatProvider = dynamic(
  () => import("@/components/chat/ChatProvider").then((m) => m.ChatProvider),
  { ssr: false }
);

const FloatingChatWidget = dynamic(
  () => import("@/components/chat/ChatPanel").then((m) => m.FloatingChatWidget),
  { ssr: false }
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <ChatProvider>
        {children}
        <Suspense fallback={null}>
          <FloatingChatWidget />
        </Suspense>
      </ChatProvider>
    </NotificationProvider>
  );
}
