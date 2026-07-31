"use client";

import { useState } from "react";
import {
  Info,
  Upload,
  FileText,
  Check,
  Clock,
  Wrench,
  ScrollText,
  CircleDot,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Button, Card, Chip, Field, Input } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";

type FactType = "late" | "damage" | "contract" | "other";

const copy = {
  en: {
    title: "Report a fact",
    reassure: "Only facts with evidence. The other party will be notified and can respond.",
    typeLabel: "What happened?",
    types: {
      late: "Late payment",
      damage: "Damage",
      contract: "Contract violation",
      other: "Other",
    },
    descLabel: "Describe the facts",
    descHint: "Stick to what happened — dates, amounts, specifics. No opinions needed.",
    descPlaceholder: "e.g. Rent for September was received on the 6th, five days after the due date.",
    evidenceLabel: "Evidence",
    evidenceRequired: "Required",
    dropTitle: "Upload receipt, photo or document",
    dropHint: "This is what keeps the record fair for everyone.",
    addEvidence: "Add evidence",
    fileName: "receipt_september.pdf",
    fileMeta: "PDF · 240 KB",
    submit: "Review & submit",
    submitHintLocked: "Add evidence to continue",
  },
  es: {
    title: "Reportar un hecho",
    reassure: "Solo hechos con evidencia. La otra parte será notificada y podrá responder.",
    typeLabel: "¿Qué pasó?",
    types: {
      late: "Pago tardío",
      damage: "Daño",
      contract: "Incumplimiento de contrato",
      other: "Otro",
    },
    descLabel: "Describe los hechos",
    descHint: "Cíñete a lo que pasó — fechas, montos, detalles. Sin opiniones.",
    descPlaceholder: "ej. La renta de septiembre se recibió el día 6, cinco días después del vencimiento.",
    evidenceLabel: "Evidencia",
    evidenceRequired: "Obligatorio",
    dropTitle: "Sube un recibo, foto o documento",
    dropHint: "Esto es lo que mantiene el registro justo para todos.",
    addEvidence: "Agregar evidencia",
    fileName: "recibo_septiembre.pdf",
    fileMeta: "PDF · 240 KB",
    submit: "Revisar y enviar",
    submitHintLocked: "Agrega evidencia para continuar",
  },
};

const TYPE_META: { value: FactType; icon: typeof Clock }[] = [
  { value: "late", icon: Clock },
  { value: "damage", icon: Wrench },
  { value: "contract", icon: ScrollText },
  { value: "other", icon: CircleDot },
];

export default function ReportScreen() {
  const c = useT(copy);
  const [factType, setFactType] = useState<FactType>("late");
  const [hasEvidence, setHasEvidence] = useState(false);
  const [description, setDescription] = useState("");

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Reassurance banner */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber/25 bg-amber-tint p-3.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber">
              <Info className="h-[18px] w-[18px]" />
            </span>
            <p className="pt-0.5 text-[13px] font-medium leading-snug text-ink-soft">
              {c.reassure}
            </p>
          </div>

          {/* Fact-type chips */}
          <div className="mt-6">
            <h2 className="mb-2.5 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
              {c.typeLabel}
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {TYPE_META.map(({ value, icon: Icon }) => {
                const active = factType === value;
                return (
                  <button
                    key={value}
                    onClick={() => setFactType(value)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border-[1.5px] px-3.5 py-3 text-left text-[14px] font-semibold transition-all active:scale-[.98]",
                      active
                        ? "border-brand bg-brand-tint text-brand"
                        : "border-line-strong bg-surface-2 text-ink-soft",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="min-w-0 flex-1 leading-tight">{c.types[value]}</span>
                    {active && <Check className="h-4 w-4 shrink-0" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <Field label={c.descLabel} hint={c.descHint}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder={c.descPlaceholder}
                className="w-full resize-none rounded-xl border-[1.5px] border-line-strong bg-surface-2 px-3.5 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-tint"
              />
            </Field>
          </div>

          {/* Evidence (required) */}
          <div className="mt-6">
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-faint">
                {c.evidenceLabel}
              </h2>
              <Chip tone="pending">{c.evidenceRequired}</Chip>
            </div>

            {hasEvidence ? (
              <Card className="p-2">
                <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-[13px] font-medium text-ink">
                      {c.fileName}
                    </div>
                    <div className="text-[12px] text-ink-faint">{c.fileMeta}</div>
                  </div>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-verify text-white">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                </div>
              </Card>
            ) : (
              <button
                onClick={() => setHasEvidence(true)}
                className="w-full rounded-2xl border-[1.5px] border-dashed border-line-strong bg-surface-2 px-5 py-8 text-center transition-colors hover:border-brand hover:bg-brand-tint/40"
              >
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-tint text-brand">
                  <Upload className="h-6 w-6" />
                </span>
                <div className="mt-3 text-[15px] font-semibold text-ink">{c.dropTitle}</div>
                <div className="mt-1 text-[13px] text-ink-faint">{c.dropHint}</div>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-surface-3 px-3.5 py-2 text-[13px] font-semibold text-ink">
                  <Upload className="h-4 w-4" />
                  {c.addEvidence}
                </span>
              </button>
            )}
          </div>

          {/* Submit */}
          <div className="mt-7">
            <Button full size="lg" disabled={!hasEvidence}>
              {c.submit}
            </Button>
            {!hasEvidence && (
              <p className="mt-2 text-center text-[12.5px] text-ink-faint">{c.submitHintLocked}</p>
            )}
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
