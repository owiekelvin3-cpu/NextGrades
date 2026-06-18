"use client";

import { MobileAppShell } from "@/components/mobile/MobileAppShell";

interface TeacherDashboardLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  topRightAction?: React.ReactNode;
  hideBottomNav?: boolean;
  suppressMobileTitle?: boolean;
}

export function TeacherDashboardLayout({
  title,
  description,
  children,
  headerAction,
  topRightAction,
  hideBottomNav,
  suppressMobileTitle,
}: TeacherDashboardLayoutProps) {
  return (
    <MobileAppShell
      role="teacher"
      title={title}
      description={description}
      headerAction={headerAction}
      topRightAction={topRightAction}
      hideBottomNav={hideBottomNav}
      suppressMobileTitle={suppressMobileTitle}
    >
      {children}
    </MobileAppShell>
  );
}
