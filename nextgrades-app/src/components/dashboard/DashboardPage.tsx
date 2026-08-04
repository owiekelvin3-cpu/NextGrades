"use client";

import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Construction } from "lucide-react";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";
import { StudentDashboardLayout } from "@/components/dashboard/student/StudentDashboardLayout";
import { isAdminPortalPath } from "@/lib/admin/portal-paths";

interface DashboardPageProps {
  role: "student" | "teacher" | "admin";
  titleKey: string;
  descriptionKey?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function DashboardPage({ role, titleKey, descriptionKey, children, actions }: DashboardPageProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const inAdminPortal = role === "admin" && isAdminPortalPath(pathname);
  const title = t(titleKey);
  const description = descriptionKey ? t(descriptionKey) : undefined;

  const body = (
    <>
      {role === "admin" && inAdminPortal ? (
        <AdminPageHeader title={title} description={description} actions={actions} />
      ) : role === "admin" && !inAdminPortal ? (
        <div className="mb-6 hidden md:block">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
          {description ? <p className="mt-1 text-text-muted">{description}</p> : null}
        </div>
      ) : null}

      {role === "teacher" && description ? (
        <p className="mb-6 hidden text-sm leading-relaxed text-text-muted md:block">{description}</p>
      ) : null}

      {children ? (
        children
      ) : (
        <div>
          <Card hoverable={false} className="p-8 text-center md:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-gold-muted)] md:h-24 md:w-24">
              <Construction className="h-10 w-10 text-[var(--brand-gold)] md:h-12 md:w-12" />
            </div>
            <h2 className="mb-3 text-xl font-bold text-foreground md:text-2xl">{t("dashboardCommon.comingSoon")}</h2>
            <p className="text-text-muted">{t("dashboardCommon.comingSoonDesc")}</p>
          </Card>
        </div>
      )}
    </>
  );

  if (role === "teacher") {
    return (
      <TeacherDashboardLayout title={title} description={description}>
        <div className="mx-auto max-w-7xl">{body}</div>
      </TeacherDashboardLayout>
    );
  }

  if (role === "student") {
    return (
      <StudentDashboardLayout title={title} description={description}>
        <div className="mx-auto max-w-6xl">{body}</div>
      </StudentDashboardLayout>
    );
  }

  const shellRole = role === "admin" ? "admin" : "student";

  if (inAdminPortal) {
    return <div className="mx-auto max-w-7xl">{body}</div>;
  }

  return (
    <MobileAppShell role={shellRole} title={title} description={description}>
      <div className="mx-auto max-w-7xl">{body}</div>
    </MobileAppShell>
  );
}
