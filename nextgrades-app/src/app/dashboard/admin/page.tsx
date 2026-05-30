"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  TrendingUp,
  FileText,
  Calendar,
  ArrowRight,
  Plus,
  Shield,
  DollarSign,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import {
  fetchAdminStats,
  fetchActivityLogs,
  type ActivityLogRow,
  type AdminStats,
} from "@/lib/dashboard/data";

export default function AdminDashboard() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityLogRow[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total_students: 0,
    total_teachers: 0,
    active_enrollments: 0,
    total_earnings: 0,
  });

  useEffect(() => {
    (async () => {
      const [statsData, activityData] = await Promise.all([fetchAdminStats(), fetchActivityLogs(10)]);
      setStats(statsData);
      setActivities(activityData);
    })();
  }, []);

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Sidebar role="admin" />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 md:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                {t("adminDashboard.title")}
              </h1>
              <p className={`mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {t("adminDashboard.subtitle")}
              </p>
            </div>
            <Button variant="gold" size="md" href="/dashboard/admin/students">
              <Plus className="w-5 h-5 mr-2" />
              {t("adminDashboard.newUser")}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#4DA3FF]/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#4DA3FF]" />
                  </div>
                  <Badge variant="gold">{t("adminDashboard.students")}</Badge>
                </div>
                <p className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  {stats.total_students}
                </p>
                <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {t("adminDashboard.activeStudents")}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#22C55E]" />
                  </div>
                  <Badge variant="success">{t("adminDashboard.teachers")}</Badge>
                </div>
                <p className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  {stats.total_teachers}
                </p>
                <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {t("adminDashboard.activeTeachers")}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <Badge variant="warning">{t("adminDashboard.courses")}</Badge>
                </div>
                <p className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  {stats.active_enrollments}
                </p>
                <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {t("adminDashboard.activeCourses")}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <Badge variant="warning">{t("adminDashboard.revenue")}</Badge>
                </div>
                <p className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  €{stats.total_earnings.toLocaleString("de-DE")}
                </p>
                <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {t("adminDashboard.totalRevenueMonthly")}
                </p>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div>
              <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                <h2 className={`text-xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  {t("adminDashboard.quickActions")}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="md"
                    href="/dashboard/admin/students"
                    className={`w-full justify-start ${
                      theme === "dark"
                        ? "border-white/20 text-white hover:bg-white/10"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Users className="w-5 h-5 mr-3" />
                    {t("adminDashboard.manageStudents")}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    href="/dashboard/admin/teachers"
                    className={`w-full justify-start ${
                      theme === "dark"
                        ? "border-white/20 text-white hover:bg-white/10"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Shield className="w-5 h-5 mr-3" />
                    {t("adminDashboard.manageTeachers")}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    href="/dashboard/admin/payments"
                    className={`w-full justify-start ${
                      theme === "dark"
                        ? "border-white/20 text-white hover:bg-white/10"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <DollarSign className="w-5 h-5 mr-3" />
                    {t("adminDashboard.managePayments")}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    href="/dashboard/admin/website-content"
                    className={`w-full justify-start ${
                      theme === "dark"
                        ? "border-white/20 text-white hover:bg-white/10"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FileText className="w-5 h-5 mr-3" />
                    {t("adminDashboard.manageResources")}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                <h2 className={`text-xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  {t("adminDashboard.recentActivity")}
                </h2>
                <ul className="space-y-4">
                  {activities.length === 0 ? (
                    <li className={`p-4 rounded-xl text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      {t("adminDashboard.subtitle")}
                    </li>
                  ) : null}
                  {activities.map((activity, index) => (
                    <motion.li
                      key={activity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`flex items-center gap-4 p-3 rounded-xl ${
                        theme === "dark" ? "bg-[#0D1B2A]" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                          {activity.title}
                        </p>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          {activity.time}
                        </p>
                      </div>
                      <Badge variant={activity.type}>{activity.type}</Badge>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          {/* Platform Overview */}
          <div className="mt-8">
            <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  {t("adminDashboard.quickActions")}
                </h2>
                <Button variant="secondary" size="sm" href="/dashboard/admin/analytics">
                  {t("dashboardCommon.showAll")} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className={`p-4 rounded-xl border ${theme === "dark" ? "border-white/10 bg-[#0D1B2A]" : "border-gray-200 bg-white"}`}>
                  <h3 className={`font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                    {t("dashboardPages.admin.analytics.title")}
                  </h3>
                  <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {t("adminDashboard.recentActivity")}
                  </p>
                  <Button variant="outline" size="sm" className="w-full" href="/dashboard/admin/analytics">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t("dashboardCommon.showAll")}
                  </Button>
                </div>

                <div className={`p-4 rounded-xl border ${theme === "dark" ? "border-white/10 bg-[#0D1B2A]" : "border-gray-200 bg-white"}`}>
                  <h3 className={`font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                    {t("adminDashboard.revenue")}
                  </h3>
                  <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {t("adminDashboard.totalRevenueMonthly")}
                  </p>
                  <Button variant="outline" size="sm" className="w-full" href="/dashboard/admin/analytics">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {t("dashboardCommon.showAll")}
                  </Button>
                </div>

                <div className={`p-4 rounded-xl border ${theme === "dark" ? "border-white/10 bg-[#0D1B2A]" : "border-gray-200 bg-white"}`}>
                  <h3 className={`font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                    {t("dashboardPages.admin.websiteContent.title", { defaultValue: "Website content" })}
                  </h3>
                  <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {t("dashboardPages.admin.websiteContent.description", { defaultValue: "Manage site copy and media" })}
                  </p>
                  <Button variant="outline" size="sm" className="w-full" href="/dashboard/admin/website-content">
                    <Shield className="w-4 h-4 mr-2" />
                    {t("adminDashboard.manageResources")}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
