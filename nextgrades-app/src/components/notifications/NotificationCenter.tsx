"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Check,
  CheckCheck,
  Trash2,
  Loader2,
  Inbox,
  Settings,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import type { NotificationCategory } from "@/lib/notifications/types";
import { formatRelativeTime, categoryLabel, typeIconColor } from "@/lib/notifications/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { mobile } from "@/lib/mobile/tokens";

type Props = {
  /** Hide page title when parent layout already shows it */
  embedded?: boolean;
  settingsHref?: string;
};

const PRIMARY_CATEGORIES: NotificationCategory[] = [
  "announcement",
  "resource",
  "live_class",
  "assignment",
  "grade",
  "message",
  "account",
];

export function NotificationCenter({ embedded = false, settingsHref }: Props) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
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

  const [unreadOnly, setUnreadOnly] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const displayed = unreadOnly ? notifications.filter((n) => !n.is_read) : notifications;

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

  const handleOpen = async (id: string, url: string | null, isRead: boolean) => {
    if (!isRead) await markRead(id);
    if (url) router.push(url);
  };

  const settingsLink =
    settingsHref ??
    (embedded ? "/dashboard/student/settings" : "/dashboard/student/settings");

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header — hidden when embedded (layout provides title) */}
      {!embedded && (
        <div className="mb-2">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            {t("notifications.title", { defaultValue: "Notifications" })}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0
              ? t("notifications.unreadCount", { count: unreadCount, defaultValue: `${unreadCount} unread` })
              : t("notifications.allCaughtUp", { defaultValue: "You're all caught up" })}
          </p>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {embedded && (
          <p className="text-sm text-gray-500 md:hidden">
            {unreadCount > 0
              ? t("notifications.unreadCount", { count: unreadCount, defaultValue: `${unreadCount} unread` })
              : t("notifications.allCaughtUp", { defaultValue: "You're all caught up" })}
          </p>
        )}
        <div className={cn("flex flex-wrap items-center gap-2", embedded && "sm:ml-auto")}>
          <button
            type="button"
            onClick={() => setUnreadOnly((v) => !v)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              unreadOnly
                ? "bg-[#0D1B2A] text-white dark:bg-[#D4AF37] dark:text-[#0D1B2A]"
                : "border border-border-default bg-surface-elevated text-text-muted hover:border-gray-300 dark:hover:border-white/20"
            )}
          >
            {t("notifications.unreadOnly", { defaultValue: "Unread only" })}
          </button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => void markAllRead()}>
              <CheckCheck className="mr-1.5 h-4 w-4" />
              {t("notifications.markAllRead", { defaultValue: "Mark all read" })}
            </Button>
          )}
        </div>
      </div>

      {/* Category filter — horizontal scroll */}
      <div className={cn("relative mb-4", mobile.chipRow)}>
        <FilterChip
          active={!categoryFilter}
          onClick={() => setCategoryFilter(null)}
          label={t("notifications.all", { defaultValue: "All" })}
        />
        {PRIMARY_CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            active={categoryFilter === cat}
            onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
            label={categoryLabel(cat, i18n.language)}
          />
        ))}
      </div>

      {/* List */}
      <div className={cn("overflow-hidden", mobile.card)}>
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
            <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" />
            <p className="text-sm">{t("misc.loading", { defaultValue: "Loading..." })}</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Inbox className="h-7 w-7 text-gray-400" />
            </div>
            <p className="font-semibold text-foreground">
              {unreadOnly
                ? t("notifications.noUnread", { defaultValue: "No unread notifications" })
                : t("notifications.emptyTitle", { defaultValue: "You're all caught up" })}
            </p>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              {t("notifications.emptyDesc", {
                defaultValue: "New updates about courses, assignments, and messages will appear here.",
              })}
            </p>
            {unreadOnly && (
              <button
                type="button"
                onClick={() => setUnreadOnly(false)}
                className="mt-4 text-sm font-medium text-[#D4AF37] hover:underline"
              >
                {t("notifications.showAll", { defaultValue: "Show all" })}
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {displayed.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "group relative flex gap-4 px-4 py-4 transition touch-manipulation active:bg-surface-subtle sm:px-5",
                  !n.is_read && "bg-[#D4AF37]/[0.06]"
                )}
              >
                {!n.is_read && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-[#D4AF37]" aria-hidden />
                )}
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
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
                      <p className={cn("text-sm text-[#0D1B2A]", !n.is_read && "font-semibold")}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" />
                      )}
                    </div>
                    {n.message && (
                      <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">{n.message}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                      <span>{formatRelativeTime(n.created_at, i18n.language)}</span>
                      <span>·</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                        {categoryLabel(n.category as NotificationCategory, i18n.language)}
                      </span>
                    </div>
                  </button>
                </div>
                <div className="flex shrink-0 items-start gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={() => void markRead(n.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-green-50 hover:text-green-600"
                      title={t("notifications.markRead", { defaultValue: "Mark read" })}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void deleteNotification(n.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title={t("notifications.delete", { defaultValue: "Delete" })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {hasMore && !unreadOnly && (
          <div ref={sentinelRef} className="flex justify-center border-t border-gray-100 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
        <Settings className="h-3.5 w-3.5" />
        <Link href={settingsLink} className="font-medium text-[#D4AF37] hover:underline">
          {t("notifications.managePrefs", { defaultValue: "Manage notification preferences" })}
        </Link>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition touch-manipulation min-h-10",
        active
          ? "bg-[#D4AF37] text-[#0D1B2A] shadow-sm font-semibold"
          : "border border-border-default bg-surface-elevated text-text-muted active:scale-[0.98]"
      )}
    >
      {label}
    </button>
  );
}
