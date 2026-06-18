"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase, isSupabaseEnvConfigured } from "@/lib/supabase/client";
import { playNotificationSound, unlockAudio } from "@/lib/notifications/sounds";
import { resolveNotificationSound } from "@/lib/notifications/preferences";
import type { NotificationRecord, NotificationPreferences, NotificationCategory } from "@/lib/notifications/types";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notifications/types";
import { runWhenIdle } from "@/lib/defer-idle";

type NotificationContextValue = {
  notifications: NotificationRecord[];
  unreadCount: number;
  loading: boolean;
  preferences: NotificationPreferences;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: string, isRead?: boolean) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  setCategoryFilter: (category: string | null) => void;
  categoryFilter: string | null;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(() => isSupabaseEnvConfigured());
  const [hasMore, setHasMore] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const offsetRef = useRef(0);
  const userIdRef = useRef<string | null>(null);
  const prefsRef = useRef(preferences);

  useEffect(() => {
    prefsRef.current = preferences;
  }, [preferences]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const json = (await res.json()) as { count: number };
        setUnreadCount(json.count);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const fetchPage = useCallback(
    async (reset = false) => {
      const offset = reset ? 0 : offsetRef.current;
      const params = new URLSearchParams({ limit: "20", offset: String(offset) });
      if (categoryFilter) params.set("category", categoryFilter);

      const res = await fetch(`/api/notifications?${params}`);
      if (!res.ok) return;
      const json = (await res.json()) as {
        notifications: NotificationRecord[];
        hasMore: boolean;
      };

      setNotifications((prev) => (reset ? json.notifications : [...prev, ...json.notifications]));
      setHasMore(json.hasMore);
      offsetRef.current = reset ? json.notifications.length : offset + json.notifications.length;
    },
    [categoryFilter]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPage(true), fetchUnreadCount()]);
    setLoading(false);
  }, [fetchPage, fetchUnreadCount]);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    await fetchPage(false);
  }, [fetchPage, hasMore]);

  const markRead = useCallback(
    async (id: string, isRead = true) => {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: isRead }),
      });
      if (!res.ok) return;

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: isRead, read_at: isRead ? new Date().toISOString() : null } : n
        )
      );
      await fetchUnreadCount();
    },
    [fetchUnreadCount]
  );

  const markAllRead = useCallback(async () => {
    const res = await fetch("/api/notifications/read-all", { method: "POST" });
    if (!res.ok) return;
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at ?? new Date().toISOString() }))
    );
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await fetchUnreadCount();
    },
    [fetchUnreadCount]
  );

  const updatePreferences = useCallback(async (partial: Partial<NotificationPreferences>) => {
    const res = await fetch("/api/user/notification-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    if (res.ok) {
      const json = (await res.json()) as { preferences: NotificationPreferences };
      setPreferences(json.preferences);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseEnvConfigured()) {
      return;
    }

    let authSubscription: { unsubscribe: () => void } | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const unlock = () => unlockAudio();

    const start = () => {
      fetch("/api/user/notification-preferences")
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (json?.preferences) setPreferences(json.preferences);
        })
        .catch(() => {});

      void supabase.auth.getUser().then(({ data }) => {
        userIdRef.current = data.user?.id ?? null;
        if (data.user) {
          void refresh();
        } else {
          setLoading(false);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        userIdRef.current = session?.user?.id ?? null;
        if (session?.user) void refresh();
        else {
          setNotifications([]);
          setUnreadCount(0);
          setLoading(false);
        }
      });
      authSubscription = authListener.subscription;

      channel = supabase
        .channel("notifications-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications" },
          (payload) => {
            const row = payload.new as NotificationRecord;
            if (userIdRef.current && row.user_id !== userIdRef.current) return;

            setNotifications((prev) => {
              if (prev.some((n) => n.id === row.id)) return prev;
              return [row, ...prev];
            });
            setUnreadCount((c) => c + 1);

            if (prefsRef.current.soundEnabled) {
              const category = row.category as NotificationCategory;
              playNotificationSound(resolveNotificationSound(prefsRef.current, category));
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "notifications" },
          (payload) => {
            const row = payload.new as NotificationRecord;
            setNotifications((prev) => prev.map((n) => (n.id === row.id ? row : n)));
            void fetchUnreadCount();
          }
        )
        .subscribe();

      window.addEventListener("click", unlock, { once: true });
    };

    const cancelIdle = runWhenIdle(start, 2500);

    return () => {
      cancelIdle();
      authSubscription?.unsubscribe();
      if (channel) void supabase.removeChannel(channel);
      window.removeEventListener("click", unlock);
    };
  }, [refresh, fetchUnreadCount]);

  const categoryFilterBootstrapped = useRef(false);
  useEffect(() => {
    if (!categoryFilterBootstrapped.current) {
      categoryFilterBootstrapped.current = true;
      return;
    }
    offsetRef.current = 0;
    void refresh();
  }, [categoryFilter, refresh]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      preferences,
      hasMore,
      refresh,
      loadMore,
      markRead,
      markAllRead,
      deleteNotification,
      setCategoryFilter,
      categoryFilter,
      updatePreferences,
    }),
    [
      notifications,
      unreadCount,
      loading,
      preferences,
      hasMore,
      refresh,
      loadMore,
      markRead,
      markAllRead,
      deleteNotification,
      categoryFilter,
      updatePreferences,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}

export function useNotificationsOptional() {
  return useContext(NotificationContext);
}
