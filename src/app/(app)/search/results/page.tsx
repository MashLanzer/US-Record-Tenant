"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Search } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Avatar, Chip, SegmentedControl, Skeleton } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { searchProfiles, type SearchItem } from "@/lib/data";

const copy = {
  en: {
    title: "Results",
    forQuery: (q: string) => `Results for “${q}”`,
    forAll: "Top profiles",
    results: (n: number) => `${n} ${n === 1 ? "result" : "results"}`,
    sortScore: "Score",
    sortName: "Name",
    emptyTitle: "No results",
    emptyDesc: "Try a different name or clear your search.",
  },
  es: {
    title: "Resultados",
    forQuery: (q: string) => `Resultados para “${q}”`,
    forAll: "Perfiles destacados",
    results: (n: number) => `${n} ${n === 1 ? "resultado" : "resultados"}`,
    sortScore: "Score",
    sortName: "Nombre",
    emptyTitle: "Sin resultados",
    emptyDesc: "Prueba con otro nombre o borra tu búsqueda.",
  },
};

type Sort = "score" | "name";

export default function SearchResultsScreen() {
  const c = useT(copy);
  const g = useT(common);
  const [sort, setSort] = useState<Sort>("score");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    const q = new URLSearchParams(window.location.search).get("q") ?? "";
    setQuery(q);
    searchProfiles(q).then((r) => {
      if (alive) setItems(r);
    });
    return () => {
      alive = false;
    };
  }, []);

  const loading = items === null;

  const sorted = [...(items ?? [])].sort((a, b) =>
    sort === "score" ? b.score - a.score : a.name.localeCompare(b.name),
  );

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-ink">
                {query ? c.forQuery(query) : c.forAll}
              </p>
              {!loading && (
                <p className="mt-0.5 text-[13px] text-ink-faint tnum">{c.results(sorted.length)}</p>
              )}
            </div>
            <SegmentedControl<Sort>
              className="shrink-0"
              value={sort}
              onChange={setSort}
              options={[
                { value: "score", label: c.sortScore },
                { value: "name", label: c.sortName },
              ]}
            />
          </div>

          {loading ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-[84px] w-full rounded-2xl" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="mt-6">
              <EmptyState icon={<Search />} title={c.emptyTitle} description={c.emptyDesc} />
            </div>
          ) : (
            <div className="mt-4">
              <Stagger className="space-y-3">
                {sorted.map((r) => {
                  const strong = r.score >= 85;
                  return (
                    <StaggerItem key={r.id}>
                      <Link href={`/trust?id=${r.id}`} className="block">
                        <Card className="flex items-center gap-3.5 p-3.5 transition-all hover:shadow-[var(--shadow-2)] active:scale-[.99]">
                          <Avatar initials={r.initials} size={52} verified={r.verified} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[15.5px] font-bold text-ink">{r.name}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                              <Chip tone={r.role === "tenant" ? "brand" : "neutral"}>
                                {r.role === "tenant" ? g.roles.tenant : g.roles.landlord}
                              </Chip>
                              {r.location && (
                                <span className="inline-flex items-center gap-1 text-[12.5px] text-ink-faint">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {r.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <div className="text-right">
                              <span
                                className={`text-[22px] font-extrabold tnum ${strong ? "text-verify" : "text-ink"}`}
                              >
                                {r.score}
                              </span>
                              <span className="text-[13px] font-semibold text-ink-faint tnum">/100</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-ink-faint" />
                          </div>
                        </Card>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>
          )}
        </Screen>
      </PageFade>
    </>
  );
}
