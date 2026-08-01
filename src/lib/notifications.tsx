"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchNotifications, markNotificationsRead, type NotificationItem } from "@/lib/data";

type NotificationsValue = {
  items: NotificationItem[];
  unread: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, demoMode } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    const n = await fetchNotifications(user.id);
    setItems(n);
    setLoading(false);
  }, [user]);

  // Initial load + reload when the signed-in user changes.
  useEffect(() => {
    userIdRef.current = user?.id ?? null;
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void refresh();
  }, [user, refresh]);

  // Realtime: new notifications for this user arrive instantly (RLS-scoped).
  useEffect(() => {
    if (!user || demoMode) return;
    const sb = getSupabase();
    if (!sb) return;
    const channel = sb
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          // Refetch to get the normalized shape + correct ordering.
          void refresh();
        },
      )
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
  }, [user, demoMode, refresh]);

  // Safety net: refetch when the app regains focus (covers missed events).
  useEffect(() => {
    if (!user) return;
    const onFocus = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, refresh]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await markNotificationsRead(user.id);
  }, [user]);

  const unread = items.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ items, unread, loading, refresh, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    // Graceful no-op outside the provider (e.g. isolated screens).
    return { items: [], unread: 0, loading: false, refresh: async () => {}, markAllRead: async () => {} };
  }
  return ctx;
}
