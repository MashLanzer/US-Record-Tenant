"use client";

import Link from "next/link";
import { Bell, ChevronRight, ShieldCheck, TrendingUp, FileCheck2, Plus } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { SectionTitle } from "@/components/app-header";
import { Avatar, Card, StatCard, Button } from "@/components/ui/primitives";
import { TrustRing } from "@/components/ui/trust";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { me, notifications } from "@/lib/mock";

const copy = {
  en: {
    greeting: "Good afternoon",
    yourScore: "YOUR TRUST INDEX",
    thisMonth: "this month",
    rentals: "Rentals",
    onTime: "On-time",
    activity: "Recent activity",
    addContract: "Add contract",
    seeReputation: "See how your score works",
  },
  es: {
    greeting: "Buenas tardes",
    yourScore: "TU ÍNDICE DE CONFIANZA",
    thisMonth: "este mes",
    rentals: "Alquileres",
    onTime: "Pagos ok",
    activity: "Actividad reciente",
    addContract: "Añadir contrato",
    seeReputation: "Cómo funciona tu score",
  },
};

export default function HomeScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <PageFade>
      <Screen>
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-ink-faint">{c.greeting}</p>
            <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{me.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="relative grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface text-ink-soft"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-surface bg-brand" />
              )}
            </Link>
            <Link href="/profile" aria-label="Profile">
              <Avatar initials={me.initials} size={44} verified />
            </Link>
          </div>
        </div>

        {/* Trust score hero card */}
        <Link href="/reputation" className="mt-4 block">
          <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] p-5">
            <div className="flex items-center gap-4">
              <TrustRing score={me.trustScore} size={92} tone="white" onDark label="" />
              <div className="min-w-0 text-white">
                <div className="text-[10px] font-semibold opacity-85">{c.yourScore}</div>
                <div className="mt-0.5 text-[13px] opacity-95">
                  {locale === "es" ? me.ratingLabelEs : me.ratingLabelEn}
                </div>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">
                  <TrendingUp className="h-3.5 w-3.5" /> +3 {c.thisMonth}
                </span>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-white/70" />
            </div>
          </Card>
        </Link>

        {/* KPIs */}
        <div className="mt-3 flex gap-3">
          <StatCard label={c.rentals} value="3" />
          <StatCard label={c.onTime} value="100%" tone="verify" />
        </div>

        {/* Activity */}
        <SectionTitle action={<Link href="/timeline" className="text-[13px] font-semibold text-brand">{g.actions.seeAll}</Link>}>
          {c.activity}
        </SectionTitle>
        <Card className="p-2">
          <Stagger>
            {[
              { icon: <ShieldCheck className="h-5 w-5" />, tone: "verify", en: "Your contract was verified", es: "Tu contrato fue verificado", sub: "742 Ocean Ave", t: "2h" },
              { icon: <FileCheck2 className="h-5 w-5" />, tone: "brand", en: "December rent recorded on time", es: "Renta de diciembre a tiempo", sub: "$2,400", t: "1d" },
            ].map((a, i) => (
              <StaggerItem key={i}>
                <div className="flex items-center gap-3 rounded-xl p-2">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${a.tone === "verify" ? "bg-verify-tint text-verify" : "bg-brand-tint text-brand"}`}
                  >
                    {a.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-ink">{locale === "es" ? a.es : a.en}</div>
                    <div className="text-[12px] text-ink-faint">{a.sub}</div>
                  </div>
                  <span className="text-[12px] text-ink-faint">{a.t}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Card>

        {/* Primary action */}
        <div className="mt-5">
          <Button href="/rentals" full icon={<Plus className="h-[18px] w-[18px]" />}>
            {c.addContract}
          </Button>
        </div>
      </Screen>
    </PageFade>
  );
}
