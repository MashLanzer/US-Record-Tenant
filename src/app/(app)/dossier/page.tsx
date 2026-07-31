"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Eye, Download, Lock } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { AppHeader, SectionTitle } from "@/components/app-header";
import { Card, Button, Skeleton } from "@/components/ui/primitives";
import { TrustRing } from "@/components/ui/trust";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { useAuth } from "@/lib/auth";
import {
  fetchAccessLog,
  fetchMyRentals,
  fetchMyPayments,
  listDocuments,
  type AccessLogItem,
} from "@/lib/data";

const copy = {
  en: {
    title: "Your dossier",
    intro: "Everything on file about you — and everyone who has looked. Your file, under your control.",
    whatOthers: "What others see",
    accessed: "Who accessed your file",
    accessEmpty: "No one has viewed your file yet",
    accessNote: "You're notified every time someone opens your file.",
    dataSources: "Your data & sources",
    dispute: "Dispute",
    download: "Download my file",
    memberSummary: "Public trust summary",
    verified: "Identity verified",
    // data labels
    payments: "Payment history",
    paymentsSrc: "Bank-linked ledger",
    rentals: "Rentals",
    rentalsSrc: "Verified leases",
    documents: "Documents",
    documentsSrc: "Encrypted storage",
    identity: "Identity",
    identitySrc: "Government ID / prototype",
    records: "records",
    on: "on file",
  },
  es: {
    title: "Tu expediente",
    intro: "Todo lo que consta sobre ti — y quién lo ha consultado. Tu expediente, bajo tu control.",
    whatOthers: "Lo que otros ven",
    accessed: "Quién accedió a tu expediente",
    accessEmpty: "Nadie ha visto tu expediente aún",
    accessNote: "Se te notifica cada vez que alguien abre tu expediente.",
    dataSources: "Tus datos y fuentes",
    dispute: "Disputar",
    download: "Descargar mi expediente",
    memberSummary: "Resumen público de confianza",
    verified: "Identidad verificada",
    // data labels
    payments: "Historial de pagos",
    paymentsSrc: "Ledger vinculado al banco",
    rentals: "Alquileres",
    rentalsSrc: "Contratos verificados",
    documents: "Documentos",
    documentsSrc: "Almacenamiento cifrado",
    identity: "Identidad",
    identitySrc: "ID oficial / prototipo",
    records: "registros",
    on: "en archivo",
  },
};

type Counts = { payments: number; rentals: number; documents: number };

export default function DossierScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();
  const { user, profile } = useAuth();

  const [accessLog, setAccessLog] = useState<AccessLogItem[] | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchAccessLog(user.id, locale).then((a) => alive && setAccessLog(a));
    Promise.all([
      fetchMyRentals(user.id),
      fetchMyPayments(user.id),
      listDocuments(user.id),
    ]).then(([rentals, payments, docs]) => {
      if (alive) {
        setCounts({ payments: payments.length, rentals: rentals.length, documents: docs.length });
      }
    });
    return () => {
      alive = false;
    };
  }, [user, locale]);

  const idVerified = Boolean(profile?.identity_verified);

  const dataPoints = [
    {
      title: c.payments,
      src: c.paymentsSrc,
      value: counts ? `${counts.payments} ${c.records}` : null,
    },
    {
      title: c.rentals,
      src: c.rentalsSrc,
      value: counts ? `${counts.rentals} ${c.records}` : null,
    },
    {
      title: c.documents,
      src: c.documentsSrc,
      value: counts ? `${counts.documents} ${c.records}` : null,
    },
    {
      title: c.identity,
      src: c.identitySrc,
      value: idVerified ? g.status.verified : g.status.pending,
    },
  ];

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <p className="mt-1 max-w-[46ch] text-[14px] leading-relaxed text-ink-soft">{c.intro}</p>

          {/* (a) What others see — public profile mirror */}
          <SectionTitle>{c.whatOthers}</SectionTitle>
          <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] p-5">
            <div className="flex items-center gap-4">
              <TrustRing score={profile?.trust_score ?? 0} size={84} tone="white" onDark label="" />
              <div className="min-w-0 text-white">
                <div className="text-[15px] font-bold">{profile?.full_name ?? "—"}</div>
                <div className="mt-0.5 text-[13px] text-white/80">{c.memberSummary}</div>
                {idVerified && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
                    <ShieldCheck className="h-3 w-3" /> {c.verified}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* (b) Who accessed your file */}
          <SectionTitle>{c.accessed}</SectionTitle>
          {accessLog === null ? (
            <Card className="space-y-2 p-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </Card>
          ) : accessLog.length === 0 ? (
            <Card className="p-5">
              <p className="text-center text-[13px] text-ink-faint">{c.accessEmpty}</p>
            </Card>
          ) : (
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
                        <div className="truncate text-[12.5px] text-ink-faint">{a.reason}</div>
                      </div>
                      <span className="shrink-0 whitespace-nowrap text-[12px] text-ink-faint tnum">
                        {a.whenLabel}
                      </span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </Card>
          )}
          <p className="mt-2 px-1 text-[12.5px] text-ink-faint">{c.accessNote}</p>

          {/* (c) Your data & sources */}
          <SectionTitle>{c.dataSources}</SectionTitle>
          <Card className="divide-y divide-line p-0">
            {dataPoints.map((d) => (
              <div key={d.title} className="flex items-center gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-semibold text-ink">{d.title}</span>
                    {d.value && (
                      <span className="shrink-0 text-[12px] text-ink-faint tnum">{d.value}</span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                    {d.src}
                  </div>
                </div>
                <Button href="/appeals" variant="ghost" size="sm">
                  {c.dispute}
                </Button>
              </div>
            ))}
          </Card>

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
