"use client";

import Link from "next/link";
import {
  Users,
  GraduationCap,
  UserCog,
  Bell,
  ListChecks,
  Shield,
  CreditCard,
  DollarSign,
  FileText,
  KeyRound,
  Bot,
  BarChart3,
  Video,
  ChevronRight,
  Cookie,
  Globe,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "react-i18next";
import { ADMIN_CMS_PREFIX, ADMIN_PORTAL_PREFIX } from "@/lib/admin/portal-paths";

const SECTIONS = [
  {
    title: "People",
    items: [
      { href: `${ADMIN_PORTAL_PREFIX}/students`, icon: Users, labelKey: "adminNav.students", descKey: "adminHub.studentsDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/teachers`, icon: GraduationCap, labelKey: "adminNav.teachers", descKey: "adminHub.teachersDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/users`, icon: UserCog, labelKey: "adminNav.users", descKey: "adminHub.usersDesc" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: ADMIN_CMS_PREFIX, icon: Globe, labelKey: "adminNav.websiteContent", descKey: "adminHub.websiteDesc" },
    ],
  },
  {
    title: "Platform",
    items: [
      { href: `${ADMIN_PORTAL_PREFIX}/notifications`, icon: Bell, labelKey: "adminNav.notifications", descKey: "adminHub.notificationsDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/quiz-monitor`, icon: ListChecks, labelKey: "adminNav.quizMonitor", descKey: "adminHub.quizDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/moderation`, icon: Shield, labelKey: "adminNav.moderation", descKey: "adminHub.moderationDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/memberships`, icon: CreditCard, labelKey: "adminNav.memberships", descKey: "adminHub.membershipsDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/resource-access`, icon: KeyRound, labelKey: "adminNav.resourceAccess", descKey: "adminHub.resourceAccessDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/payments`, icon: DollarSign, labelKey: "adminNav.payments", descKey: "adminHub.paymentsDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/resources`, icon: FileText, labelKey: "adminNav.resources", descKey: "adminHub.resourcesDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/chatbot`, icon: Bot, labelKey: "adminNav.chatbot", descKey: "adminHub.chatbotDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/analytics`, icon: BarChart3, labelKey: "adminNav.analytics", descKey: "adminHub.analyticsDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/zoom`, icon: Video, labelKey: "adminNav.zoom", descKey: "adminHub.zoomDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/cookies`, icon: Cookie, labelKey: "adminNav.cookies", descKey: "adminHub.cookiesDesc" },
      { href: `${ADMIN_PORTAL_PREFIX}/security`, icon: Shield, labelKey: "adminNav.security", descKey: "adminHub.securityDesc" },
    ],
  },
] as const;

export function AdminNavHub() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">{section.title}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => {
              const Icon = item.icon;
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
