"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTopBar } from "@/components/mobile/MobileTopBar";
import { TeacherMobileHeader } from "@/components/dashboard/teacher/TeacherMobileHeader";
import { MobileBottomNav, MOBILE_BOTTOM_NAV_PADDING } from "@/components/mobile/MobileBottomNav";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { fetchProfileSettings } from "@/lib/dashboard/profile-settings";
import { appShell } from "@/lib/theme/shell";
import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";
import { ADMIN_PORTAL_PREFIX } from "@/lib/admin/portal-paths";
import { useSidebar } from "@/context/SidebarContext";

type Role = "student" | "teacher" | "admin";

type Props = {
  role: Role;
  title: string;
  description?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  topRightAction?: React.ReactNode;
  hideBottomNav?: boolean;
  hideTopBar?: boolean;
  suppressMobileTitle?: boolean;
  studentName?: string;
  teacherName?: string;
};

function getInitials(name: string, fallback: string) {
  const first = name.trim().split(/\s+/)[0];
  return first ? first.charAt(0).toUpperCase() : fallback;
}

export function MobileAppShell({
  role,
  title,
  description,
  children,
  headerAction,
  topRightAction,
  hideBottomNav = false,
  hideTopBar = false,
  suppressMobileTitle = false,
  studentName: studentNameProp,
  teacherName: teacherNameProp,
}: Props) {
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

  const displayName = studentNameProp ?? teacherNameProp ?? profileName;
  const fallback = role === "teacher" ? "T" : role === "admin" ? "A" : "S";
  const initials = getInitials(displayName, fallback);
  const { width: sidebarWidth } = useSidebar();

  const settingsHref =
    role === "teacher"
      ? "/dashboard/teacher/settings"
      : role === "admin"
        ? `${ADMIN_PORTAL_PREFIX}/users`
        : "/dashboard/student/settings";

  return (
    <div
      className={cn(appShell.dashboardShell, "md:bg-surface-dashboard")}
      style={{ ["--sidebar-width" as string]: `${sidebarWidth}px` }}
    >
      <Sidebar
        role={role}
        studentName={role === "student" ? displayName : undefined}
        teacherName={role === "teacher" ? displayName : undefined}
        teacherAvatarUrl={role === "teacher" ? avatarUrl : undefined}
      />

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface-dashboard transition-[margin-left] duration-300 ease-out md:ml-[var(--sidebar-width)]",
          !hideBottomNav && MOBILE_BOTTOM_NAV_PADDING
        )}
      >
        {!hideTopBar &&
          (role === "teacher" ? (
            <TeacherMobileHeader displayName={displayName} />
          ) : (
            <MobileTopBar role={role} />
          ))}

        {/* Desktop header */}
        <header
          className={cn(
            appShell.dashboardHeader,
            "hidden shrink-0 md:block md:z-30",
            mobile.pageX,
            "py-4 lg:py-5"
          )}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className={appShell.dashboardTitle}>{title}</h1>
              {description && <p className={appShell.dashboardDescription}>{description}</p>}
              {headerAction && <div className="mt-4">{headerAction}</div>}
            </div>
            {topRightAction ? (
              <div className="flex shrink-0 items-center gap-3">{topRightAction}</div>
            ) : (
              <div className="flex shrink-0 items-center gap-3">
                <NotificationBell />
                <Link href={settingsHref} className={appShell.dashboardProfileChip}>
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/20 text-xs font-bold text-[#D4AF37]">
                      {initials}
                    </span>
                  )}
                  <span className="max-w-[120px] truncate font-medium">{displayName || "—"}</span>
                  <ChevronDown className="h-4 w-4 text-text-muted" />
                </Link>
              </div>
            )}
          </div>
        </header>

        <main
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            suppressMobileTitle ? "px-0 pt-0" : mobile.pageX,
            "pb-6 pt-3 md:px-6 md:py-6 lg:py-8"
          )}
        >
          {!suppressMobileTitle && (
            <div className="mb-6 md:hidden">
              <h1 className={mobile.pageTitle}>{title}</h1>
              {description && <p className={cn(mobile.caption, "mt-2 max-w-prose")}>{description}</p>}
              {(headerAction || topRightAction) && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {headerAction}
                  {topRightAction}
                </div>
              )}
            </div>
          )}

          <div
            className={cn(
              suppressMobileTitle ? "w-full" : "mx-auto min-w-0 w-full max-w-[1400px]",
              !suppressMobileTitle && mobile.sectionGap,
              "md:contents dashboard-mobile-content"
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {!hideBottomNav && <MobileBottomNav role={role} />}
    </div>
  );
}
