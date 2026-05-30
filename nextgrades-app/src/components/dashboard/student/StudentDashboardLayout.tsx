"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useTheme } from "@/context/ThemeContext";
import { fetchProfileSettings } from "@/lib/dashboard/profile-settings";
import { getFirstName } from "@/lib/dashboard/student-overview";
import { cn } from "@/lib/utils";

interface StudentDashboardLayoutProps {
  title: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export function StudentDashboardLayout({ title, children, headerAction }: StudentDashboardLayoutProps) {
  const { theme } = useTheme();
  const [profileName, setProfileName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileSettings().then((data) => {
      if (!data) return;
      setProfileName(data.full_name ?? "");
      setAvatarUrl(data.avatar_url ?? null);
    });

    const onProfileUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ full_name?: string; avatar_url?: string | null }>).detail;
      if (detail?.full_name) setProfileName(detail.full_name);
      if (detail?.avatar_url !== undefined) setAvatarUrl(detail.avatar_url);
      else if (detail?.avatar_url === null) setAvatarUrl(null);
    };
    window.addEventListener("nextgrades:profile-updated", onProfileUpdate);
    return () => window.removeEventListener("nextgrades:profile-updated", onProfileUpdate);
  }, []);

  const firstName = getFirstName(profileName);
  const initials = firstName ? firstName.charAt(0).toUpperCase() : "S";

  return (
    <div className={cn("flex min-h-screen", theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#F0F2F5]")}>
      <Sidebar role="student" studentName={profileName} />

      <div className="flex min-w-0 flex-1 flex-col pt-16 md:pt-0">
        <header
          className={cn(
            "sticky top-0 z-30 hidden items-center justify-between border-b px-6 py-3.5 backdrop-blur-md md:flex lg:px-8",
            theme === "dark"
              ? "border-white/10 bg-[#0D1B2A]/90"
              : "border-gray-200/80 bg-white/90"
          )}
        >
          <div>
            <h1 className={cn("text-lg font-bold", theme === "dark" ? "text-white" : "text-[#0D1B2A]")}>{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {headerAction}
            <Link
              href="/dashboard/chat"
              className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-3 py-2 text-sm font-medium text-[#0D1B2A] transition hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">NextGrades AI</span>
            </Link>
            <NotificationBell variant={theme === "dark" ? "light" : "dark"} />
            <Link
              href="/dashboard/student/settings"
              className={cn(
                "flex items-center gap-2.5 rounded-xl border py-1.5 pl-1.5 pr-3 text-sm font-medium transition-colors",
                theme === "dark"
                  ? "border-white/15 bg-[#112240] text-white hover:border-[#D4AF37]/40"
                  : "border-gray-200 bg-white text-[#0D1B2A] hover:border-[#D4AF37]/40 hover:bg-gray-50"
              )}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/20 text-sm font-bold text-[#D4AF37]">
                  {initials}
                </span>
              )}
              <span className="max-w-[120px] truncate">{firstName || "—"}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export { getFirstName };
