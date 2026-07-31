"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Avatar, Chip } from "@/components/ui/primitives";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { searchResults } from "@/lib/mock";

const copy = {
  en: {
    title: "Results",
    results: (n: number) => `${n} results`,
    sortScore: "Score",
    sortRecent: "Recent",
  },
  es: {
    title: "Resultados",
    results: (n: number) => `${n} resultados`,
    sortScore: "Score",
    sortRecent: "Reciente",
  },
};

type Sort = "score" | "recent";

export default function SearchResultsScreen() {
  const c = useT(copy);
  const g = useT(common);
  const [sort, setSort] = useState<Sort>("score");

  const rows =
    sort === "score"
      ? [...searchResults].sort((a, b) => b.score - a.score)
      : searchResults;

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[14px] font-semibold text-ink-soft tnum">
              {c.results(rows.length)}
            </p>
            <div className="inline-flex gap-1 rounded-xl bg-surface-3 p-1">
              {(
                [
                  { value: "score", label: c.sortScore },
                  { value: "recent", label: c.sortRecent },
                ] as { value: Sort; label: string }[]
              ).map((o) => (
                <button
                  key={o.value}
                  onClick={() => setSort(o.value)}
                  className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-all ${
                    sort === o.value ? "bg-surface text-ink shadow-[var(--shadow-1)]" : "text-ink-soft"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result cards */}
          <div className="mt-4">
            <Stagger className="space-y-3">
              {rows.map((r) => {
                const strong = r.score >= 85;
                return (
                  <StaggerItem key={r.id}>
                    <Link href="/trust" className="block">
                      <Card className="flex items-center gap-3.5 p-3.5 transition-all hover:shadow-[var(--shadow-2)] active:scale-[.99]">
                        <Avatar initials={r.initials} size={52} verified={r.verified} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[15.5px] font-bold text-ink">{r.name}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <Chip tone={r.role === "tenant" ? "brand" : "neutral"}>
                              {r.role === "tenant" ? g.roles.tenant : g.roles.landlord}
                            </Chip>
                            <span className="inline-flex items-center gap-1 text-[12.5px] text-ink-faint">
                              <MapPin className="h-3.5 w-3.5" />
                              {r.location}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span
                            className={`text-[22px] font-extrabold tnum ${strong ? "text-verify" : "text-ink"}`}
                          >
                            {r.score}
                          </span>
                          <span className="text-[13px] font-semibold text-ink-faint tnum">/100</span>
                          <ChevronRight className="ml-auto mt-0.5 h-4 w-4 text-ink-faint" />
                        </div>
                      </Card>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
