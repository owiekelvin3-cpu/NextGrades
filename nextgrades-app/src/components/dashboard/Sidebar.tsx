
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import {
  Home,
  BookOpen,
  Calendar,
  Video,
  TrendingUp,
  Settings,
  LogOut,
  Brain,
  FileText,
  Users,
  DollarSign,
  Shield,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "student" | "teacher" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();

  const studentLinks = [
    { href: "/dashboard/student", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/student/courses", icon: BookOpen, label: "Meine Kurse" },
    { href: "/dashboard/student/appointments", icon: Calendar, label: "Termine" },
    { href: "/dashboard/student/resources", icon: FileText, label: "Materialien" },
    { href: "/dashboard/student/quizzes", icon: Brain, label: "KI-Quizze" },
    { href: "/dashboard/student/progress", icon: TrendingUp, label: "Fortschritt" },
    { href: "/dashboard/student/settings", icon: Settings, label: "Einstellungen" },
  ];

  const teacherLinks = [
    { href: "/dashboard/teacher", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/teacher/students", icon: Users, label: "Schüler:innen" },
    { href: "/dashboard/teacher/schedule", icon: Calendar, label: "Terminplanung" },
    { href: "/dashboard/teacher/resources", icon: FileText, label: "Ressourcen" },
    { href: "/dashboard/teacher/ai-generator", icon: Brain, label: "KI-Generator" },
    { href: "/dashboard/teacher/earnings", icon: DollarSign, label: "Einnahmen" },
    { href: "/dashboard/teacher/settings", icon: Settings, label: "Einstellungen" },
  ];

  const adminLinks = [
    { href: "/dashboard/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/admin/students", icon: Users, label: "Schüler:innen" },
    { href: "/dashboard/admin/teachers", icon: Users, label: "Lehrer:innen" },
    { href: "/dashboard/admin/memberships", icon: Shield, label: "Mitgliedschaften" },
    { href: "/dashboard/admin/payments", icon: DollarSign, label: "Zahlungen" },
    { href: "/dashboard/admin/resources", icon: FileText, label: "Ressourcen" },
    { href: "/dashboard/admin/analytics", icon: TrendingUp, label: "Analysen" },
  ];

  const links = role === "student" ? studentLinks : role === "teacher" ? teacherLinks : adminLinks;

  return (
    <aside className={`w-64 min-h-screen p-6 flex flex-col ${theme === "dark" ? "bg-[#0D1B2A] text-white" : "bg-white text-[#0D1B2A] border-r border-gray-100"}`}>
      <div className="mb-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center">
            <span className="text-[#0D1B2A] font-bold text-xl">NG</span>
          </div>
          <span className="text-xl font-bold">NextGrades</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-[#D4AF37] text-[#0D1B2A] font-semibold"
                  : theme === "dark"
                  ? "text-gray-300 hover:bg-white/10 hover:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#0D1B2A]"
              )}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={`pt-6 border-t ${theme === "dark" ? "border-white/10" : "border-gray-100"}`}>
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            theme === "dark"
              ? "text-gray-300 hover:bg-white/10 hover:text-white"
              : "text-gray-600 hover:bg-gray-50 hover:text-[#0D1B2A]"
          )}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
