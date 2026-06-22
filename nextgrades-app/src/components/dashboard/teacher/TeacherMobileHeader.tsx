"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { MobileMenuSheet } from "@/components/mobile/MobileMenuSheet";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

type Props = {
  displayName: string;
};

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

/** Mobile teacher header — theme-aware (light surface / dark navy). */
export function TeacherMobileHeader({ displayName }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [menuOpen, setMenuOpen] = useState(false);
  const firstName = getFirstName(displayName) || t("teacherDashboard.sidebarGuest");

  return (
    <>
      <header
        className={cn(
          "relative shrink-0 overflow-hidden border-b pb-6 md:hidden",
          isDark
            ? "border-white/10 bg-[var(--brand-navy)]"
            : "border-border-default bg-surface-elevated"
        )}
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        {isDark && (
          <>
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#D4AF37]/15"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-[#D4AF37]/8 blur-2xl"
              aria-hidden
            />
          </>
        )}

        <div className="relative z-10 px-5 pt-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  isDark ? "text-white/70" : "text-text-muted"
                )}
              >
                {t("teacherDashboard.welcome", { defaultValue: "Welcome back! 👋" })}
              </p>
              <h1
                className={cn(
                  "mt-0.5 truncate text-xl font-bold tracking-tight sm:text-2xl",
                  isDark ? "text-white" : "text-foreground"
                )}
              >
                {firstName}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <NotificationBell variant={isDark ? "light" : "dark"} />
              <button
                type="button"
                aria-label={t("mobileNav.menu", { defaultValue: "Menu" })}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl transition active:scale-95",
                  isDark
                    ? "bg-white/10 text-white"
                    : "border border-border-default bg-surface-subtle text-foreground"
                )}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          <Link
            href="/dashboard/teacher/students"
            className={cn(
              "mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-sm transition active:scale-[0.99]",
              isDark
                ? "border-white/10 bg-[var(--surface-elevated)] shadow-black/20"
                : "border-border-default bg-surface-subtle"
            )}
          >
            <Search className="h-5 w-5 shrink-0 text-[var(--brand-gold)]" />
            <span className="text-sm text-text-muted">
              {t("teacherDashboard.searchStudents", { defaultValue: "Search students…" })}
            </span>
          </Link>
        </div>
      </header>

      <MobileMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} role="teacher" />
    </>
  );
}
