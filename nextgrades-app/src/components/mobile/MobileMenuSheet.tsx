"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, X, Settings, LayoutDashboard, Sparkles, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNotificationsOptional } from "@/context/NotificationContext";
import { BrandLogo } from "@/components/BrandLogo";
import { dashboardHomeForRole } from "@/lib/brand";
import { ADMIN_PORTAL_HOME, ADMIN_PORTAL_PREFIX } from "@/lib/admin/portal-paths";
import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  role: "student" | "teacher" | "admin";
};

function homeHref(role: Props["role"]) {
  if (role === "teacher") return "/dashboard/teacher";
  if (role === "admin") return ADMIN_PORTAL_HOME;
  return "/dashboard/student";
}

function profileHref(role: Props["role"]) {
  if (role === "teacher") return "/dashboard/teacher/settings";
  if (role === "admin") return `${ADMIN_PORTAL_PREFIX}/users`;
  return "/dashboard/student/settings";
}

function searchHref(role: Props["role"]) {
  if (role === "teacher") return "/dashboard/teacher/resources";
  if (role === "admin") return `${ADMIN_PORTAL_PREFIX}/resources`;
  return "/dashboard/student/resources";
}

export function MobileMenuSheet({ open, onClose, role }: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const notifCtx = useNotificationsOptional();
  const unread = notifCtx?.unreadCount ?? 0;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const links = [
    { href: homeHref(role), icon: LayoutDashboard, label: t("mobileNav.home") },
    { href: searchHref(role), icon: Search, label: t("resources.searchPlaceholder", { defaultValue: "Search" }) },
    { href: "/dashboard/chat", icon: Sparkles, label: t("mobileNav.aiChat", { defaultValue: "NextGrades AI" }) },
    { href: "/dashboard/notifications", icon: Bell, label: t("mobileNav.notifications"), badge: unread },
    { href: profileHref(role), icon: Settings, label: t("mobileNav.settings") },
    { href: "/", icon: Home, label: t("dashboardNav.backToHomepage", { defaultValue: "Back to Homepage" }) },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(100%,320px)] flex-col bg-surface-elevated shadow-2xl md:hidden"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          >
            <div className="flex h-[4.5rem] items-center justify-between border-b border-border-default/60 px-5">
              <BrandLogo href={dashboardHomeForRole(role)} size="lg" />
              <button
                type="button"
                onClick={onClose}
                className={cn(mobile.touchTarget, "flex items-center justify-center rounded-2xl text-text-muted")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <ul className="space-y-2">
                {links.map(({ href, icon: Icon, label, badge }) => (
                  <li key={href + label}>
                    <Link
                      href={href}
                      className={cn(
                        mobile.menuItem,
                        pathname === href || pathname.startsWith(href + "/")
                          ? "bg-[#D4AF37]/10 text-foreground"
                          : "text-text-muted"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                      <span className="flex-1 font-medium">{label}</span>
                      {badge !== undefined && badge > 0 && (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                          {badge > 9 ? "9+" : badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-border-default/60 px-5 py-5 safe-bottom">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-muted">Theme</span>
                <ThemeToggle variant="icon" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
