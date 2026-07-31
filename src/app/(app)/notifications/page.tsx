"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, SegmentedControl, Skeleton } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/cn";
import { useT, useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import {
  fetchNotifications,
  markNotificationsRead,
  describeNotification,
  type NotificationItem,
} from "@/lib/data";

const copy = {
  en: {
    title: "Notifications",
    all: "All",
    unread: "Unread",
    markAll: "Mark all read",
    emptyTitle: "You're all caught up",
    emptyDesc: "New activity on your records will show up here.",
  },
  es: {
    title: "Notificaciones",
    all: "Todas",
    unread: "No leídas",
    markAll: "Marcar todas como leídas",
    emptyTitle: "Estás al día",
    emptyDesc: "La nueva actividad de tus registros aparecerá aquí.",
  },
};

const TYPE_ICON: Record<string, LucideIcon> = {
  welcome: Sparkles,
  contract_added: ShieldCheck,
  payment_recorded: CreditCard,
  message: MessageSquare,
};

const TONE_CLS: Record<"verify" | "brand" | "amber" | "danger", string> = {
  verify: "bg-verify-tint text-verify",
  brand: "bg-brand-tint text-brand",
  amber: "bg-amber-tint text-amber",
  danger: "bg-danger-tint text-danger",
};

export default function NotificationsScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const { user } = useAuth();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [items, setItems] = useState<NotificationItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    if (!user) return;
    fetchNotifications(user.id).then((n) => {
      if (alive) setItems(n);
    });
    return () => {
      alive = false;
    };
  }, [user]);

  const loading = items === null;
  const list = (items ?? []).filter((n) => (tab === "unread" ? !n.read : true));

  const markAll = () => {
    if (!user) return;
    markNotificationsRead(user.id);
    setItems((prev) => (prev ? prev.map((n) => ({ ...n, read: true })) : prev));
  };

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <div className="flex items-center justify-between gap-3">
            <SegmentedControl
              value={tab}
              onChange={setTab}
              options={[
                { value: "all", label: c.all },
                { value: "unread", label: c.unread },
              ]}
            />
            <button
              onClick={markAll}
              className="shrink-0 text-[13px] font-semibold text-brand transition-opacity hover:opacity-70"
            >
              {c.markAll}
            </button>
          </div>

          {loading ? (
            <Card className="mt-4 divide-y divide-line p-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2.5">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3 rounded" />
                    <Skeleton className="h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </Card>
          ) : list.length === 0 ? (
            <div className="mt-6">
              <EmptyState icon={<Bell />} title={c.emptyTitle} description={c.emptyDesc} />
            </div>
          ) : (
            <Card className="mt-4 divide-y divide-line p-2">
              <Stagger>
                {list.map((n) => {
                  const { title, desc, tone } = describeNotification(n, locale);
                  const Icon = TYPE_ICON[n.type] ?? Bell;
                  const unread = !n.read;
                  return (
                    <StaggerItem key={n.id}>
                      <div
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl p-2.5 text-left",
                          unread && "bg-surface-2/60",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                            TONE_CLS[tone],
                          )}
                        >
                          <Icon className="h-[22px] w-[22px]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              "text-[14.5px] leading-snug text-ink",
                              unread ? "font-bold" : "font-medium",
                            )}
                          >
                            {title}
                          </div>
                          {desc && (
                            <div className="mt-0.5 truncate text-[13px] text-ink-soft">{desc}</div>
                          )}
                          <div className="mt-0.5 text-[12px] text-ink-faint tnum">{n.timeLabel}</div>
                        </div>
                        {unread && (
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />
                        )}
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </Card>
          )}
        </Screen>
      </PageFade>
    </>
  );
}
