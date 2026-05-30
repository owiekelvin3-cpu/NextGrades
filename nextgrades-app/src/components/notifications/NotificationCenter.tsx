"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Loader2,
  Inbox,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { NOTIFICATION_CATEGORIES } from "@/lib/notifications/types";
import { formatRelativeTime, categoryLabel, typeIconColor } from "@/lib/notifications/format";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";

export function NotificationCenter() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    categoryFilter,
    setCategoryFilter,
    markRead,
    markAllRead,
    deleteNotification,
    loadMore,
  } = useNotifications();

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) void loadMore();
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, loadMore]);

  const isDark = theme === "dark";

  const handleOpen = async (id: string, url: string | null, isRead: boolean) => {
    if (!isRead) await markRead(id);
    if (url) router.push(url);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className={cn(
              "text-2xl font-bold",
              isDark ? "text-white" : "text-[#0D1B2A]"
            )}
          >
            {t("notifications.title", { defaultValue: "Notifications" })}
          </h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {t("notifications.unreadCount", {
                count: unreadCount,
                defaultValue: `${unreadCount} unread`,
              })}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => void markAllRead()}>
            <CheckCheck className="mr-2 h-4 w-4" />
            {t("notifications.markAllRead", { defaultValue: "Mark all read" })}
          </Button>
        )}
      </div>

      {/* Category filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter(null)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition",
            !categoryFilter
              ? "bg-[#D4AF37] text-[#0D1B2A]"
              : isDark
                ? "bg-white/10 text-gray-300 hover:bg-white/15"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {t("notifications.all", { defaultValue: "All" })}
        </button>
        {NOTIFICATION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              categoryFilter === cat
                ? "bg-[#D4AF37] text-[#0D1B2A]"
                : isDark
                  ? "bg-white/10 text-gray-300 hover:bg-white/15"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {categoryLabel(cat, i18n.language)}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-2xl border shadow-sm",
          isDark ? "border-white/10 bg-[#112240]" : "border-gray-200 bg-white"
        )}
      >
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <Inbox className="mb-4 h-12 w-12 text-gray-300" />
            <p className={cn("font-medium", isDark ? "text-white" : "text-[#0D1B2A]")}>
              {t("notifications.emptyTitle", { defaultValue: "You're all caught up" })}
            </p>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              {t("notifications.emptyDesc", {
                defaultValue: "New updates about courses, assignments, and messages will appear here.",
              })}
            </p>
          </div>
        ) : (
          <ul className={cn("divide-y", isDark ? "divide-white/10" : "divide-gray-100")}>
            {notifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "group flex gap-4 px-4 py-4 transition sm:px-6",
                  !n.is_read && (isDark ? "bg-[#D4AF37]/5" : "bg-[#D4AF37]/[0.04]")
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    typeIconColor(n.type)
                  )}
                >
                  {(n.title || "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => void handleOpen(n.id, n.action_url, n.is_read)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm", !n.is_read && "font-semibold", isDark ? "text-white" : "text-[#0D1B2A]")}>
                        {n.title}
                      </p>
                      {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                    </div>
                    {n.message && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{n.message}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                      <span>{formatRelativeTime(n.created_at, i18n.language)}</span>
                      <span>·</span>
                      <span>{categoryLabel(n.category as typeof NOTIFICATION_CATEGORIES[number], i18n.language)}</span>
                    </div>
                  </button>
                </div>
                <div className="flex shrink-0 flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={() => void markRead(n.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-green-600 dark:hover:bg-white/10"
                      title={t("notifications.markRead", { defaultValue: "Mark read" })}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void deleteNotification(n.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-white/10"
                    title={t("notifications.delete", { defaultValue: "Delete" })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        <Link href="/dashboard/student/settings" className="text-[#D4AF37] hover:underline">
          {t("notifications.managePrefs", { defaultValue: "Manage notification preferences" })}
        </Link>
      </p>
    </div>
  );
}
