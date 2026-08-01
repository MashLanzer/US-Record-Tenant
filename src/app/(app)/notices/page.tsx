"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gavel, ShieldQuestion, FileDown, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Chip, Skeleton } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { fetchAdverseActionsReceived, type AdverseActionItem, type AdverseDecision } from "@/lib/data";

const copy = {
  en: {
    title: "Adverse action notices",
    intro: "When someone takes an adverse housing decision based on your Tenant Trust information, the notice appears here — along with your rights.",
    empty: "No notices. You'll see any adverse action notices here.",
    from: "From",
    reasons: "Reasons given",
    decisions: {
      denied: "Application denied",
      conditional: "Approved with conditions",
      deposit_increase: "Higher deposit required",
      cosigner_required: "Cosigner required",
      other: "Adverse action",
    } as Record<AdverseDecision, string>,
    rightsTitle: "Your rights",
    r1: "Tenant Trust did not make this decision and cannot explain the specific reasons — only the issuer can.",
    r2: "You can get a free copy of your information anytime — it's on your profile and trust report.",
    r3: "You can dispute anything inaccurate. We reinvestigate within 30 days.",
    viewReport: "View my trust report",
    dispute: "Open a dispute",
  },
  es: {
    title: "Avisos de acción adversa",
    intro: "Cuando alguien toma una decisión de vivienda adversa con base en tu información de Tenant Trust, el aviso aparece aquí — junto con tus derechos.",
    empty: "Sin avisos. Aquí verás cualquier aviso de acción adversa.",
    from: "De",
    reasons: "Razones dadas",
    decisions: {
      denied: "Solicitud denegada",
      conditional: "Aprobada con condiciones",
      deposit_increase: "Se requiere depósito mayor",
      cosigner_required: "Se requiere cosignatario",
      other: "Acción adversa",
    } as Record<AdverseDecision, string>,
    rightsTitle: "Tus derechos",
    r1: "Tenant Trust no tomó esta decisión y no puede explicar las razones específicas — solo quien la emitió.",
    r2: "Puedes obtener una copia gratuita de tu información cuando quieras — está en tu perfil y reporte de confianza.",
    r3: "Puedes disputar cualquier cosa inexacta. Reinvestigamos dentro de 30 días.",
    viewReport: "Ver mi reporte de confianza",
    dispute: "Abrir una disputa",
  },
};

export default function NoticesScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const { user } = useAuth();
  const [items, setItems] = useState<AdverseActionItem[] | null>(null);

  useEffect(() => {
    if (user) fetchAdverseActionsReceived(user.id).then(setItems);
  }, [user]);

  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(locale === "es" ? "es" : "en", { dateStyle: "long" });
    } catch {
      return iso;
    }
  };

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <p className="text-[13.5px] leading-snug text-ink-soft">{c.intro}</p>

          {items === null ? (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ) : items.length === 0 ? (
            <Card className="mt-4 flex flex-col items-center gap-3 p-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-tint text-brand">
                <Gavel className="h-6 w-6" />
              </span>
              <p className="text-[13.5px] leading-snug text-ink-soft">{c.empty}</p>
            </Card>
          ) : (
            <div className="mt-4 space-y-4">
              {items.map((a) => (
                <Card key={a.id} className="p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-tint text-amber">
                      <Gavel className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-bold text-ink">{c.decisions[a.decision]}</div>
                      <div className="text-[12.5px] text-ink-faint">
                        {c.from} {a.issuerName} · {fmt(a.createdAt)}
                      </div>
                    </div>
                  </div>

                  {a.reasons.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">{c.reasons}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {a.reasons.map((r, i) => (
                          <Chip key={i} tone="pending">
                            {r}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}
                  {a.note && <p className="mt-2 text-[13px] leading-snug text-ink-soft">{a.note}</p>}

                  {/* Rights */}
                  <div className="mt-4 rounded-xl bg-surface-2 p-3.5">
                    <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-ink">
                      <ShieldQuestion className="h-4 w-4 text-brand" /> {c.rightsTitle}
                    </div>
                    <ul className="mt-2 space-y-1.5 text-[12.5px] leading-snug text-ink-soft">
                      <li>• {c.r1}</li>
                      <li>• {c.r2}</li>
                      <li>• {c.r3}</li>
                    </ul>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <Link href="/reputation" className="flex items-center gap-1.5 text-[13px] font-semibold text-brand">
                        <FileDown className="h-4 w-4" /> {c.viewReport}
                      </Link>
                      <Link href="/appeals" className="flex items-center gap-1.5 text-[13px] font-semibold text-brand">
                        <ChevronRight className="h-4 w-4" /> {c.dispute}
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Screen>
      </PageFade>
    </>
  );
}
