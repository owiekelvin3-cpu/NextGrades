"use client";

import { ChatPanel } from "@/components/chat/ChatPanel";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileBottomNav, MOBILE_BOTTOM_NAV_PADDING } from "@/components/mobile/MobileBottomNav";
import { useEffect, useState } from "react";
import { getSessionUserId } from "@/lib/dashboard/data";
import { supabase } from "@/lib/supabase/client";

export default function ChatPage() {
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");

  useEffect(() => {
    void (async () => {
      const userId = await getSessionUserId();
      if (!userId) return;
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (data?.role) setRole(data.role as "student" | "teacher" | "admin");
    })();
  }, []);

  return (
    <div className="flex h-[100dvh] bg-[#F5F6F8] dark:bg-[#0D1B2A]">
      <Sidebar role={role} />
      <div className={`flex flex-1 flex-col md:pt-0 ${MOBILE_BOTTOM_NAV_PADDING}`}>
        <ChatPanel open={true} fullPage onClose={() => {}} />
      </div>
      <MobileBottomNav role={role === "admin" ? "admin" : role === "teacher" ? "teacher" : "student"} />
    </div>
  );
}
