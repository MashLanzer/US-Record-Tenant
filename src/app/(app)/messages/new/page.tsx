"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Avatar, Input, Card, Chip, Skeleton } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { useAuth } from "@/lib/auth";
import { searchProfiles, fetchOrCreateConversation, type SearchItem } from "@/lib/data";

const copy = {
  en: { title: "New message", searchPh: "Search people by name", empty: "No people found", hint: "Choose someone verified to message." },
  es: { title: "Nuevo mensaje", searchPh: "Buscar personas por nombre", empty: "No se encontraron personas", hint: "Elige a alguien verificado para escribirle." },
};

export default function NewMessageScreen() {
  const c = useT(copy);
  const g = useT(common);
  const router = useRouter();
  const { user, demoMode } = useAuth();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchItem[] | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let alive = true;
    setResults(null);
    searchProfiles(q).then((r) => {
      if (alive) setResults(r.filter((x) => x.id !== user?.id));
    });
    return () => {
      alive = false;
    };
  }, [q, user]);

  async function start(item: SearchItem) {
    if (!user || starting) return;
    setStarting(true);
    try {
      if (demoMode) {
        router.push(`/messages/thread?id=demo&name=${encodeURIComponent(item.name)}`);
        return;
      }
      const convId = await fetchOrCreateConversation(user.id, item.id);
      router.push(`/messages/thread?id=${convId}&name=${encodeURIComponent(item.name)}`);
    } catch {
      setStarting(false);
    }
  }

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPh} className="pl-11" autoFocus />
          </div>
          <p className="mt-2 text-[12.5px] text-ink-faint">{c.hint}</p>

          {results === null ? (
            <div className="mt-4 space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={<Search />} title={c.empty} />
            </div>
          ) : (
            <div className="mt-4 space-y-1.5">
              {results.map((item) => (
                <Card key={item.id} onClick={() => start(item)} className="flex items-center gap-3 p-3">
                  <Avatar initials={item.initials} size={44} verified={item.verified} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-bold text-ink">{item.name}</div>
                    <div className="mt-0.5">
                      <Chip tone={item.role === "landlord" ? "brand" : "neutral"}>{g.roles[item.role]}</Chip>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-ink-ghost" />
                </Card>
              ))}
            </div>
          )}
        </Screen>
      </PageFade>
    </>
  );
}
