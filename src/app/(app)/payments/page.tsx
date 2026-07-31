"use client";

import { useEffect, useState } from "react";
import { CreditCard, Sparkles, CircleDollarSign } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Button, Skeleton } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { fetchMyPayments, formatMonthYear, type PaymentItem } from "@/lib/data";

const copy = {
  en: {
    title: "Payment history",
    onTime: "on-time",
    summarySub: (ok: number, total: number) => `${ok} of ${total} payments on time`,
    onTimeLabel: "On time",
    lateLabel: "Late",
    export: "Export",
    emptyTitle: "No payments yet",
    emptyDesc: "Record rent payments from a property to build your verified payment record.",
    goToRecords: "Go to Records",
  },
  es: {
    title: "Historial de pagos",
    onTime: "a tiempo",
    summarySub: (ok: number, total: number) => `${ok} de ${total} pagos a tiempo`,
    onTimeLabel: "A tiempo",
    lateLabel: "Tardío",
    export: "Exportar",
    emptyTitle: "Aún no hay pagos",
    emptyDesc: "Registra pagos de renta desde una propiedad para construir tu historial verificado.",
    goToRecords: "Ir a Historial",
  },
};

export default function PaymentsScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const { user } = useAuth();
  const [items, setItems] = useState<PaymentItem[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchMyPayments(user.id).then((p) => alive && setItems(p));
    return () => {
      alive = false;
    };
  }, [user]);

  const total = items?.length ?? 0;
  const ok = items?.filter((p) => p.status === "onTime").length ?? 0;
  const rate = total > 0 ? Math.round((ok / total) * 100) : 0;

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {items === null ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : total === 0 ? (
            <EmptyState
              icon={<CircleDollarSign />}
              title={c.emptyTitle}
              description={c.emptyDesc}
              action={<Button href="/rentals">{c.goToRecords}</Button>}
            />
          ) : (
            <>
              {/* Summary */}
              <Card className="p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[40px] font-extrabold leading-none text-verify tnum">{rate}%</div>
                    <div className="mt-1 text-[13px] text-ink-faint">{c.summarySub(ok, total)}</div>
                  </div>
                  <Sparkles className="h-6 w-6 text-verify" />
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-verify" style={{ width: `${rate}%` }} />
                </div>
              </Card>

              {/* List */}
              <Stagger className="mt-4 space-y-2">
                {items.map((p) => {
                  const label =
                    p.dueDate ? formatMonthYear(p.dueDate, locale) : locale === "es" ? p.monthEs : p.monthEn;
                  return (
                    <StaggerItem key={p.id}>
                      <Card className="flex items-center gap-3 p-3.5">
                        <span
                          className={
                            "grid h-10 w-10 shrink-0 place-items-center rounded-xl " +
                            (p.status === "onTime" ? "bg-verify-tint text-verify" : "bg-amber-tint text-amber")
                          }
                        >
                          <CreditCard className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[15px] font-semibold text-ink">{label}</div>
                          <div className="text-[12.5px] text-ink-faint">
                            {p.status === "onTime" ? c.onTimeLabel : c.lateLabel}
                          </div>
                        </div>
                        <span className="text-[16px] font-bold text-ink tnum">${p.amount.toLocaleString()}</span>
                      </Card>
                    </StaggerItem>
                  );
                })}
              </Stagger>

              <div className="mt-5">
                <Button variant="secondary" full>
                  {c.export}
                </Button>
              </div>
            </>
          )}
        </Screen>
      </PageFade>
    </>
  );
}
