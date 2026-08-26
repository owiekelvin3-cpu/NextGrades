"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  BellRing,
  Filter,
  Sparkles,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import type { NotificationCategory, NotificationRecord } from "@/lib/notifications/types";
import {
  formatRelativeTime,
  categoryLabel,
  getNotificationDateGroup,
  dateGroupLabel,
  localizeNotificationMessage,
  localizeNotificationTitle,
  type NotificationDateGroup,
} from "@/lib/notifications/format";
import { NotificationSoundSettings } from "@/components/notifications/NotificationSoundSettings";
import { NotificationCategoryIcon } from "@/components/notifications/NotificationCategoryIcon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Props = {
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

const DATE_GROUP_ORDER: NotificationDateGroup[] = ["today", "yesterday", "this_week", "earlier"];

function groupNotifications(items: NotificationRecord[]): [NotificationDateGroup, NotificationRecord[]][] {
  const buckets = new Map<NotificationDateGroup, NotificationRecord[]>();
  for (const n of items) {
    const group = getNotificationDateGroup(n.created_at);
    const list = buckets.get(group) ?? [];
    list.push(n);
    buckets.set(group, list);
  }
  return DATE_GROUP_ORDER.filter((g) => buckets.has(g)).map((g) => [g, buckets.get(g)!]);
}

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
  const grouped = useMemo(() => groupNotifications(displayed), [displayed]);

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

  const settingsLink = settingsHref ?? "/dashboard/student/settings";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#0D1B2A] via-[#152a45] to-[#1a3354] p-5 text-white shadow-lg sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#D4AF37]/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]/25">
              <BellRing className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              {!embedded && (
                <h1 className="text-xl font-bold sm:text-2xl">
                  {t("notifications.title", { defaultValue: "Notifications" })}
                </h1>
              )}
              <p className={cn("text-sm text-gray-300", !embedded && "mt-1")}>
                {unreadCount > 0
                  ? t("notifications.unreadCount", { count: unreadCount, defaultValue: `${unreadCount} unread` })
                  : t("notifications.allCaughtUp", { defaultValue: "You're all caught up" })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatPill label={t("notifications.statsTotal", { defaultValue: "Total" })} value={notifications.length} />
                <StatPill
                  label={t("notifications.statsUnread", { defaultValue: "Unread" })}
                  value={unreadCount}
                  highlight={unreadCount > 0}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void markAllRead()}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <CheckCheck className="mr-1.5 h-4 w-4" />
                {t("notifications.markAllRead", { defaultValue: "Mark all read" })}
              </Button>
            )}
            <Button variant="gold" size="sm" href={settingsLink} className="gap-1.5">
              <Settings className="h-4 w-4" />
              {t("notifications.prefsShort", { defaultValue: "Preferences" })}
            </Button>
          </div>
        </div>
      </div>

      <NotificationSoundSettings />

      {/* Toolbar */}
      <div className="rounded-2xl border border-border-default bg-surface-elevated p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
          <Filter className="h-3.5 w-3.5" />
          {t("notifications.filterBy", { defaultValue: "Filter by type" })}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <FilterChip
            active={!categoryFilter && !unreadOnly}
            onClick={() => {
              setCategoryFilter(null);
              setUnreadOnly(false);
            }}
            label={t("notifications.all", { defaultValue: "All" })}
          />
          <FilterChip
            active={unreadOnly}
            onClick={() => setUnreadOnly((v) => !v)}
            label={t("notifications.unreadOnly", { defaultValue: "Unread only" })}
            badge={unreadCount > 0 ? unreadCount : undefined}
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
      </div>

      {/* Notification list */}
      {loading && notifications.length === 0 ? (
        <LoadingState />
      ) : displayed.length === 0 ? (
        <EmptyState unreadOnly={unreadOnly} onShowAll={() => setUnreadOnly(false)} />
      ) : (
        <div className="space-y-6">
          {grouped.map(([group, items]) => (
            <section key={group}>
              <h2 className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                {dateGroupLabel(group, i18n.language)}
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-white/10 dark:text-gray-400">
                  {items.length}
                </span>
              </h2>
              <ul className="space-y-2">
                {items.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    locale={i18n.language}
                    onOpen={() => void handleOpen(n.id, n.action_url, n.is_read)}
                    onMarkRead={() => void markRead(n.id)}
                    onDelete={() => void deleteNotification(n.id)}
                    t={t}
                  />
                ))}
              </ul>
            </section>
          ))}

          {hasMore && !unreadOnly && (
            <div ref={sentinelRef} className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
        highlight
          ? "bg-[#D4AF37]/15 text-[#D4AF37] ring-[#D4AF37]/30"
          : "bg-white/5 text-gray-300 ring-white/10"
      )}
    >
      <span className="font-bold">{value}</span>
      {label}
    </span>
  );
}

