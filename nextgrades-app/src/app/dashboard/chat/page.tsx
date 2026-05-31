"use client";

import { ChatPanel } from "@/components/chat/ChatPanel";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileBottomNav, MOBILE_BOTTOM_NAV_PADDING } from "@/components/mobile/MobileBottomNav";
import { useEffect, useState } from "react";
import { getSessionUserId } from "@/lib/dashboard/data";
import { supabase } from "@/lib/supabase/client";
import { appShell } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

export default function ChatPage() {
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const { width: sidebarWidth } = useSidebar();

  useEffect(() => {
    void (async () => {
      const userId = await getSessionUserId();
      if (!userId) return;
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (data?.role) setRole(data.role as "student" | "teacher" | "admin");
    })();
  }, []);

  return (
    <div
      className={cn(appShell.dashboardShell, "bg-[#F5F6F8] dark:bg-[#0D1B2A]")}
      style={{ ["--sidebar-width" as string]: `${sidebarWidth}px` }}
    >
      <Sidebar role={role} />
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[margin-left] duration-300 ease-out md:ml-[var(--sidebar-width)]",
          MOBILE_BOTTOM_NAV_PADDING
        )}
      >
        <div className="flex-1 overflow-hidden">
          <ChatPanel open={true} fullPage onClose={() => {}} />
        </div>
      </div>
      <MobileBottomNav role={role === "admin" ? "admin" : role === "teacher" ? "teacher" : "student"} />
    </div>
  );
}
