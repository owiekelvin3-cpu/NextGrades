"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { MobileBottomNav, MOBILE_BOTTOM_NAV_PADDING } from "@/components/mobile/MobileBottomNav";
import { fetchProfileSettings } from "@/lib/dashboard/profile-settings";
import { getTeacherFirstName } from "@/lib/dashboard/teacher-overview";
import { teacherHeader, teacherShell } from "./teacher-ui";
import { cn } from "@/lib/utils";

interface TeacherDashboardLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  topRightAction?: React.ReactNode;
}

export function TeacherDashboardLayout({
  title,
  description,
  children,
  headerAction,
  topRightAction,
}: TeacherDashboardLayoutProps) {
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
    };
    window.addEventListener("nextgrades:profile-updated", onProfileUpdate);
    return () => window.removeEventListener("nextgrades:profile-updated", onProfileUpdate);
  }, []);

  const firstName = getTeacherFirstName(profileName);
  const initials = firstName ? firstName.charAt(0).toUpperCase() : "T";

  return (
    <div className={teacherShell}>
      <Sidebar role="teacher" teacherName={profileName} teacherAvatarUrl={avatarUrl} />

      <div className={cn("flex min-w-0 flex-1 flex-col md:pt-0", MOBILE_BOTTOM_NAV_PADDING)}>
        <header
          className={cn(
            teacherHeader,
            "sticky top-0 z-30 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-8"
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3 sm:block">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#0D1B2A] sm:text-2xl">{title}</h1>
                  {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:hidden">
                  <NotificationBell />
                  <Link href="/dashboard/teacher/settings">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100" />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/20 text-sm font-bold text-[#D4AF37]">
                        {initials}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
              {headerAction && <div className="mt-4 sm:hidden">{headerAction}</div>}
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              {topRightAction}
              <NotificationBell />
              <Link
                href="/dashboard/teacher/settings"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white py-1.5 pl-1.5 pr-2.5 text-sm shadow-sm transition hover:border-gray-300"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/20 text-xs font-bold text-[#D4AF37]">
                    {initials}
                  </span>
                )}
                <span className="max-w-[100px] truncate font-medium text-[#0D1B2A]">{firstName || "—"}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <MobileBottomNav role="teacher" />
    </div>
  );
}
