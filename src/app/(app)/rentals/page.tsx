"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ShieldCheck, Clock, ScrollText, ChevronRight } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { Card, Button, Chip } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { properties } from "@/lib/mock";

const copy = {
  en: {
    title: "Records",
    subtitle: "Your verified rental history",
    all: "All",
    active: "Active",
    past: "Past",
    perMonth: "/mo",
    present: "Present",
    with: "with",
    addContract: "Add contract",
    emptyTitle: "No rentals here",
    emptyDesc: "Nothing matches this filter yet. Add a contract to start building your history.",
  },
  es: {
    title: "Historial",
    subtitle: "Tu historial de alquiler verificado",
    all: "Todos",
    active: "Activos",
    past: "Anteriores",
    perMonth: "/mes",
    present: "Actual",
    with: "con",
    addContract: "Añadir contrato",
    emptyTitle: "No hay alquileres aquí",
    emptyDesc: "Nada coincide con este filtro todavía. Añade un contrato para empezar tu historial.",
  },
};

type Filter = "all" | "active" | "past";

export default function RentalsScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();
  const [filter, setFilter] = useState<Filter>("all");

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      month: "short",
      year: "numeric",
    });

  const filtered = properties.filter((p) => (filter === "all" ? true : p.status === filter));

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

        {/* Lease cards */}
        {filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<ScrollText />}
              title={c.emptyTitle}
              description={c.emptyDesc}
              action={
                <Button href="/property" icon={<Plus className="h-[18px] w-[18px]" />}>
                  {c.addContract}
                </Button>
              }
            />
          </div>
        ) : (
          <Stagger className="mt-4 space-y-3">
            {filtered.map((p) => {
              const range = `${fmt(p.startDate)} – ${p.endDate ? fmt(p.endDate) : c.present}`;
              return (
                <StaggerItem key={p.id}>
                  <Link href="/property" className="block">
                    <Card className="p-4 transition-all hover:shadow-[var(--shadow-2)] active:scale-[.99]">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[15px] font-bold text-ink">{p.address}</div>
                          <div className="mt-0.5 text-[13px] text-ink-faint">{p.city}</div>
                        </div>
                        {p.verified ? (
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
                            {c.with} {p.counterparty}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <span className="text-[15px] font-bold text-ink tnum">
                            ${p.rent.toLocaleString()}
                          </span>
                          <span className="text-[13px] text-ink-faint">{c.perMonth}</span>
                          <ChevronRight className="ml-1 h-4 w-4 text-ink-ghost" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}

        {/* Primary action */}
        {filtered.length > 0 && (
          <div className="mt-5">
            <Button href="/property" full icon={<Plus className="h-[18px] w-[18px]" />}>
              {c.addContract}
            </Button>
          </div>
        )}
      </Screen>
    </PageFade>
  );
}
