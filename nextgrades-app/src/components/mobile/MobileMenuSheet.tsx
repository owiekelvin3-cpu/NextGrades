"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useNotificationsOptional } from "@/context/NotificationContext";
import { BrandLogo } from "@/components/BrandLogo";
import { MobileDrawer } from "@/components/mobile/MobileDrawer";
import { dashboardHomeForRole } from "@/lib/brand";
import { getDashboardMenuItems, isDashboardMenuItemActive } from "@/lib/mobile/dashboard-menu";
import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  role: "student" | "teacher" | "admin";
};

export function MobileMenuSheet({ open, onClose, role }: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const notifCtx = useNotificationsOptional();
  const unread = notifCtx?.unreadCount ?? 0;
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      onClose();
      prevPath.current = pathname;
    }
  }, [pathname, onClose]);

  const items = getDashboardMenuItems(role);

  return (
    <MobileDrawer
      open={open}
      onClose={onClose}
      ariaLabel={t("mobileNav.main", { defaultValue: "Main navigation" })}
      panelClassName="bg-[var(--sidebar-background)] text-[var(--sidebar-text-active)]"
      header={<BrandLogo href={dashboardHomeForRole(role)} size="lg" onDarkBackground />}
      footer={
        <div className="space-y-4">
          <LanguageSwitcher layout="drawer" />
          <Link
            href="/"
            onClick={onClose}
            className={cn(mobile.menuItem, "text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)]")}
          >
            <Home className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <span className="font-medium">{t("dashboardNav.backToHomepage", { defaultValue: "Back to Homepage" })}</span>
          </Link>
        </div>
      }
    >
      <nav className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = isDashboardMenuItemActive(pathname, item);
            const showBadge = item.badge === "notifications" && unread > 0;
            const Icon = item.icon;
            return (
              <li key={`${item.href}-${item.labelKey}`}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    mobile.menuItem,
                    active
                      ? "bg-[var(--sidebar-surface)] font-semibold text-[var(--sidebar-text-active)]"
                      : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-surface)] hover:text-[var(--sidebar-text-active)]"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2 : 1.75} />
                  <span className="flex-1">{t(item.labelKey)}</span>
                  {showBadge && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </MobileDrawer>
  );
}
