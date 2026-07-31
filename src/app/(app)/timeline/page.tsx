"use client";

import { Paperclip } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Chip } from "@/components/ui/primitives";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { timeline, type TimelineEvent } from "@/lib/mock";

const copy = {
  en: {
    title: "History timeline",
    subtitle: "Every fact, with its evidence — context, not a verdict.",
    evidence: "Evidence on file",
  },
  es: {
    title: "Línea de tiempo",
    subtitle: "Cada hecho, con su evidencia — contexto, no un veredicto.",
    evidence: "Evidencia en archivo",
  },
};

const dotTone: Record<TimelineEvent["tone"], string> = {
  verify: "bg-verify",
  brand: "bg-brand",
  amber: "bg-amber",
  danger: "bg-danger",
};

const chipTone: Record<TimelineEvent["tone"], "verify" | "brand" | "pending" | "dispute"> = {
  verify: "verify",
  brand: "brand",
  amber: "pending",
  danger: "dispute",
};

export default function TimelineScreen() {
  const c = useT(copy);
  const { locale } = useLocale();

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <p className="mb-5 mt-1 text-[14px] text-ink-faint">{c.subtitle}</p>

          <div className="relative">
            {/* Vertical line */}
            <span className="absolute bottom-2 left-[7px] top-2 w-px bg-line-strong" aria-hidden />

            <Stagger className="space-y-4">
              {timeline.map((ev) => (
                <StaggerItem key={ev.id}>
                  <div className="relative pl-7">
                    {/* Node dot */}
                    <span
                      className={
                        "absolute left-0 top-4 grid h-[15px] w-[15px] place-items-center rounded-full ring-4 ring-canvas " +
                        dotTone[ev.tone]
                      }
                      aria-hidden
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                    </span>

                    <Card className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-[15px] font-bold text-ink">
                          {locale === "es" ? ev.titleEs : ev.titleEn}
                        </div>
                        <span className="shrink-0 whitespace-nowrap text-[12px] font-medium text-ink-faint tnum">
                          {ev.date}
                        </span>
                      </div>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
                        {locale === "es" ? ev.descEs : ev.descEn}
                      </p>
                      <div className="mt-3">
                        <Chip tone={chipTone[ev.tone]} icon={<Paperclip className="h-3.5 w-3.5" />}>
                          {c.evidence}
                        </Chip>
                      </div>
                    </Card>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
