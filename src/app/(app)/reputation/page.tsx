"use client";

import { TrendingUp, Eye, Lightbulb, Lock, Check } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { AppHeader, SectionTitle } from "@/components/app-header";
import { Card, Button } from "@/components/ui/primitives";
import { TrustRing, FactorBars } from "@/components/ui/trust";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { me, trustFactors } from "@/lib/mock";

const copy = {
  en: {
    title: "Reputation",
    yourIndex: "Your Trust Index",
    thisMonth: "this month",
    breakdown: "How your score breaks down",
    viewEvidence: "View evidence",
    improve: "How to improve",
    tip1Title: "Link your bank",
    tip1Body: "Bank-verified rent gives your payment factor the strongest signal.",
    tip2Title: "Keep communication on-platform",
    tip2Body: "Recorded, responsive messages lift your communication score.",
    tip3Title: "Close leases cleanly",
    tip3Body: "A documented, dispute-free move-out boosts contract compliance.",
    transparencyTitle: "Never a black box",
    transparencyBody:
      "Every factor is explainable and links to its evidence. You can always see exactly why your score is what it is — and so can anyone you choose to share it with.",
  },
  es: {
    title: "Reputación",
    yourIndex: "Tu índice de confianza",
    thisMonth: "este mes",
    breakdown: "Cómo se compone tu score",
    viewEvidence: "Ver evidencia",
    improve: "Cómo mejorar",
    tip1Title: "Vincula tu banco",
    tip1Body: "La renta verificada por el banco da la señal más fuerte a tu puntualidad.",
    tip2Title: "Comunícate en la plataforma",
    tip2Body: "Mensajes registrados y a tiempo elevan tu score de comunicación.",
    tip3Title: "Cierra contratos limpiamente",
    tip3Body: "Una salida documentada y sin disputas mejora el cumplimiento del contrato.",
    transparencyTitle: "Nunca una caja negra",
    transparencyBody:
      "Cada factor es explicable y enlaza con su evidencia. Siempre puedes ver exactamente por qué tu score es el que es — y quien tú elijas también.",
  },
};

export default function ReputationScreen() {
  const c = useT(copy);
  const { locale } = useLocale();

  const tips = [
    { title: c.tip1Title, body: c.tip1Body },
    { title: c.tip2Title, body: c.tip2Body },
    { title: c.tip3Title, body: c.tip3Body },
  ];

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Score header */}
          <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] p-6">
            <div className="flex items-center gap-5">
              <TrustRing score={me.trustScore} size={104} tone="white" onDark label="" />
              <div className="min-w-0 text-white">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                  {c.yourIndex}
                </div>
                <div className="mt-0.5 text-[15px] font-semibold opacity-95">
                  {locale === "es" ? me.ratingLabelEs : me.ratingLabelEn}
                </div>
                <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-bold">
                  <TrendingUp className="h-3.5 w-3.5" /> +3 {c.thisMonth}
                </span>
              </div>
            </div>
          </Card>

          {/* Factor breakdown with evidence */}
          <SectionTitle>{c.breakdown}</SectionTitle>
          <Card className="p-5">
            <FactorBars factors={trustFactors} labelKey={locale} />
            <div className="mt-4 flex flex-col divide-y divide-line border-t border-line">
              {trustFactors.map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-2 py-2.5">
                  <span className="truncate text-[14px] font-medium text-ink">
                    {locale === "es" ? f.labelEs : f.labelEn}
                  </span>
                  <Button variant="ghost" size="sm" href="/timeline" icon={<Eye className="h-4 w-4" />}>
                    {c.viewEvidence}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* How to improve */}
          <SectionTitle>{c.improve}</SectionTitle>
          <Stagger className="flex flex-col gap-3">
            {tips.map((t, i) => (
              <StaggerItem key={i}>
                <Card className="flex items-start gap-3 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-tint text-amber">
                    <Lightbulb className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-ink">{t.title}</div>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{t.body}</p>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Transparency note */}
          <Card className="mt-4 flex items-start gap-3 border-verify/20 bg-verify-tint p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-verify text-white">
              <Lock className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[14px] font-bold text-ink">
                <Check className="h-4 w-4 text-verify" strokeWidth={3} />
                {c.transparencyTitle}
              </div>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">
                {c.transparencyBody}
              </p>
            </div>
          </Card>
        </Screen>
      </PageFade>
    </>
  );
}
