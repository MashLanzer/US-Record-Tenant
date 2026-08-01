"use client";

import Link from "next/link";
import { ShieldCheck, Scale, FileText, Lock, ChevronRight, Heart, Home, MapPin } from "lucide-react";
import { AppHeader, SectionTitle } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, ListRow } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";

const APP_VERSION = "0.5.0";

const copy = {
  en: {
    title: "About",
    tagline: "Verifiable rental trust — for both sides.",
    mission:
      "Tenant Trust builds a fair, factual record between landlords and tenants. It is not a blacklist: every fact can be answered, disputes show both sides, and trust is earned by verified history — not opinions.",
    principles: "Our principles",
    factsTitle: "Facts, not opinions",
    factsSub: "Only verifiable events, with evidence.",
    bilateralTitle: "Both sides are heard",
    bilateralSub: "Every fact can be disputed and answered.",
    privacyTitle: "Your data, your control",
    privacySub: "You choose who sees your record.",
    legal: "Legal",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    fcra: "FCRA notice",
    fairHousing: "Fair Housing policy",
    stateRules: "State screening rules",
    version: "Version",
    madeWith: "Made with care for renters and owners alike.",
    equalHousing: "Equal Housing Opportunity. We do not tolerate discrimination based on any protected class.",
  },
  es: {
    title: "Acerca de",
    tagline: "Confianza de alquiler verificable — para ambas partes.",
    mission:
      "Tenant Trust construye un historial justo y basado en hechos entre propietarios e inquilinos. No es una lista negra: cada hecho puede responderse, las disputas muestran ambas versiones y la confianza se gana con historial verificado — no con opiniones.",
    principles: "Nuestros principios",
    factsTitle: "Hechos, no opiniones",
    factsSub: "Solo eventos verificables, con evidencia.",
    bilateralTitle: "Ambas partes son escuchadas",
    bilateralSub: "Cada hecho puede disputarse y responderse.",
    privacyTitle: "Tus datos, tu control",
    privacySub: "Tú eliges quién ve tu historial.",
    legal: "Legal",
    terms: "Términos del servicio",
    privacy: "Política de privacidad",
    fcra: "Aviso FCRA",
    fairHousing: "Política de Vivienda Justa",
    stateRules: "Reglas estatales de screening",
    version: "Versión",
    madeWith: "Hecho con cuidado para inquilinos y propietarios por igual.",
    equalHousing: "Igualdad de Oportunidad de Vivienda. No toleramos la discriminación por ninguna clase protegida.",
  },
};

export default function AboutScreen() {
  const c = useT(copy);
  const chevron = <ChevronRight className="h-5 w-5 text-ink-faint" />;

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <div className="flex flex-col items-center pt-2 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] text-white">
              <ShieldCheck className="h-8 w-8" />
            </span>
            <h1 className="mt-3 text-[22px] font-extrabold tracking-tight text-ink">Tenant Trust</h1>
            <p className="mt-1 text-[13.5px] text-ink-soft">{c.tagline}</p>
          </div>

          <Card className="mt-5 p-4">
            <p className="text-[13.5px] leading-relaxed text-ink-soft">{c.mission}</p>
          </Card>

          <SectionTitle>{c.principles}</SectionTitle>
          <Card className="divide-y divide-line px-3.5">
            <ListRow icon={<Scale className="h-5 w-5" />} title={c.factsTitle} subtitle={c.factsSub} tone="brand" />
            <ListRow icon={<ShieldCheck className="h-5 w-5" />} title={c.bilateralTitle} subtitle={c.bilateralSub} tone="verify" />
            <ListRow icon={<Lock className="h-5 w-5" />} title={c.privacyTitle} subtitle={c.privacySub} tone="neutral" />
          </Card>

          <SectionTitle>{c.legal}</SectionTitle>
          <Card className="divide-y divide-line px-3.5">
            <ListRow icon={<FileText className="h-5 w-5" />} title={c.terms} right={chevron} href="/legal/terms" />
            <ListRow icon={<Lock className="h-5 w-5" />} title={c.privacy} right={chevron} href="/legal/privacy" />
            <ListRow icon={<Scale className="h-5 w-5" />} title={c.fcra} right={chevron} href="/legal/fcra" />
            <ListRow icon={<Home className="h-5 w-5" />} title={c.fairHousing} right={chevron} href="/legal/fair-housing" />
            <ListRow icon={<MapPin className="h-5 w-5" />} title={c.stateRules} right={chevron} href="/legal/state-rules" />
          </Card>

          <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-line bg-surface-2 p-3.5">
            <Home className="h-5 w-5 shrink-0 text-brand" />
            <p className="text-[12px] leading-snug text-ink-soft">{c.equalHousing}</p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-1 text-center">
            <span className="text-[12.5px] text-ink-faint">
              {c.version} {APP_VERSION}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-ink-faint">
              {c.madeWith} <Heart className="h-3.5 w-3.5 text-brand" fill="currentColor" />
            </span>
            <Link href="/help" className="mt-1 text-[13px] font-semibold text-brand">
              {"Help & support"}
            </Link>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
