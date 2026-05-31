"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { MobileBottomNav, MOBILE_BOTTOM_NAV_PADDING } from "@/components/mobile/MobileBottomNav";
import { fetchProfileSettings } from "@/lib/dashboard/profile-settings";
import { getFirstName } from "@/lib/dashboard/student-overview";
import { appShell } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";

interface StudentDashboardLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  topRightAction?: React.ReactNode;
}

export function StudentDashboardLayout({
  title,
  description,
  children,
  headerAction,
  topRightAction,
}: StudentDashboardLayoutProps) {
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

  const firstName = getFirstName(profileName);
  const initials = firstName ? firstName.charAt(0).toUpperCase() : "S";

  return (
    <div className={appShell.dashboardShell}>
      <Sidebar role="student" studentName={profileName} />

      <div className={cn("flex min-w-0 flex-1 flex-col md:pt-0", MOBILE_BOTTOM_NAV_PADDING)}>
        <header
          className={cn(
            appShell.dashboardHeader,
            "sticky top-0 z-30 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-8"
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3 sm:block">
                <div>
                  <h1 className={appShell.dashboardTitle}>{title}</h1>
                  {description && <p className={appShell.dashboardDescription}>{description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:hidden">
                  <NotificationBell />
                  <Link href="/dashboard/student/settings">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-border-default" />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/20 text-sm font-bold text-[#D4AF37]">
                        {initials}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
              {headerAction && <div className="mt-4">{headerAction}</div>}
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              {topRightAction}
              <NotificationBell />
              <Link href="/dashboard/student/settings" className={appShell.dashboardProfileChip}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/20 text-xs font-bold text-[#D4AF37]">
                    {initials}
                  </span>
                )}
                <span className="max-w-[120px] truncate font-medium">{profileName || firstName || "—"}</span>
                <ChevronDown className="h-4 w-4 text-text-muted" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <MobileBottomNav role="student" />
    </div>
  );
}

export { getFirstName };
