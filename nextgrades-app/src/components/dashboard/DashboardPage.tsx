"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Construction, ArrowLeft } from "lucide-react";

interface DashboardPageProps {
  role: "student" | "teacher" | "admin";
  titleKey: string;
  descriptionKey?: string;
  children?: React.ReactNode;
}

export function DashboardPage({ role, titleKey, descriptionKey, children }: DashboardPageProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const title = t(titleKey);
  const description = descriptionKey ? t(descriptionKey) : undefined;

  const body = (
    <>
      {role !== "teacher" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <Link
              href={`/dashboard/${role}`}
              className={`rounded-lg p-2 transition-colors ${
                theme === "dark" ? "text-white hover:bg-white/10" : "text-[#0D1B2A] hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className={`text-2xl font-bold md:text-3xl ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
              {title}
            </h1>
          </div>
          {descriptionKey && (
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>{t(descriptionKey)}</p>
          )}
        </motion.div>
      )}

      {role === "teacher" && description && (
        <p className={`mb-8 text-sm leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          {description}
        </p>
      )}

      {children ? (
        children
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={`p-12 text-center ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#D4AF37]/20">
              <Construction className="h-12 w-12 text-[#D4AF37]" />
            </div>
            <h2 className={`mb-3 text-2xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
              {t("dashboardCommon.comingSoon")}
            </h2>
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              {t("dashboardCommon.comingSoonDesc")}
            </p>
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

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Sidebar role={role} />
      <main className="flex-1 p-4 pt-24 sm:p-6 md:pt-8 lg:p-8">
        <div className="mx-auto max-w-7xl">{body}</div>
      </main>
    </div>
  );
}
