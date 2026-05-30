"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DashboardPageProps {
  role: "student" | "teacher" | "admin";
  titleKey: string;
  descriptionKey?: string;
  children?: React.ReactNode;
}

export function DashboardPage({ role, titleKey, descriptionKey, children }: DashboardPageProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Sidebar role={role} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-24 md:pt-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href={`/dashboard/${role}`}
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-[#0D1B2A]"
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className={`text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                {t(titleKey)}
              </h1>
            </div>
            {descriptionKey && (
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>{t(descriptionKey)}</p>
            )}
          </motion.div>

          {children ? (
            children
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className={`p-12 text-center ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                <div className="w-24 h-24 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-6">
                  <Construction className="w-12 h-12 text-[#D4AF37]" />
                </div>
                <h2 className={`text-2xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  {t("dashboardCommon.comingSoon")}
                </h2>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  {t("dashboardCommon.comingSoonDesc")}
                </p>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
