"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_SECTIONS } from "@/lib/admin/admin-nav";
import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";
import { useNotificationsOptional } from "@/context/NotificationContext";
import { supabase } from "@/lib/supabase/client";

type Props = {
  onNavigate?: () => void;
  onLogout: () => void;
};

type AdminProfile = {
  full_name: string | null;
  email: string | null;
};

function isLinkActive(pathname: string, href: string) {
  if (href === ADMIN_PORTAL_HOME) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebarNav({ onNavigate, onLogout }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const notifCtx = useNotificationsOptional();
  const badgeCount = notifCtx?.unreadCount ?? 0;
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();
      setProfile({
        full_name: data?.full_name ?? (user.user_metadata?.full_name as string | null) ?? null,
        email: data?.email ?? user.email ?? null,
      });
    })();
  }, []);

  const displayName = profile?.full_name?.trim() || t("adminNav.adminUser");
  const initial = (displayName.charAt(0) || "A").toUpperCase();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
        {ADMIN_NAV_SECTIONS.map((section, sectionIndex) => (
          <div key={section.id}>
            {sectionIndex > 0 ? (
              <div className="mb-3 border-t border-[var(--sidebar-border)]/80" aria-hidden />
            ) : null}
            <p className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--sidebar-text)]/80">
              {t(section.labelKey)}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isLinkActive(pathname, item.href);
                const showBadge = item.badge === "notifications" && badgeCount > 0;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-[var(--brand-gold-muted)] text-[var(--brand-gold)] shadow-[inset_0_0_0_1px_rgba(212,175,55,0.18)]"
                          : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-surface)] hover:text-[var(--sidebar-text-active)]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                          active
                            ? "bg-[var(--brand-gold)]/15 text-[var(--brand-gold)]"
                            : "bg-[var(--sidebar-surface)] text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text-active)]"
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="flex-1 truncate">{t(item.labelKey)}</span>
                      {showBadge ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-gold)] px-1 text-[10px] font-bold text-[var(--brand-navy)]">
                          {badgeCount > 9 ? "9+" : badgeCount}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto shrink-0 border-t border-[var(--sidebar-border)]/80 pt-4">
        <div className="mb-2 flex items-center gap-3 rounded-xl border border-[var(--sidebar-border)]/60 bg-[var(--sidebar-surface)] px-3 py-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-gold-muted)] to-[var(--brand-gold)]/20 text-sm font-bold text-[var(--brand-gold)] ring-1 ring-[var(--brand-gold)]/20">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--sidebar-text-active)]">{displayName}</p>
            <p className="truncate text-xs text-[var(--sidebar-text)]">{profile?.email ?? ""}</p>
          </div>
          <User className="h-4 w-4 shrink-0 text-[var(--sidebar-text)]" aria-hidden />
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-surface)] hover:text-[var(--sidebar-text-active)]"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span>{t("dashboardNav.logout")}</span>
        </button>
      </div>
    </div>
  );
}
