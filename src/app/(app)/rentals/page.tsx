"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ShieldCheck, Clock, ScrollText } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { Card, Button, Chip, Skeleton } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { useAuth } from "@/lib/auth";
import { fetchMyRentals, formatMonthYear, type Rental } from "@/lib/data";

const copy = {
  en: {
    title: "Records",
    subtitle: "Your verified rental history",
    all: "All",
    active: "Active",
    past: "Past",
    perMonth: "/mo",
    asLandlord: "As landlord",
    asTenant: "As tenant",
    addContract: "Add contract",
    emptyTitle: "No rentals yet",
    emptyDesc: "Add your first contract to start building your portable rental history.",
    emptyFiltered: "Nothing matches this filter yet.",
  },
  es: {
    title: "Historial",
    subtitle: "Tu historial de alquiler verificado",
    all: "Todos",
    active: "Activos",
    past: "Anteriores",
    perMonth: "/mes",
    asLandlord: "Como propietario",
    asTenant: "Como inquilino",
    addContract: "Añadir contrato",
    emptyTitle: "Aún no hay alquileres",
    emptyDesc: "Añade tu primer contrato para empezar a construir tu historial portátil.",
    emptyFiltered: "Nada coincide con este filtro todavía.",
  },
};

type Filter = "all" | "active" | "past";

export default function RentalsScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");
  const [rentals, setRentals] = useState<Rental[] | null>(null);

  useEffect(() => {
    let alive = true;
    if (!user) return;
    fetchMyRentals(user.id).then((r) => {
      if (alive) setRentals(r);
    });
    return () => {
      alive = false;
    };
  }, [user]);

  const loading = rentals === null;
  const filtered = (rentals ?? []).filter((r) => (filter === "all" ? true : r.status === filter));

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: c.all },
    { key: "active", label: c.active },
    { key: "past", label: c.past },
  ];

  return (
    <PageFade>
      <Screen>
        <div className="pt-1">
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{c.title}</h1>
          <p className="mt-1 text-[14px] text-ink-faint">{c.subtitle}</p>
        </div>

        {/* Filter chips */}
        <div className="mt-4 flex gap-2">
          {chips.map((ch) => {
            const on = filter === ch.key;
            return (
              <button
                key={ch.key}
                onClick={() => setFilter(ch.key)}
                className={
                  "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors " +
                  (on
                    ? "border-brand/25 bg-brand-tint text-brand"
                    : "border-line bg-surface text-ink-soft hover:bg-surface-3")
                }
              >
                {ch.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[104px] w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<ScrollText />}
              title={rentals!.length === 0 ? c.emptyTitle : c.emptyTitle}
              description={rentals!.length === 0 ? c.emptyDesc : c.emptyFiltered}
              action={
                <Button href="/rentals/new" icon={<Plus className="h-[18px] w-[18px]" />}>
                  {c.addContract}
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <Stagger className="mt-4 space-y-3">
              {filtered.map((r) => {
                const range = `${formatMonthYear(r.startDate, locale)} – ${
                  r.status === "past" ? formatMonthYear(r.endDate, locale) : formatMonthYear(null, locale)
                }`;
                return (
                  <StaggerItem key={r.id}>
                    <Link href={`/property?id=${r.id}`} className="block">
                      <Card className="p-4 transition-all hover:shadow-[var(--shadow-2)] active:scale-[.99]">
                        <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[15px] font-bold text-ink">{r.address}</div>
                          <div className="mt-0.5 text-[13px] text-ink-faint">{r.city}</div>
                        </div>
                        {r.verified ? (
                          <Chip tone="verify" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                            {g.status.verified}
                          </Chip>
                        ) : (
                          <Chip tone="pending" icon={<Clock className="h-3.5 w-3.5" />}>
                            {g.status.pending}
                          </Chip>
                        )}
                      </div>

                      <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
                        <div className="min-w-0">
                          <div className="text-[13px] text-ink-soft tnum">{range}</div>
                          <div className="mt-0.5 truncate text-[12.5px] text-ink-faint">
                            {r.relation === "landlord" ? c.asLandlord : c.asTenant}
                          </div>
                        </div>
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <span className="text-[15px] font-bold text-ink tnum">${r.rent.toLocaleString()}</span>
                            <span className="text-[13px] text-ink-faint">{c.perMonth}</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>

            <div className="mt-5">
              <Button href="/rentals/new" full icon={<Plus className="h-[18px] w-[18px]" />}>
                {c.addContract}
              </Button>
            </div>
          </>
        )}
      </Screen>
    </PageFade>
  );
}
