"use client";

import { MobileAppShell } from "@/components/mobile/MobileAppShell";

interface StudentDashboardLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  topRightAction?: React.ReactNode;
  hideBottomNav?: boolean;
}

export function StudentDashboardLayout({
  title,
  description,
  children,
  headerAction,
  topRightAction,
  hideBottomNav,
}: StudentDashboardLayoutProps) {
  return (
    <MobileAppShell
      role="student"
      title={title}
      description={description}
      headerAction={headerAction}
      topRightAction={topRightAction}
      hideBottomNav={hideBottomNav}
    >
      {children}
    </MobileAppShell>
  );
}

export { getFirstName } from "@/lib/dashboard/student-overview";
