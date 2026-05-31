"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, X, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotificationsOptional } from "@/context/NotificationContext";
import { formatRelativeTime, typeIconColor } from "@/lib/notifications/format";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Use on dark backgrounds (sidebar, dark header) */
  variant?: "light" | "dark";
};

export function NotificationBell({ className, variant = "dark" }: Props) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const ctx = useNotificationsOptional();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = ctx?.unreadCount ?? 0;
  const recent = ctx?.notifications.slice(0, 5) ?? [];
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
          "relative rounded-xl p-2.5 transition-colors",
          onDarkBg
            ? "text-gray-300 hover:bg-white/10 hover:text-white"
            : "text-gray-500 hover:bg-gray-100 hover:text-[#0D1B2A]"
        )}
        aria-label={t("notifications.bell", { defaultValue: "Notifications" })}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "z-50 overflow-hidden rounded-2xl border shadow-xl",
              "fixed left-4 right-4 top-[4.25rem] max-h-[min(70vh,420px)] md:absolute md:inset-x-auto md:left-auto md:right-0 md:top-full md:mt-2 md:w-[min(100vw-2rem,380px)] md:max-h-none",
              onDarkBg
                ? "border-white/10 bg-[#112240] text-white"
                : "border-gray-200 bg-white text-[#0D1B2A]"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between border-b px-4 py-3",
                onDarkBg ? "border-white/10" : "border-gray-100"
              )}
            >
              <div>
                <h3 className="text-sm font-semibold">
                  {t("notifications.title", { defaultValue: "Notifications" })}
                </h3>
                {unreadCount > 0 && (
                  <p className="text-[11px] text-gray-500">
                    {t("notifications.unreadCount", { count: unreadCount, defaultValue: `${unreadCount} unread` })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {ctx && unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void ctx.markAllRead()}
                    className={cn(
                      "rounded-lg p-1.5 transition",
                      onDarkBg ? "text-gray-400 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100"
                    )}
                    title={t("notifications.markAllRead", { defaultValue: "Mark all read" })}
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg p-1.5 transition",
                    onDarkBg ? "text-gray-400 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[280px] overflow-y-auto md:max-h-[340px]">
              {!ctx || recent.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-10 text-center">
                  <Bell className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">
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
                          "flex w-full gap-3 px-4 py-3 text-left transition",
                          onDarkBg ? "hover:bg-white/5" : "hover:bg-gray-50",
                          !n.is_read && (onDarkBg ? "bg-[#D4AF37]/10" : "bg-[#D4AF37]/5")
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
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
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={cn("border-t px-4 py-2.5", onDarkBg ? "border-white/10" : "border-gray-100")}>
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1 text-xs font-medium text-[#D4AF37] hover:underline"
              >
                {t("notifications.viewAll", { defaultValue: "View all notifications" })}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
