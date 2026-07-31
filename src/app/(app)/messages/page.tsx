"use client";

import { Search } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { Avatar, Card, Input } from "@/components/ui/primitives";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { conversations } from "@/lib/mock";

const copy = {
  en: {
    title: "Messages",
    subtitle: "Every person here is identity-verified.",
    search: "Search conversations",
  },
  es: {
    title: "Mensajes",
    subtitle: "Cada persona aquí tiene identidad verificada.",
    search: "Buscar conversaciones",
  },
};

export default function MessagesScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();

  return (
    <PageFade>
      <Screen>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{g.tabs.messages}</h1>
        <p className="mt-0.5 text-[13px] text-ink-faint">{c.subtitle}</p>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint" />
          <Input placeholder={c.search} className="pl-11" />
        </div>

        {/* Conversations */}
        <Card className="mt-4 divide-y divide-line p-2">
          <Stagger>
            {conversations.map((conv) => (
              <StaggerItem key={conv.id}>
                <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-surface-2">
                  <Avatar initials={conv.initials} size={48} verified={conv.verified} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-bold text-ink">{conv.name}</span>
                      <span className="ml-auto shrink-0 text-[12px] text-ink-faint tnum">
                        {conv.time}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className={
                          conv.unread > 0
                            ? "truncate text-[13.5px] font-semibold text-ink-soft"
                            : "truncate text-[13.5px] text-ink-faint"
                        }
                      >
                        {locale === "es" ? conv.lastEs : conv.lastEn}
                      </span>
                      {conv.unread > 0 && (
                        <span className="ml-auto grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white tnum">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        </Card>
      </Screen>
    </PageFade>
  );
}
