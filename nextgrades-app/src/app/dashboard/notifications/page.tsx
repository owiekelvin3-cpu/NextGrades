"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { fetchProfileSettings } from "@/lib/dashboard/profile-settings";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");

  useEffect(() => {
    fetchProfileSettings().then((p) => {
      if (p?.role === "teacher" || p?.role === "admin" || p?.role === "student") {
        setRole(p.role);
      }
    });
  }, []);

  const content = <NotificationCenter />;

  if (role === "teacher") {
    return (
      <TeacherDashboardLayout title={t("notifications.title", { defaultValue: "Notifications" })}>
        {content}
      </TeacherDashboardLayout>
    );
  }

  return (
    <div className={cn("flex min-h-screen", theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#F0F2F5]")}>
      <Sidebar role={role} />
      <main className="flex-1 p-4 pt-20 sm:p-6 md:pt-8 lg:p-8">
        <div className="mx-auto max-w-3xl">{content}</div>
      </main>
    </div>
  );
}
