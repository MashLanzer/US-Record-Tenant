"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, PenSquare, ShieldCheck, MessagesSquare } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { Avatar, Card, Input, Button, Skeleton } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { fetchConversations, type ConversationItem } from "@/lib/data";

const copy = {
  en: {
    title: "Messages",
    searchPh: "Search conversations",
    newMsg: "New",
    emptyTitle: "No conversations yet",
    emptyDesc: "Message a verified landlord or tenant to start a conversation.",
    start: "Start a conversation",
  },
  es: {
    title: "Mensajes",
    searchPh: "Buscar conversaciones",
    newMsg: "Nuevo",
    emptyTitle: "Aún no hay conversaciones",
    emptyDesc: "Escríbele a un propietario o inquilino verificado para empezar.",
    start: "Iniciar conversación",
  },
};

export default function MessagesScreen() {
  const c = useT(copy);
  const { user } = useAuth();
  const [convs, setConvs] = useState<ConversationItem[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchConversations(user.id).then((r) => alive && setConvs(r));
    return () => {
      alive = false;
    };
  }, [user]);

  const filtered = (convs ?? []).filter(
    (cv) => !q.trim() || cv.otherName.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <PageFade>
      <Screen>
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{c.title}</h1>
          <Button href="/messages/new" size="sm" icon={<PenSquare className="h-4 w-4" />}>
            {c.newMsg}
          </Button>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPh} className="pl-11" />
        </div>

        {convs === null ? (
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<MessagesSquare />}
              title={c.emptyTitle}
              description={c.emptyDesc}
              action={<Button href="/messages/new">{c.start}</Button>}
            />
          </div>
        ) : (
          <Stagger className="mt-3 space-y-1.5">
            {filtered.map((cv) => (
              <StaggerItem key={cv.id}>
                <Link
                  href={`/messages/thread?id=${cv.id}&name=${encodeURIComponent(cv.otherName)}`}
                  className="block"
                >
                  <Card className="flex items-center gap-3 p-3">
                    <Avatar initials={cv.otherInitials} size={46} verified={cv.otherVerified} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[15px] font-bold text-ink">{cv.otherName}</span>
                        {cv.otherVerified && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-verify" />}
                      </div>
                      <div className="truncate text-[13px] text-ink-faint">{cv.lastBody}</div>
                    </div>
                    <span className="shrink-0 text-[12px] text-ink-faint">{cv.timeLabel}</span>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Screen>
    </PageFade>
  );
}
