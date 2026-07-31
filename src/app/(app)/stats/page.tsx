"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { AppHeader, SectionTitle } from "@/components/app-header";
import { Card, StatCard, SegmentedControl } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";

type Range = "6m" | "1y" | "all";

const copy = {
  en: {
    title: "Statistics",
    range6m: "6M",
    range1y: "1Y",
    rangeAll: "All",
    chartTitle: "Trust score over time",
    metrics: "Key metrics",
    onTime: "On-time rate",
    avgRating: "Avg rating",
    verifications: "Verifications",
    insight: "Your score rose 8 points in the last 6 months.",
  },
  es: {
    title: "Estadísticas",
    range6m: "6M",
    range1y: "1A",
    rangeAll: "Todo",
    chartTitle: "Score de confianza en el tiempo",
    metrics: "Métricas clave",
    onTime: "Pagos a tiempo",
    avgRating: "Calificación media",
    verifications: "Verificaciones",
    insight: "Tu score subió 8 puntos en los últimos 6 meses.",
  },
};

// Normalized bar heights (0–100) per range — a gentle upward trend.
const SERIES: Record<Range, number[]> = {
  "6m": [62, 66, 70, 74, 80, 84, 88, 92],
  "1y": [54, 58, 63, 66, 72, 78, 84, 92],
  all: [40, 48, 55, 62, 70, 78, 85, 92],
};

export default function StatsScreen() {
  const c = useT(copy);
  const [range, setRange] = useState<Range>("6m");

  const bars = SERIES[range];
  const max = Math.max(...bars);

  const options = [
    { value: "6m" as const, label: c.range6m },
    { value: "1y" as const, label: c.range1y },
    { value: "all" as const, label: c.rangeAll },
  ];

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Range control */}
          <SegmentedControl className="w-full" options={options} value={range} onChange={setRange} />

          {/* Bar chart */}
          <Card className="mt-4 p-5">
            <div className="text-[13px] font-bold text-ink">{c.chartTitle}</div>
            <div className="relative mt-5">
              <div className="flex h-40 items-end justify-between gap-2">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-[linear-gradient(180deg,var(--brand-500),var(--brand-700))] transition-all duration-500"
                    style={{ height: `${(h / max) * 100}%` }}
                  />
                ))}
              </div>
              {/* baseline */}
              <div className="mt-0 h-px w-full bg-line-strong" />
            </div>
          </Card>

          {/* KPIs */}
          <SectionTitle>{c.metrics}</SectionTitle>
          <div className="flex gap-3">
            <StatCard label={c.onTime} value="100%" tone="verify" />
            <StatCard label={c.avgRating} value="92" tone="brand" />
            <StatCard label={c.verifications} value="3" />
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
        </Screen>
      </PageFade>
    </>
  );
}
