"use client";

import { Download, TrendingUp, Check, Clock, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Button, Chip } from "@/components/ui/primitives";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { payments } from "@/lib/mock";

const copy = {
  en: {
    title: "Payment history",
    onTime: "on-time",
    summarySub: (ok: number, total: number) => `${ok} of ${total} payments on time · bank-verified`,
    onTimeLabel: "On time",
    lateLabel: "Late",
    export: "Export",
    reportBureau: "Report to bureau",
    premiumHint: "Premium",
  },
  es: {
    title: "Historial de pagos",
    onTime: "a tiempo",
    summarySub: (ok: number, total: number) => `${ok} de ${total} pagos a tiempo · verificado por banco`,
    onTimeLabel: "A tiempo",
    lateLabel: "Tardío",
    export: "Exportar",
    reportBureau: "Reportar al buró",
    premiumHint: "Premium",
  },
};

export default function PaymentsScreen() {
  const c = useT(copy);
  const { locale } = useLocale();

  const total = payments.length;
  const onTime = payments.filter((p) => p.status === "onTime").length;
  const pct = Math.round((onTime / total) * 100);

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Summary */}
          <Card className="p-5">
            <div className="flex items-baseline gap-2">
              <span className="text-[40px] font-extrabold leading-none tracking-tight text-verify tnum">
                {pct}%
              </span>
              <span className="text-[16px] font-semibold text-ink-soft">{c.onTime}</span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-verify-tint px-2.5 py-1 text-[11px] font-semibold text-verify">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
            </div>
            {/* Meter */}
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-verify transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-3 text-[13px] text-ink-faint">{c.summarySub(onTime, total)}</p>
          </Card>

          {/* Payment list */}
          <Card className="mt-4 p-0">
            <Stagger className="divide-y divide-line">
              {payments.map((p) => {
                const late = p.status === "late";
                return (
                  <StaggerItem key={p.id}>
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-semibold text-ink">
                          {locale === "es" ? p.monthEs : p.monthEn}
                        </div>
                        <div className="text-[13px] text-ink-faint tnum">{p.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[15px] font-bold text-ink tnum">
                          ${p.amount.toLocaleString()}
                        </div>
                      </div>
                      <Chip
                        tone={late ? "pending" : "verify"}
                        icon={
                          late ? <Clock className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />
                        }
                      >
                        {late ? c.lateLabel : c.onTimeLabel}
                      </Chip>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </Card>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <Button
              variant="secondary"
              full
              icon={<Download className="h-[18px] w-[18px]" />}
            >
              {c.export}
            </Button>
            <Button
              variant="ghost"
              full
              icon={<Sparkles className="h-[18px] w-[18px] text-violet" />}
              iconRight={
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-violet-tint px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet">
                  {c.premiumHint}
                </span>
              }
            >
              {c.reportBureau}
            </Button>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
