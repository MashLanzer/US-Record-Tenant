"use client";

import { ShieldCheck, Eye, Download, Flag, Lock } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { AppHeader, SectionTitle } from "@/components/app-header";
import { Card, Button, Chip } from "@/components/ui/primitives";
import { TrustRing } from "@/components/ui/trust";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { me, accessLog } from "@/lib/mock";

const copy = {
  en: {
    title: "Your dossier",
    intro: "Everything on file about you — and everyone who has looked. Your file, under your control.",
    whatOthers: "What others see",
    publicSummary: "This is the summary shared when you apply.",
    accessed: "Who accessed your file",
    accessNote: "You are notified every time someone opens your file.",
    dataSources: "Your data & sources",
    dataNote: "Each fact is backed by a source. Something look off? Dispute it.",
    dispute: "Dispute",
    download: "Download my file",
    source: "Source",
    hl1: "Always paid on time",
    hl2: "Left property clean",
    hl3: "No incidents",
    d1: "Payment history",
    d1src: "Bank-linked ledger · Plaid",
    d2: "Identity",
    d2src: "Government ID · verified May 2024",
    d3: "Lease · 742 Ocean Ave",
    d3src: "Signed contract · David C.",
    d4: "Property care",
    d4src: "Move-out report · Sunrise Property Mgmt",
  },
  es: {
    title: "Tu expediente",
    intro: "Todo lo que consta sobre ti — y quién lo ha consultado. Tu expediente, bajo tu control.",
    whatOthers: "Lo que otros ven",
    publicSummary: "Este es el resumen que se comparte cuando aplicas.",
    accessed: "Quién accedió a tu expediente",
    accessNote: "Se te notifica cada vez que alguien abre tu expediente.",
    dataSources: "Tus datos y fuentes",
    dataNote: "Cada dato tiene una fuente. ¿Algo no cuadra? Dispútalo.",
    dispute: "Disputar",
    download: "Descargar mi expediente",
    source: "Fuente",
    hl1: "Siempre pagó a tiempo",
    hl2: "Entregó la propiedad limpia",
    hl3: "Sin incidencias",
    d1: "Historial de pagos",
    d1src: "Ledger vinculado al banco · Plaid",
    d2: "Identidad",
    d2src: "ID oficial · verificado may 2024",
    d3: "Contrato · 742 Ocean Ave",
    d3src: "Contrato firmado · David C.",
    d4: "Cuidado de la propiedad",
    d4src: "Reporte de salida · Sunrise Property Mgmt",
  },
};

export default function DossierScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();

  const highlights = [c.hl1, c.hl2, c.hl3];
  const dataPoints = [
    { title: c.d1, src: c.d1src },
    { title: c.d2, src: c.d2src },
    { title: c.d3, src: c.d3src },
    { title: c.d4, src: c.d4src },
  ];

  return (
    <>
      <AppHeader title={c.title} />
      <PageFade>
        <Screen>
          <p className="mt-1 max-w-[46ch] text-[14px] leading-relaxed text-ink-soft">
            {c.intro}
          </p>

          {/* (a) What others see — public profile mirror */}
          <SectionTitle>{c.whatOthers}</SectionTitle>
          <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] p-5">
            <div className="flex items-center gap-4">
              <TrustRing score={me.trustScore} size={84} tone="white" onDark label="" />
              <div className="min-w-0 text-white">
                <div className="text-[15px] font-bold">{me.name}</div>
                <div className="mt-0.5 text-[13px] opacity-95">
                  {locale === "es" ? me.ratingLabelEs : me.ratingLabelEn}
                </div>
                <div className="mt-0.5 text-[12px] opacity-80">
                  {locale === "es" ? me.yearsEs : me.yearsEn}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/15 pt-4">
              {highlights.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white"
                >
                  <ShieldCheck className="h-3 w-3" /> {h}
                </span>
              ))}
            </div>
          </Card>
          <p className="mt-2 px-1 text-[12.5px] text-ink-faint">{c.publicSummary}</p>

          {/* (b) Who accessed your file */}
          <SectionTitle>{c.accessed}</SectionTitle>
          <Card className="p-2">
            <Stagger>
              {accessLog.map((a) => (
                <StaggerItem key={a.id}>
                  <div className="flex items-center gap-3 rounded-xl p-2">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-3 text-ink-soft">
                      <Eye className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold text-ink">{a.who}</div>
                      <div className="truncate text-[12.5px] text-ink-faint">
                        {locale === "es" ? a.reasonEs : a.reasonEn}
                      </div>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-[12px] text-ink-faint tnum">
                      {locale === "es" ? a.whenEs : a.whenEn}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </Card>
          <p className="mt-2 px-1 text-[12.5px] text-ink-faint">{c.accessNote}</p>

          {/* (c) Your data & sources */}
          <SectionTitle>{c.dataSources}</SectionTitle>
          <Card className="divide-y divide-line p-0">
            {dataPoints.map((d) => (
              <div key={d.title} className="flex items-center gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-ink">{d.title}</div>
                  <div className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                    {d.src}
                  </div>
                </div>
                <Button variant="ghost" size="sm" icon={<Flag className="h-3.5 w-3.5" />}>
                  {c.dispute}
                </Button>
              </div>
            ))}
          </Card>
          <p className="mt-2 px-1 text-[12.5px] text-ink-faint">{c.dataNote}</p>

          {/* Control footer */}
          <div className="mt-6">
            <Button full icon={<Download className="h-[18px] w-[18px]" />}>
              {c.download}
            </Button>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-ink-faint">
              <Lock className="h-3.5 w-3.5" />
              <span>{g.tagline}</span>
            </div>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
