"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, X, ArrowRight, BellRing } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotificationsOptional } from "@/context/NotificationContext";
import { formatRelativeTime, categoryLabel } from "@/lib/notifications/format";
import type { NotificationCategory } from "@/lib/notifications/types";
import { NotificationCategoryIcon } from "@/components/notifications/NotificationCategoryIcon";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "light" | "dark";
};

export function NotificationBell({ className, variant = "dark" }: Props) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const ctx = useNotificationsOptional();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = ctx?.unreadCount ?? 0;
  const recent = ctx?.notifications.slice(0, 6) ?? [];
  const onDarkBg = variant === "light";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleClick = async (id: string, url: string | null, isRead: boolean) => {
    if (!isRead && ctx) await ctx.markRead(id);
    setOpen(false);
    if (url) router.push(url);
    else router.push("/dashboard/notifications");
  };

  return (
    <div ref={panelRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex min-h-12 min-w-12 items-center justify-center rounded-xl transition-colors touch-manipulation",
          onDarkBg
            ? "text-gray-300 hover:bg-white/10 hover:text-white"
            : "text-gray-500 hover:bg-gray-100 hover:text-[#0D1B2A]"
        )}
        aria-label={t("notifications.bell", { defaultValue: "Notifications" })}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[10px] font-bold text-[#0D1B2A] ring-2 ring-white dark:ring-[#0D1B2A]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] md:hidden" aria-hidden onClick={() => setOpen(false)} />
          <div
            className={cn(
              "z-50 overflow-hidden rounded-2xl border shadow-2xl",
              "fixed left-3 right-3 top-[4.25rem] max-h-[min(75vh,480px)]",
              "md:absolute md:inset-x-auto md:left-auto md:right-0 md:top-full md:mt-2 md:w-[min(100vw-2rem,400px)] md:max-h-none",
              onDarkBg ? "border-white/10 bg-[#112240]" : "border-gray-200/80 bg-white"
            )}
          >
            {/* Header */}
            <div
              className={cn(
                "relative overflow-hidden border-b px-4 py-4",
                onDarkBg ? "border-white/10 bg-[#0D1B2A]" : "border-gray-100 bg-gradient-to-r from-[#0D1B2A] to-[#1a3354]"
              )}
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#D4AF37]/10" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4AF37]/15">
                    <BellRing className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {t("notifications.title", { defaultValue: "Notifications" })}
                    </h3>
                    <p className="text-[11px] text-gray-300">
                      {unreadCount > 0
                        ? t("notifications.unreadCount", { count: unreadCount, defaultValue: `${unreadCount} unread` })
                        : t("notifications.allCaughtUp", { defaultValue: "You're all caught up" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {ctx && unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => void ctx.markAllRead()}
                      className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
                      title={t("notifications.markAllRead", { defaultValue: "Mark all read" })}
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[320px] overflow-y-auto md:max-h-[360px]">
              {!ctx || recent.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
                    <Bell className="h-6 w-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {t("notifications.emptyTitle", { defaultValue: "You're all caught up" })}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {t("notifications.empty", { defaultValue: "No notifications yet." })}
                  </p>
                </div>
              ) : (
                <ul className={cn("divide-y", onDarkBg ? "divide-white/10" : "divide-gray-100")}>
                  {recent.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => void handleClick(n.id, n.action_url, n.is_read)}
                        className={cn(
                          "flex w-full gap-3 px-4 py-3.5 text-left transition",
                          onDarkBg ? "hover:bg-white/5" : "hover:bg-gray-50/80",
                          !n.is_read && (onDarkBg ? "bg-[#D4AF37]/8" : "bg-[#FFF9E6]/50")
                        )}
                      >
                        <NotificationCategoryIcon
                          category={n.category as NotificationCategory}
                          type={n.type}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("truncate text-sm text-foreground", !n.is_read && "font-semibold")}>
                              {n.title}
                            </p>
                            {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" />}
                          </div>
                          {n.message && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n.message}</p>
                          )}
                          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-gray-400">
                            <span>{formatRelativeTime(n.created_at, i18n.language)}</span>
                            <span>·</span>
                            <span>{categoryLabel(n.category as NotificationCategory, i18n.language)}</span>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className={cn("border-t p-3", onDarkBg ? "border-white/10 bg-[#0D1B2A]/50" : "border-gray-100 bg-gray-50/80")}>
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-semibold text-[#0D1B2A] transition hover:bg-[#c9a030]"
              >
                {t("notifications.viewAll", { defaultValue: "View all notifications" })}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
