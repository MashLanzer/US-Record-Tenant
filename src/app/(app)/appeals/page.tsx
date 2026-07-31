"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Clock,
  Check,
  Upload,
  MessageSquarePlus,
  Scale,
  ChevronDown,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Button, Card, Chip } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { cn } from "@/lib/cn";
import { useT, useLocale } from "@/lib/i18n";

type StepState = "done" | "current" | "todo";

const copy = {
  en: {
    title: "Appeals center",
    subtitle: "A fair path to resolve any disputed fact.",
    steps: { submitted: "Submitted", review: "Under review", resolution: "Resolution" },
    resolveWindow: "Resolution within 30 days",
    inReview: "In review",
    resolved: "Resolved",
    addEvidence: "Add evidence",
    addStatement: "Add my statement",
    reassure: "Both parties can add evidence and be heard before anything is decided.",
  },
  es: {
    title: "Centro de apelaciones",
    subtitle: "Un camino justo para resolver cualquier hecho en disputa.",
    steps: { submitted: "Enviado", review: "En revisión", resolution: "Resolución" },
    resolveWindow: "Resolución en un plazo de 30 días",
    inReview: "En revisión",
    resolved: "Resuelto",
    addEvidence: "Agregar evidencia",
    addStatement: "Agregar mi declaración",
    reassure: "Ambas partes pueden aportar evidencia y ser escuchadas antes de decidir.",
  },
};

type DisputeCase = {
  id: string;
  titleEn: string;
  titleEs: string;
  refEn: string;
  refEs: string;
  status: "review" | "resolved";
  step: 0 | 1 | 2;
};

const cases: DisputeCase[] = [
  {
    id: "d1",
    titleEn: "Late payment · September",
    titleEs: "Pago tardío · septiembre",
    refEn: "742 Ocean Ave · reported by David C.",
    refEs: "742 Ocean Ave · reportado por David C.",
    status: "review",
    step: 1,
  },
  {
    id: "d2",
    titleEn: "Deposit deduction",
    titleEs: "Deducción de depósito",
    refEn: "18 Maple Street · reported by you",
    refEs: "18 Maple Street · reportado por ti",
    status: "resolved",
    step: 2,
  },
];

function Stepper({
  current,
  labels,
}: {
  current: number;
  labels: [string, string, string];
}) {
  const states: StepState[] = labels.map((_, i) =>
    i < current ? "done" : i === current ? "current" : "todo",
  );
  return (
    <div className="flex items-start">
      {labels.map((label, i) => {
        const state = states[i];
        return (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* left connector */}
              <span
                className={cn(
                  "h-[2px] flex-1 rounded-full",
                  i === 0 ? "opacity-0" : states[i - 1] === "todo" ? "bg-line-strong" : "bg-verify",
                )}
              />
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-[13px] font-bold transition-colors",
                  state === "done" && "border-verify bg-verify text-white",
                  state === "current" && "border-brand bg-brand-tint text-brand",
                  state === "todo" && "border-line-strong bg-surface text-ink-faint",
                )}
              >
                {state === "done" ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : state === "current" ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </span>
              {/* right connector */}
              <span
                className={cn(
                  "h-[2px] flex-1 rounded-full",
                  i === labels.length - 1 ? "opacity-0" : state === "done" ? "bg-verify" : "bg-line-strong",
                )}
              />
            </div>
            <span
              className={cn(
                "mt-1.5 text-center text-[11.5px] font-semibold leading-tight",
                state === "current" ? "text-brand" : state === "done" ? "text-ink-soft" : "text-ink-faint",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AppealsScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const [open, setOpen] = useState<string | null>("d1");

  const stepLabels: [string, string, string] = [
    c.steps.submitted,
    c.steps.review,
    c.steps.resolution,
  ];

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <p className="text-[14px] leading-snug text-ink-soft">{c.subtitle}</p>

          <div className="mt-4 space-y-3">
            {cases.map((cs) => {
              const isOpen = open === cs.id;
              const resolved = cs.status === "resolved";
              return (
                <Card key={cs.id} className="overflow-hidden p-0">
                  <button
                    onClick={() => setOpen(isOpen ? null : cs.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                        resolved ? "bg-verify-tint text-verify" : "bg-amber-tint text-amber",
                      )}
                    >
                      <Scale className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-bold text-ink">
                        {locale === "es" ? cs.titleEs : cs.titleEn}
                      </div>
                      <div className="truncate text-[12.5px] text-ink-faint">
                        {locale === "es" ? cs.refEs : cs.refEn}
                      </div>
                    </div>
                    {resolved ? (
                      <Chip tone="verify" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                        {c.resolved}
                      </Chip>
                    ) : (
                      <Chip tone="pending" icon={<Clock className="h-3.5 w-3.5" />}>
                        {c.inReview}
                      </Chip>
                    )}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-ink-faint transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-line px-4 pb-4 pt-5">
                      <Stepper current={cs.step} labels={stepLabels} />

                      {!resolved && (
                        <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-amber-tint px-3 py-2 text-[12.5px] font-semibold text-amber">
                          <Clock className="h-3.5 w-3.5" />
                          {c.resolveWindow}
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-2.5">
                        <Button variant="secondary" icon={<Upload className="h-[17px] w-[17px]" />}>
                          {c.addEvidence}
                        </Button>
                        <Button
                          variant="secondary"
                          icon={<MessageSquarePlus className="h-[17px] w-[17px]" />}
                        >
                          {c.addStatement}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <p className="mt-5 text-center text-[12.5px] leading-snug text-ink-faint">
            {c.reassure}
          </p>
        </Screen>
      </PageFade>
    </>
  );
}
