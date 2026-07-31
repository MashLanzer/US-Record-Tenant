"use client";

import { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, SegmentedControl } from "@/components/ui/primitives";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/cn";
import { useT, useLocale } from "@/lib/i18n";
import { notifications, type Notification } from "@/lib/mock";

const copy = {
  en: {
    title: "Notifications",
    all: "All",
    unread: "Unread",
    markAll: "Mark all read",
    empty: "You're all caught up.",
  },
  es: {
    title: "Notificaciones",
    all: "Todas",
    unread: "No leídas",
    markAll: "Marcar todas como leídas",
    empty: "Estás al día.",
  },
};

type NType = Notification["type"];

const TYPE_META: Record<
  NType,
  { icon: LucideIcon; iconCls: string; actionable: boolean }
> = {
  verify: { icon: ShieldCheck, iconCls: "bg-verify-tint text-verify", actionable: true },
  dispute: { icon: AlertTriangle, iconCls: "bg-amber-tint text-amber", actionable: true },
  payment: { icon: CreditCard, iconCls: "bg-brand-tint text-brand", actionable: false },
  message: { icon: MessageSquare, iconCls: "bg-surface-3 text-ink-soft", actionable: false },
};

export default function NotificationsScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [read, setRead] = useState<Set<string>>(new Set());

  const isUnread = (n: Notification) => n.unread && !read.has(n.id);
  const list = notifications.filter((n) => (tab === "unread" ? isUnread(n) : true));
  const markAll = () => setRead(new Set(notifications.map((n) => n.id)));

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

          <Card className="mt-4 divide-y divide-line p-2">
            {list.length === 0 ? (
              <div className="px-3 py-10 text-center text-[14px] text-ink-faint">{c.empty}</div>
            ) : (
              <Stagger>
                {list.map((n) => {
                  const meta = TYPE_META[n.type];
                  const Icon = meta.icon;
                  const unread = isUnread(n);
                  return (
                    <StaggerItem key={n.id}>
                      <button
                        onClick={() => setRead((prev) => new Set(prev).add(n.id))}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-surface-2",
                          unread && "bg-surface-2/60",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                            meta.iconCls,
                          )}
                        >
                          <Icon className="h-[22px] w-[22px]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              "text-[14.5px] leading-snug text-ink",
                              unread ? "font-bold" : "font-medium",
                              meta.actionable && "text-ink",
                            )}
                          >
                            {locale === "es" ? n.titleEs : n.titleEn}
                          </div>
                          <div className="mt-0.5 text-[12px] text-ink-faint tnum">{n.time}</div>
                        </div>
                        {meta.actionable && !unread && (
                          <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
                        )}
                        {unread && (
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />
                        )}
                      </button>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            )}
          </Card>
        </Screen>
      </PageFade>
    </>
  );
}
