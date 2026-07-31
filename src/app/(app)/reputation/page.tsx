"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, CreditCard, FileText, Lock, Check } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { AppHeader, SectionTitle } from "@/components/app-header";
import { Card, Skeleton } from "@/components/ui/primitives";
import { TrustRing, FactorBars } from "@/components/ui/trust";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { computeAndSyncTrust, type TrustBreakdown } from "@/lib/data";

const copy = {
  en: {
    title: "Reputation",
    computed: "Computed from your verified activity",
    breakdown: "How your score breaks down",
    improve: "How to improve",
    tip1Title: "Verify your identity",
    tip1Body: "A verified identity is the strongest single signal — it unlocks your full trust badge.",
    tip2Title: "Pay on time",
    tip2Body: "Every on-time rent payment recorded on-platform lifts your payment punctuality.",
    tip3Title: "Add your contracts",
    tip3Body: "More documented leases deepen your history and make your record more portable.",
    transparencyTitle: "Never a black box",
    transparencyBody: "Never a black box — every factor comes from real records.",
  },
  es: {
    title: "Reputación",
    computed: "Calculado con tu actividad verificada",
    breakdown: "Cómo se compone tu score",
    improve: "Cómo mejorar",
    tip1Title: "Verifica tu identidad",
    tip1Body: "Una identidad verificada es la señal más fuerte — activa tu badge de confianza completo.",
    tip2Title: "Paga a tiempo",
    tip2Body: "Cada pago de renta a tiempo registrado en la plataforma sube tu puntualidad.",
    tip3Title: "Añade tus contratos",
    tip3Body: "Más contratos documentados profundizan tu historial y hacen tu registro más portátil.",
    transparencyTitle: "Nunca una caja negra",
    transparencyBody: "Nunca una caja negra — cada factor viene de registros reales.",
  },
};

export default function ReputationScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const { user } = useAuth();
  const [breakdown, setBreakdown] = useState<TrustBreakdown | null>(null);

  useEffect(() => {
    let alive = true;
    if (!user) return;
    computeAndSyncTrust(user.id).then((b) => {
      if (alive) setBreakdown(b);
    });
    return () => {
      alive = false;
    };
  }, [user]);

  const loading = breakdown === null;

  const tips = [
    { icon: <ShieldCheck className="h-5 w-5" />, title: c.tip1Title, body: c.tip1Body },
    { icon: <CreditCard className="h-5 w-5" />, title: c.tip2Title, body: c.tip2Body },
    { icon: <FileText className="h-5 w-5" />, title: c.tip3Title, body: c.tip3Body },
  ];

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[132px] w-full rounded-2xl" />
              <Skeleton className="h-[172px] w-full rounded-2xl" />
              <Skeleton className="h-[120px] w-full rounded-2xl" />
            </div>
          ) : (
            <>
              {/* Score hero */}
              <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] p-6">
                <div className="flex items-center gap-5">
                  <TrustRing score={breakdown.score} size={104} tone="white" onDark />
                  <div className="min-w-0 text-white">
                    <div className="text-[26px] font-extrabold tracking-tight tnum">
                      {breakdown.score}
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/80">{c.computed}</p>
                  </div>
                </div>
              </Card>

              {/* Factor breakdown */}
              <SectionTitle>{c.breakdown}</SectionTitle>
              <Card className="p-5">
                <FactorBars factors={breakdown.factors} labelKey={locale} />
              </Card>

              {/* How to improve */}
              <SectionTitle>{c.improve}</SectionTitle>
              <Stagger className="flex flex-col gap-3">
                {tips.map((t, i) => (
                  <StaggerItem key={i}>
                    <Card className="flex items-start gap-3 p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                        {t.icon}
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
            </>
          )}
        </Screen>
      </PageFade>
    </>
  );
}
