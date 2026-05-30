"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotificationsOptional } from "@/context/NotificationContext";
import { formatRelativeTime, typeIconColor } from "@/lib/notifications/format";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

type Props = {
  className?: string;
  /** Light header on dark bg vs dark text */
  variant?: "light" | "dark";
};

export function NotificationBell({ className, variant = "dark" }: Props) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const ctx = useNotificationsOptional();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = ctx?.unreadCount ?? 0;
  const recent = ctx?.notifications.slice(0, 6) ?? [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleClick = async (id: string, url: string | null, isRead: boolean) => {
    if (!isRead && ctx) await ctx.markRead(id);
    setOpen(false);
    if (url) router.push(url);
    else router.push("/dashboard/notifications");
  };

  const isDark = variant === "light" || theme === "dark";

  return (
    <div ref={panelRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "relative rounded-xl p-2.5 transition-colors",
          isDark
            ? "text-gray-400 hover:bg-white/10 hover:text-white"
            : "text-gray-500 hover:bg-gray-100 hover:text-[#0D1B2A]"
        )}
        aria-label={t("notifications.bell", { defaultValue: "Notifications" })}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 z-50 mt-2 w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl border shadow-xl",
            isDark
              ? "border-white/10 bg-[#112240] text-white"
              : "border-gray-200 bg-white text-[#0D1B2A]"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between border-b px-4 py-3",
              isDark ? "border-white/10" : "border-gray-100"
            )}
          >
            <h3 className="text-sm font-semibold">
              {t("notifications.title", { defaultValue: "Notifications" })}
            </h3>
            <div className="flex items-center gap-1">
              {ctx && unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void ctx.markAllRead()}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10"
                  title={t("notifications.markAllRead", { defaultValue: "Mark all read" })}
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {!ctx || recent.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-500">
                {t("notifications.empty", { defaultValue: "No notifications yet." })}
              </div>
            ) : (
              <ul>
                {recent.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => void handleClick(n.id, n.action_url, n.is_read)}
                      className={cn(
                        "flex w-full gap-3 px-4 py-3 text-left transition",
                        isDark ? "hover:bg-white/5" : "hover:bg-gray-50",
                        !n.is_read && (isDark ? "bg-[#D4AF37]/5" : "bg-[#D4AF37]/5")
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          typeIconColor(n.type)
                        )}
                      >
                        {(n.title || "?").charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm", !n.is_read && "font-semibold")}>{n.title}</p>
                        {n.message && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n.message}</p>
                        )}
                        <p className="mt-1 text-[11px] text-gray-400">
                          {formatRelativeTime(n.created_at, i18n.language)}
                        </p>
                      </div>
                      {!n.is_read && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={cn("border-t px-4 py-2.5", isDark ? "border-white/10" : "border-gray-100")}>
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-medium text-[#D4AF37] hover:underline"
            >
              {t("notifications.viewAll", { defaultValue: "View all notifications" })}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
