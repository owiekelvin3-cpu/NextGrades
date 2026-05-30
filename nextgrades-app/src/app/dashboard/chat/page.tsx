"use client";

import { ChatPanel } from "@/components/chat/ChatPanel";
import { Sidebar } from "@/components/dashboard/Sidebar";
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
    <div className="flex h-screen bg-[#F5F6F8] dark:bg-[#0D1B2A]">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col pt-16 md:pt-0">
        <ChatPanel open={true} fullPage onClose={() => {}} />
      </div>
    </div>
  );
}
