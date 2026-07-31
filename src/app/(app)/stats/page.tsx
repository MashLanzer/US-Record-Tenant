"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { AppHeader, SectionTitle } from "@/components/app-header";
import { Card, StatCard, SegmentedControl, Skeleton } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { fetchStats, type StatsData } from "@/lib/data";

type Range = "6m" | "1y" | "all";

const copy = {
  en: {
    title: "Statistics",
    range6m: "6M",
    range1y: "1Y",
    rangeAll: "All",
    chartTitle: "Rent paid per month",
    noData: "No payment data yet",
    metrics: "Key metrics",
    trustScore: "Trust score",
    rentals: "Rentals",
    onTime: "On-time",
    totalPaid: "Total paid",
    insight: "Your on-time payments are the biggest driver of your trust score.",
  },
  es: {
    title: "Estadísticas",
    range6m: "6M",
    range1y: "1A",
    rangeAll: "Todo",
    chartTitle: "Renta pagada por mes",
    noData: "Aún no hay datos de pago",
    metrics: "Métricas clave",
    trustScore: "Score de confianza",
    rentals: "Alquileres",
    onTime: "A tiempo",
    totalPaid: "Total pagado",
    insight: "Tus pagos a tiempo son el mayor impulsor de tu score de confianza.",
  },
};

export default function StatsScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const { user } = useAuth();
  const [range, setRange] = useState<Range>("6m");
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    let alive = true;
    if (!user) return;
    fetchStats(user.id, locale).then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, [user, locale]);

  const loading = data === null;

  const options = [
    { value: "6m" as const, label: c.range6m },
    { value: "1y" as const, label: c.range1y },
    { value: "all" as const, label: c.rangeAll },
  ];

  const monthly = data?.monthly ?? [];
  const maxAmount = monthly.reduce((m, x) => Math.max(m, x.amount), 0);

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Range control (decorative) */}
          <SegmentedControl className="w-full" options={options} value={range} onChange={setRange} />

          {loading ? (
            <div className="mt-4 space-y-4">
              <Skeleton className="h-[220px] w-full rounded-2xl" />
              <div className="flex gap-3">
                <Skeleton className="h-[84px] flex-1 rounded-2xl" />
                <Skeleton className="h-[84px] flex-1 rounded-2xl" />
              </div>
            </div>
          ) : (
            <>
              {/* Bar chart */}
              <Card className="mt-4 p-5">
                <div className="text-[13px] font-bold text-ink">{c.chartTitle}</div>
                {monthly.length === 0 ? (
                  <div className="mt-6 grid h-32 place-items-center text-[13px] text-ink-faint">
                    {c.noData}
                  </div>
                ) : (
                  <div className="mt-5">
                    <div className="relative flex h-40 items-end justify-between gap-2">
                      {monthly.map((bar, i) => (
                        <div
                          key={i}
                          className="w-full rounded-t-md bg-[linear-gradient(180deg,var(--brand-500),var(--brand-700))] transition-all duration-500"
                          style={{ height: `${maxAmount > 0 ? Math.max(4, (bar.amount / maxAmount) * 100) : 0}%` }}
                        />
                      ))}
                    </div>
                    {/* baseline */}
                    <div className="h-px w-full bg-line" />
                    {/* x-labels */}
                    <div className="mt-2 flex justify-between gap-2">
                      {monthly.map((bar, i) => (
                        <div
                          key={i}
                          className="w-full truncate text-center text-[11px] font-medium text-ink-faint tnum"
                        >
                          {bar.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* KPIs */}
              <SectionTitle>{c.metrics}</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label={c.trustScore} value={<span className="tnum">{data.score}</span>} tone="brand" />
                <StatCard label={c.rentals} value={<span className="tnum">{data.rentals}</span>} />
                <StatCard
                  label={c.onTime}
                  value={<span className="tnum">{data.onTimeRate}%</span>}
                  tone="verify"
                />
                <StatCard
                  label={c.totalPaid}
                  value={<span className="tnum">${data.totalPaid.toLocaleString()}</span>}
                />
              </div>

              {/* Insight banner */}
              <Card className="mt-4 flex items-start gap-3 border-brand/20 bg-brand-tint p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                <p className="min-w-0 self-center text-[14px] font-semibold leading-relaxed text-ink">
                  {c.insight}
                </p>
              </Card>
            </>
          )}
        </Screen>
      </PageFade>
    </>
  );
}
