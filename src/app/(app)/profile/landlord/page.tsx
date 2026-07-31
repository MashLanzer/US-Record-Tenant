"use client";

import { Home, Star, Scale, ShieldCheck } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { AppHeader, SectionTitle } from "@/components/app-header";
import { Avatar, Card, Chip } from "@/components/ui/primitives";
import { TrustRing, FactorBars } from "@/components/ui/trust";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { landlordMe, landlordFactors } from "@/lib/mock";

const copy = {
  en: {
    title: "Landlord profile",
    propertiesVerified: "4 properties verified",
    yourIndex: "Landlord Trust Index",
    balanceTitle: "Trust goes both ways",
    balanceBody:
      "Landlords are rated by their tenants, just as tenants are rated by them. Fairness is mutual.",
    reviews: "Reviews from tenants",
    review1: "Returned my deposit in full within a week. Responsive and fair.",
    review1By: "María R. · 2 years",
    review2: "Repairs handled fast, always respectful of the lease terms.",
    review2By: "Ana P. · 1 year",
  },
  es: {
    title: "Perfil del propietario",
    propertiesVerified: "4 propiedades verificadas",
    yourIndex: "Índice de confianza del propietario",
    balanceTitle: "La confianza es mutua",
    balanceBody:
      "Los propietarios son calificados por sus inquilinos, igual que los inquilinos por ellos. La justicia va en ambas direcciones.",
    reviews: "Reseñas de inquilinos",
    review1: "Devolvió mi depósito completo en una semana. Atento y justo.",
    review1By: "María R. · 2 años",
    review2: "Reparaciones rápidas, siempre respetuoso con el contrato.",
    review2By: "Ana P. · 1 año",
  },
};

export default function LandlordProfileScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();

  const reviews = [
    { body: c.review1, by: c.review1By },
    { body: c.review2, by: c.review2By },
  ];

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Header */}
          <div className="flex flex-col items-center pt-2 text-center">
            <Avatar initials={landlordMe.initials} size={64} verified />
            <h1 className="mt-3 text-[24px] font-extrabold tracking-tight text-ink">
              {landlordMe.name}
            </h1>
            <div className="mt-1.5 flex items-center gap-2">
              <Chip tone="brand">{g.roles.landlord}</Chip>
              <Chip tone="verify" icon={<Home className="h-3.5 w-3.5" />}>
                {c.propertiesVerified}
              </Chip>
            </div>
          </div>

          {/* Trust card */}
          <Card className="mt-5 p-5">
            <div className="flex items-center gap-4">
              <TrustRing score={landlordMe.trustScore} size={92} />
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                  {c.yourIndex}
                </div>
                <div className="mt-0.5 text-[14px] font-semibold text-ink">
                  {locale === "es" ? landlordMe.ratingLabelEs : landlordMe.ratingLabelEn}
                </div>
              </div>
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <FactorBars factors={landlordFactors} labelKey={locale} />
            </div>
          </Card>

          {/* Balance note */}
          <Card className="mt-3 flex items-start gap-3 border-brand/20 bg-brand-tint p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
              <Scale className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="text-[14px] font-bold text-ink">{c.balanceTitle}</div>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{c.balanceBody}</p>
            </div>
          </Card>

          {/* Reviews teaser */}
          <SectionTitle>{c.reviews}</SectionTitle>
          <Stagger className="flex flex-col gap-3">
            {reviews.map((r, i) => (
              <StaggerItem key={i}>
                <Card className="p-4">
                  <div className="mb-2 flex items-center gap-1 text-verify">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-current" strokeWidth={0} />
                    ))}
                  </div>
                  <p className="text-[14px] leading-relaxed text-ink">{r.body}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-ink-faint">
                    <ShieldCheck className="h-3.5 w-3.5 text-verify" />
                    {r.by}
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Screen>
      </PageFade>
    </>
  );
}