function NotificationRow({
  notification: n,
  locale,
  onOpen,
  onMarkRead,
  onDelete,
  t,
}: {
  notification: NotificationRecord;
  locale: string;
  onOpen: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
  t: (key: string, options?: { defaultValue?: string }) => string;
}) {
  return (
    <li
      className={cn(
        "group relative flex gap-4 rounded-2xl border bg-surface-elevated p-4 shadow-sm transition hover:border-[#D4AF37]/25 hover:shadow-md sm:p-5",
        n.is_read ? "border-border-default" : "border-[#D4AF37]/30 bg-gradient-to-r from-[#FFF9E6]/40 to-white dark:from-[#D4AF37]/5 dark:to-transparent"
      )}
    >
      {!n.is_read && (
        <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-[#D4AF37]" aria-hidden />
      )}

      <NotificationCategoryIcon category={n.category as NotificationCategory} type={n.type} />

      <div className="min-w-0 flex-1">
        <button type="button" onClick={onOpen} className="w-full text-left">
          <div className="flex items-start justify-between gap-3">
            <p className={cn("text-sm leading-snug text-foreground", !n.is_read && "font-semibold")}>
              {localizeNotificationTitle(n.title, locale)}
            </p>
            {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" />}
          </div>
          {n.message && (
            <p className="mt-1.5 text-sm leading-relaxed text-text-muted line-clamp-2">
              {localizeNotificationMessage(n.message, locale)}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-muted">{formatRelativeTime(n.created_at, locale)}</span>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
              {categoryLabel(n.category as NotificationCategory, locale)}
            </span>
          </div>
        </button>
      </div>

      <div className="flex shrink-0 flex-col gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        {!n.is_read && (
          <button
            type="button"
            onClick={onMarkRead}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-green-50 hover:text-green-600"
            title={t("notifications.markRead", { defaultValue: "Mark read" })}
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
          title={t("notifications.delete", { defaultValue: "Delete" })}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function LoadingState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border-default bg-surface-elevated py-20 text-text-muted">
      <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      <p className="text-sm">{t("misc.loading", { defaultValue: "Loading..." })}</p>
    </div>
  );
}

function EmptyState({ unreadOnly, onShowAll }: { unreadOnly: boolean; onShowAll: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border-default bg-surface-elevated px-6 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF9E6] to-white ring-1 ring-[#D4AF37]/20">
        <Inbox className="h-8 w-8 text-[#D4AF37]" />
      </div>
      <p className="text-lg font-semibold text-foreground">
        {unreadOnly
          ? t("notifications.noUnread", { defaultValue: "No unread notifications" })
          : t("notifications.emptyTitle", { defaultValue: "You're all caught up" })}
      </p>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        {t("notifications.emptyDesc", {
          defaultValue: "New updates about courses, assignments, and messages will appear here.",
        })}
      </p>
      {unreadOnly && (
        <button type="button" onClick={onShowAll} className="mt-5 text-sm font-semibold text-[#D4AF37] hover:underline">
          {t("notifications.showAll", { defaultValue: "Show all" })}
        </button>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition touch-manipulation",
        active
          ? "bg-[#0D1B2A] text-white shadow-sm dark:bg-[#D4AF37] dark:text-[#0D1B2A]"
          : "border border-border-default bg-surface-subtle text-text-muted hover:border-[#D4AF37]/30 hover:text-foreground"
      )}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
            active ? "bg-white/20 text-white dark:bg-[#0D1B2A]/20 dark:text-[#0D1B2A]" : "bg-[#D4AF37]/15 text-[#B8941F]"
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}
