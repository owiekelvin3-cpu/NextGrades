"use client";

import Link from "next/link";
import {
  Layout,
  Users,
  GraduationCap,
  UserCog,
  Bell,
  ListChecks,
  Shield,
  CreditCard,
  DollarSign,
  FileText,
  Bot,
  BarChart3,
  Video,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "react-i18next";
import { ADMIN_PORTAL_PREFIX } from "@/lib/admin/portal-paths";

const SECTIONS = [
  {
    title: "Website",
    items: [
      {
        href: `${ADMIN_PORTAL_PREFIX}/website-content`,
        icon: Layout,
        labelKey: "adminNav.websiteContent",
        descKey: "adminHub.websiteDesc",
        highlight: true,
      },
    ],
  },
  {
    title: "People",
    items: [
      { href: `${ADMIN_PORTAL_PREFIX}/students`, icon: Users, labelKey: "adminNav.students", descKey: "adminHub.studentsDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/teachers`, icon: GraduationCap, labelKey: "adminNav.teachers", descKey: "adminHub.teachersDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/users`, icon: UserCog, labelKey: "adminNav.users", descKey: "adminHub.usersDesc" },
    ],
  },
  {
    title: "Platform",
    items: [
      { href: `${ADMIN_PORTAL_PREFIX}/notifications`, icon: Bell, labelKey: "adminNav.notifications", descKey: "adminHub.notificationsDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/quiz-monitor`, icon: ListChecks, labelKey: "adminNav.quizMonitor", descKey: "adminHub.quizDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/moderation`, icon: Shield, labelKey: "adminNav.moderation", descKey: "adminHub.moderationDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/memberships`, icon: CreditCard, labelKey: "adminNav.memberships", descKey: "adminHub.membershipsDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/payments`, icon: DollarSign, labelKey: "adminNav.payments", descKey: "adminHub.paymentsDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/resources`, icon: FileText, labelKey: "adminNav.resources", descKey: "adminHub.resourcesDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/chatbot`, icon: Bot, labelKey: "adminNav.chatbot", descKey: "adminHub.chatbotDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/analytics`, icon: BarChart3, labelKey: "adminNav.analytics", descKey: "adminHub.analyticsDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/zoom`, icon: Video, labelKey: "adminNav.zoom", descKey: "adminHub.zoomDesc" },
    ],
  },
] as const;

export function AdminNavHub() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <Link
        href={`${ADMIN_PORTAL_PREFIX}/website-content`}
        className="group block overflow-hidden rounded-2xl border-2 border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 via-[#D4AF37]/10 to-transparent p-6 transition-all hover:border-[#D4AF37] hover:shadow-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              {t("adminHub.featuredLabel", { defaultValue: "Most important" })}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">
              {t("adminNav.websiteContent")}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-text-muted">
              {t("adminHub.websiteDesc")}
            </p>
          </div>
          <Layout className="h-10 w-10 shrink-0 text-[#D4AF37] transition-transform group-hover:scale-110" />
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#D4AF37]">
          {t("adminHub.openEditor", { defaultValue: "Open website editor" })}
          <ChevronRight className="h-4 w-4" />
        </span>
      </Link>

      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">{section.title}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => {
              const Icon = item.icon;
              const highlight = "highlight" in item && item.highlight;
              if (highlight) return null;
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="group flex h-full items-start gap-4 p-4 transition-all hover:border-[#D4AF37]/40 hover:shadow-md">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15">
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground group-hover:text-[#D4AF37]">
                        {t(item.labelKey)}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">{t(item.descKey)}</p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

    </div>
  );
}
