"use client";

import { useEffect, useState } from "react";
import { Clock, CreditCard, FileText, Plus } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Chip, Button, Skeleton } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { fetchMyTimeline, type TimelineItem } from "@/lib/data";

const copy = {
  en: {
    title: "History timeline",
    subtitle: "Every fact, with its evidence — context, not a verdict.",
    kindLease: "Lease",
    kindPayment: "Payment",
    emptyTitle: "No history yet",
    emptyDesc: "Add your first contract to start building your verified rental history.",
    addContract: "Add contract",
  },
  es: {
    title: "Línea de tiempo",
    subtitle: "Cada hecho, con su evidencia — contexto, no un veredicto.",
    kindLease: "Contrato",
    kindPayment: "Pago",
    emptyTitle: "Aún no hay historial",
    emptyDesc: "Añade tu primer contrato para empezar a construir tu historial de alquiler verificado.",
    addContract: "Añadir contrato",
  },
};

const dotTone: Record<TimelineItem["tone"], string> = {
  verify: "bg-verify",
  brand: "bg-brand",
  amber: "bg-amber",
  danger: "bg-danger",
};

const chipTone: Record<TimelineItem["tone"], "verify" | "brand" | "pending" | "dispute"> = {
  verify: "verify",
  brand: "brand",
  amber: "pending",
  danger: "dispute",
};

export default function TimelineScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const { user } = useAuth();
  const [items, setItems] = useState<TimelineItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    if (!user) return;
    fetchMyTimeline(user.id).then((t) => {
      if (alive) setItems(t);
    });
    return () => {
      alive = false;
    };
  }, [user]);

  const loading = items === null;

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <p className="mb-5 mt-1 text-[14px] text-ink-faint">{c.subtitle}</p>

          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[112px] w-full rounded-2xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Clock />}
              title={c.emptyTitle}
              description={c.emptyDesc}
              action={
                <Button href="/rentals/new" icon={<Plus className="h-[18px] w-[18px]" />}>
                  {c.addContract}
                </Button>
              }
            />
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <span className="absolute bottom-2 left-[7px] top-2 w-px bg-line-strong" aria-hidden />

              <Stagger className="space-y-4">
                {items.map((item) => (
                  <StaggerItem key={item.id}>
                    <div className="relative pl-7">
                      {/* Node dot */}
                      <span
                        className={
                          "absolute left-0 top-4 grid h-[15px] w-[15px] place-items-center rounded-full ring-4 ring-canvas " +
                          dotTone[item.tone]
                        }
                        aria-hidden
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                      </span>

                      <Card className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-[15px] font-bold text-ink">
                            {locale === "es" ? item.titleEs : item.titleEn}
                          </div>
                          <span className="shrink-0 whitespace-nowrap text-[12px] font-medium text-ink-faint tnum">
                            {item.date}
                          </span>
                        </div>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
                          {locale === "es" ? item.descEs : item.descEn}
                        </p>
                        <div className="mt-3">
                          <Chip
                            tone={chipTone[item.tone]}
                            icon={
                              item.kind === "payment" ? (
                                <CreditCard className="h-3.5 w-3.5" />
                              ) : (
                                <FileText className="h-3.5 w-3.5" />
                              )
                            }
                          >
                            {item.kind === "payment" ? c.kindPayment : c.kindLease}
                          </Chip>
                        </div>
                      </Card>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}
        </Screen>
      </PageFade>
    </>
  );
}
