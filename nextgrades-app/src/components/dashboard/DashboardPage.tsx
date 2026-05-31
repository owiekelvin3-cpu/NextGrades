"use client";

import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { appShell } from "@/lib/theme/shell";
import { useTranslation } from "react-i18next";
import { Construction, ArrowLeft } from "lucide-react";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";

interface DashboardPageProps {
  role: "student" | "teacher" | "admin";
  titleKey: string;
  descriptionKey?: string;
  children?: React.ReactNode;
}

export function DashboardPage({ role, titleKey, descriptionKey, children }: DashboardPageProps) {
  const { t } = useTranslation();
  const title = t(titleKey);
  const description = descriptionKey ? t(descriptionKey) : undefined;

  const body = (
    <>
      {role !== "teacher" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 hidden md:block">
          <div className="mb-4 flex items-center gap-4">
            <Link
              href={`/dashboard/${role}`}
              className="touch-target flex items-center justify-center rounded-xl text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
          </div>
          {descriptionKey && <p className="text-text-muted">{t(descriptionKey)}</p>}
        </motion.div>
      )}

      {role === "teacher" && description && (
        <p className="mb-6 hidden text-sm leading-relaxed text-text-muted md:block">{description}</p>
      )}

      {children ? (
        children
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-8 text-center md:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#D4AF37]/20 md:h-24 md:w-24">
              <Construction className="h-10 w-10 text-[#D4AF37] md:h-12 md:w-12" />
            </div>
            <h2 className="mb-3 text-xl font-bold text-foreground md:text-2xl">{t("dashboardCommon.comingSoon")}</h2>
            <p className="text-text-muted">{t("dashboardCommon.comingSoonDesc")}</p>
          </Card>
        </motion.div>
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

  const shellRole = role === "admin" ? "admin" : "student";

  return (
    <MobileAppShell role={shellRole} title={title} description={description}>
      <div className="mx-auto max-w-7xl">{body}</div>
    </MobileAppShell>
  );
}
