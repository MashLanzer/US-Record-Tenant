"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Upload, Check, Loader2, ShieldAlert, Paperclip } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Button, Chip, Skeleton } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import {
  fetchRentalById,
  submitReport,
  uploadDocument,
  REPORT_TYPES,
  type Rental,
  type ReportType,
} from "@/lib/data";

const copy = {
  en: {
    title: "Report a fact",
    banner: "Only facts, with evidence when possible. The other party is notified and can respond.",
    about: "About your counterparty on",
    type: "What happened?",
    describe: "Describe the facts",
    describePh: "e.g. Rent for September arrived on the 6th, five days late.",
    noOpinions: "Stick to what happened — dates, amounts, specifics. No opinions.",
    evidence: "Evidence",
    optional: "optional",
    addEvidence: "Attach a receipt, photo or document",
    attached: "Evidence attached",
    submit: "Submit fact",
    submitting: "Submitting…",
    needCounterparty: "This rental has no confirmed counterparty yet. Invite and link the other party first, then you can record facts.",
    err: "Could not submit. Please try again.",
    notFound: "Rental not found.",
  },
  es: {
    title: "Reportar un hecho",
    banner: "Solo hechos, con evidencia cuando sea posible. La otra parte es notificada y puede responder.",
    about: "Sobre tu contraparte en",
    type: "¿Qué pasó?",
    describe: "Describe los hechos",
    describePh: "ej. La renta de septiembre llegó el día 6, cinco días tarde.",
    noOpinions: "Cíñete a lo que pasó — fechas, montos, detalles. Sin opiniones.",
    evidence: "Evidencia",
    optional: "opcional",
    addEvidence: "Adjunta un recibo, foto o documento",
    attached: "Evidencia adjunta",
    submit: "Enviar hecho",
    submitting: "Enviando…",
    needCounterparty: "Este alquiler aún no tiene contraparte confirmada. Invita y vincula a la otra parte primero, luego podrás registrar hechos.",
    err: "No se pudo enviar. Inténtalo de nuevo.",
    notFound: "Alquiler no encontrado.",
  },
};

export default function ReportScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const router = useRouter();
  const { user } = useAuth();

  const [rental, setRental] = useState<Rental | null | undefined>(undefined);
  const [type, setType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const leaseId = new URLSearchParams(window.location.search).get("lease") ?? "";
    let alive = true;
    fetchRentalById(user.id, leaseId).then((r) => alive && setRental(r));
    return () => {
      alive = false;
    };
  }, [user]);

  const hasCounterparty = !!rental && (rental.relation === "tenant" || !!rental.tenantId);
  const canSubmit = !!type && description.trim().length > 0 && hasCounterparty && !submitting;

  async function handleSubmit() {
    if (!canSubmit || !rental || !user || !type) return;
    setSubmitting(true);
    setError(null);
    try {
      let evidencePath: string | null = null;
      if (file) evidencePath = await uploadDocument(user.id, file, "evidence", rental.id);
      await submitReport(rental.id, type, description.trim(), evidencePath);
      router.push(`/property?id=${rental.id}`);
    } catch {
      setError(c.err);
      setSubmitting(false);
    }
  }

  if (rental === undefined) {
    return (
      <>
        <AppHeader title={c.title} back />
        <PageFade>
          <Screen>
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="mt-3 h-40 w-full rounded-2xl" />
          </Screen>
        </PageFade>
      </>
    );
  }

  if (rental === null) {
    return (
      <>
        <AppHeader title={c.title} back />
        <PageFade>
          <Screen>
            <p className="mt-10 text-center text-[15px] text-ink-faint">{c.notFound}</p>
          </Screen>
        </PageFade>
      </>
    );
  }

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Fairness banner */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber/30 bg-amber-tint p-3.5">
            <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber" />
            <p className="text-[12.5px] leading-snug text-amber">{c.banner}</p>
          </div>

          {/* Context */}
          <p className="mt-3 text-[12.5px] text-ink-faint">
            {c.about} <span className="font-semibold text-ink-soft">{rental.address}</span>
          </p>

          {!hasCounterparty ? (
            <Card className="mt-4 flex items-start gap-2.5 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
              <p className="text-[13px] leading-snug text-ink-soft">{c.needCounterparty}</p>
            </Card>
          ) : (
            <>
              {/* Type */}
              <div className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
                {c.type}
              </div>
              <div className="flex flex-wrap gap-2">
                {REPORT_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className={
                      "rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors " +
                      (type === t.key
                        ? "border-brand/30 bg-brand-tint text-brand"
                        : "border-line bg-surface text-ink-soft hover:bg-surface-3")
                    }
                  >
                    {locale === "es" ? t.es : t.en}
                  </button>
                ))}
              </div>

              {/* Description */}
              <div className="mb-2 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
                {c.describe}
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={c.describePh}
                rows={4}
                className="w-full resize-none rounded-xl border-[1.5px] border-line-strong bg-surface-2 px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-tint"
              />
              <p className="mt-1.5 text-[12px] text-ink-faint">{c.noOpinions}</p>

              {/* Evidence */}
              <div className="mb-2.5 mt-6 flex items-baseline justify-between">
                <span className="text-[13px] font-bold uppercase tracking-wider text-ink-faint">{c.evidence}</span>
                <span className="text-[12px] text-ink-faint">{c.optional}</span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex items-center gap-2.5 rounded-xl bg-verify-tint px-3.5 py-3 text-[13px] font-semibold text-verify">
                  <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <button className="text-verify/70 underline" onClick={() => setFile(null)}>
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-2 px-4 py-4 text-[13px] font-semibold text-ink-soft"
                >
                  <Paperclip className="h-4 w-4" />
                  {c.addEvidence}
                </button>
              )}

              {error && <p className="mt-3 text-[13px] font-medium text-danger">{error}</p>}

              <Button
                full
                size="lg"
                className="mt-6"
                disabled={!canSubmit}
                onClick={handleSubmit}
                icon={submitting ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Upload className="h-[18px] w-[18px]" />}
              >
                {submitting ? c.submitting : c.submit}
              </Button>
            </>
          )}
        </Screen>
      </PageFade>
    </>
  );
}
