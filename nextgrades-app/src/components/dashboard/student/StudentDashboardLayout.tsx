"use client";

import { MobileAppShell } from "@/components/mobile/MobileAppShell";

interface StudentDashboardLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  topRightAction?: React.ReactNode;
  hideBottomNav?: boolean;
  hideTopBar?: boolean;
  suppressMobileTitle?: boolean;
}

export function StudentDashboardLayout({
  title,
  description,
  children,
  headerAction,
  topRightAction,
  hideBottomNav,
  hideTopBar,
  suppressMobileTitle,
}: StudentDashboardLayoutProps) {
  return (
    <MobileAppShell
      role="student"
      title={title}
      description={description}
      headerAction={headerAction}
      topRightAction={topRightAction}
      hideBottomNav={hideBottomNav}
      hideTopBar={hideTopBar}
      suppressMobileTitle={suppressMobileTitle}
    >
      {children}
    </MobileAppShell>
  );
}

export { getFirstName } from "@/lib/dashboard/student-overview";
