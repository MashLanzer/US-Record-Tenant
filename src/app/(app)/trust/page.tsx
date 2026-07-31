"use client";

import { ShieldCheck, Check, MessageSquare, Send } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { AppHeader } from "@/components/app-header";
import { Avatar, Card, Chip, Button } from "@/components/ui/primitives";
import { TrustRing } from "@/components/ui/trust";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { publicProfile } from "@/lib/mock";

const copy = {
  en: {
    title: "Trust profile",
    verifiedChip: "Identity + 2 leases verified",
    indexLabel: "Trust Index",
    punctuality: "Payment punctuality",
    excellent: "Excellent",
    highlights: "What tenants and landlords say",
    request: "Request rental",
    contact: "Contact",
  },
  es: {
    title: "Perfil de confianza",
    verifiedChip: "Identidad + 2 contratos verificados",
    indexLabel: "Índice de confianza",
    punctuality: "Puntualidad de pago",
    excellent: "Excelente",
    highlights: "Lo que dicen inquilinos y propietarios",
    request: "Solicitar alquiler",
    contact: "Contactar",
  },
};

export default function PublicTrustScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const highlights = locale === "es" ? publicProfile.highlightsEs : publicProfile.highlightsEn;

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Hero */}
          <div className="flex flex-col items-center pt-3 text-center">
            <Avatar initials={publicProfile.initials} size={72} verified />
            <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-ink">
              {publicProfile.name}
            </h1>
            <div className="mt-2">
              <Chip tone="verify" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                {c.verifiedChip}
              </Chip>
            </div>
          </div>

          {/* Score card */}
          <Card className="mt-5 flex flex-col items-center p-6 text-center">
            <TrustRing score={publicProfile.trustScore} size={128} />
            <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-ink-faint">
              {c.indexLabel}
            </div>
            <p className="mt-1 text-[15px] font-semibold text-ink">
              {locale === "es" ? publicProfile.descEs : publicProfile.descEn}
            </p>
          </Card>

          {/* Punctuality bar */}
          <Card className="mt-3 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-ink">{c.punctuality}</span>
              <span className="text-[13px] font-bold text-verify">{c.excellent}</span>
            </div>
            <div className="h-[9px] overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-verify" style={{ width: "97%" }} />
            </div>
          </Card>

          {/* Highlights */}
          <div className="mt-6 mb-2.5 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
            {c.highlights}
          </div>
          <Card className="p-2">
            <Stagger>
              {highlights.map((h, i) => (
                <StaggerItem key={i}>
                  <div
                    className={`flex items-center gap-3 px-2 py-2.5 ${
                      i > 0 ? "border-t border-line" : ""
                    }`}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-verify-tint text-verify">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <span className="text-[14px] font-medium text-ink">{h}</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </Card>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            <Button full icon={<Send className="h-[18px] w-[18px]" />}>
              {c.request}
            </Button>
            <Button variant="ghost" full icon={<MessageSquare className="h-[18px] w-[18px]" />}>
              {c.contact}
            </Button>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
