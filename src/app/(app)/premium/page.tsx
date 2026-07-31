"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Check, TrendingUp, Users, LayoutDashboard, Scale } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, SegmentedControl } from "@/components/ui/primitives";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT } from "@/lib/i18n";

const copy = {
  en: {
    title: "Tenant Trust Pro",
    heroTag: "Pro",
    heroTitle: "Grow trust faster.",
    heroBody: "Report rent, screen instantly, and manage your whole portfolio in one place.",
    monthly: "Monthly",
    annual: "Annual",
    recommended: "Recommended",
    perMonth: "/mo",
    annualNote: "Billed annually · save 20%",
    monthlyNote: "Billed monthly · cancel anytime",
    benefits: [
      "Report rent to credit bureaus",
      "Unlimited screening",
      "Portfolio dashboard",
      "Priority dispute handling",
    ],
    plansTitle: "Compare plans",
    free: "Free",
    freeDesc: "Your verified record, always yours.",
    pro: "Pro",
    proDesc: "For active renters and small landlords.",
    business: "Business",
    businessDesc: "For property managers and teams.",
    start: "Start Pro",
    fineprint: "Cancel anytime. Your verified record stays free, forever.",
  },
  es: {
    title: "Tenant Trust Pro",
    heroTag: "Pro",
    heroTitle: "Construye confianza más rápido.",
    heroBody: "Reporta la renta, evalúa al instante y gestiona todo tu portafolio en un solo lugar.",
    monthly: "Mensual",
    annual: "Anual",
    recommended: "Recomendado",
    perMonth: "/mes",
    annualNote: "Facturado anualmente · ahorra 20%",
    monthlyNote: "Facturado mensualmente · cancela cuando quieras",
    benefits: [
      "Reporta la renta a burós de crédito",
      "Evaluaciones ilimitadas",
      "Panel de portafolio",
      "Disputas con prioridad",
    ],
    plansTitle: "Compara planes",
    free: "Gratis",
    freeDesc: "Tu historial verificado, siempre tuyo.",
    pro: "Pro",
    proDesc: "Para inquilinos activos y pequeños propietarios.",
    business: "Business",
    businessDesc: "Para administradores y equipos.",
    start: "Empezar Pro",
    fineprint: "Cancela cuando quieras. Tu historial verificado es gratis, para siempre.",
  },
};

type Cycle = "monthly" | "annual";

const benefitIcons = [
  <TrendingUp key="0" className="h-[18px] w-[18px]" />,
  <Users key="1" className="h-[18px] w-[18px]" />,
  <LayoutDashboard key="2" className="h-[18px] w-[18px]" />,
  <Scale key="3" className="h-[18px] w-[18px]" />,
];

export default function PremiumScreen() {
  const c = useT(copy);
  const [cycle, setCycle] = useState<Cycle>("annual");
  const price = cycle === "annual" ? "7.99" : "9.99";

  const plans = [
    { name: c.free, desc: c.freeDesc, price: "$0", accent: false },
    { name: c.pro, desc: c.proDesc, price: `$${price}${c.perMonth}`, accent: true },
    { name: c.business, desc: c.businessDesc, price: "$24.99", accent: false },
  ];

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Hero */}
          <Card className="mt-1 overflow-hidden border-0 bg-[linear-gradient(135deg,var(--violet),#4c33a8)] p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              <Sparkles className="h-3.5 w-3.5" /> {c.heroTag}
            </span>
            <h2 className="mt-3 text-[22px] font-extrabold leading-tight text-white">{c.heroTitle}</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/80">{c.heroBody}</p>
          </Card>

          {/* Billing cycle */}
          <div className="mt-4">
            <SegmentedControl<Cycle>
              options={[
                { value: "monthly", label: c.monthly },
                { value: "annual", label: c.annual },
              ]}
              value={cycle}
              onChange={setCycle}
              className="w-full"
            />
          </div>

          {/* Recommended Pro plan */}
          <Card className="relative mt-4 border-[1.5px] border-violet/40 p-5 shadow-[var(--shadow-2)]">
            <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full bg-violet px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white">
              {c.recommended}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-[38px] font-extrabold leading-none text-ink tnum">${price}</span>
              <span className="text-[15px] font-semibold text-ink-faint">{c.perMonth}</span>
            </div>
            <p className="mt-1 text-[12.5px] text-ink-faint">
              {cycle === "annual" ? c.annualNote : c.monthlyNote}
            </p>

            <Stagger className="mt-4 space-y-3">
              {c.benefits.map((b, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-tint text-violet">
                      {benefitIcons[i]}
                    </span>
                    <span className="text-[14px] font-medium text-ink">{b}</span>
                    <Check className="ml-auto h-[18px] w-[18px] shrink-0 text-violet" strokeWidth={2.5} />
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </Card>

          {/* Compare plans */}
          <h2 className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
            {c.plansTitle}
          </h2>
          <div className="space-y-3">
            {plans.map((p) => (
              <Card
                key={p.name}
                className={`flex items-center gap-3 p-4 ${p.accent ? "border-[1.5px] border-violet/30 bg-violet-tint/40" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[15px] font-bold ${p.accent ? "text-violet" : "text-ink"}`}>{p.name}</span>
                    {p.accent && <Sparkles className="h-4 w-4 text-violet" />}
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-ink-faint">{p.desc}</p>
                </div>
                <span className="shrink-0 text-[15px] font-extrabold text-ink tnum">{p.price}</span>
              </Card>
            ))}
          </div>

          {/* Primary action */}
          <div className="mt-5">
            <Link
              href="/premium"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet px-4.5 py-3 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(109,79,203,.35)] transition-all duration-150 hover:brightness-105 active:scale-[.98]"
            >
              <Sparkles className="h-[18px] w-[18px]" />
              {c.start}
            </Link>
            <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-faint">{c.fineprint}</p>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
