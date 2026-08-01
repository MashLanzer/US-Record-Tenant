"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Clock,
  Scale,
  ChevronDown,
  Paperclip,
  Check,
  Loader2,
  Send,
  Flag,
  MessageSquareText,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Button, Card, Chip, Skeleton } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { cn } from "@/lib/cn";
import { useT, useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import {
  fetchDisputeCases,
  disputeReport,
  addDisputeEntry,
  resolveReport,
  flagContent,
  uploadDocument,
  reportTypeLabel,
  type DisputeCase,
  type FlagReason,
} from "@/lib/data";

const copy = {
  en: {
    title: "Appeals center",
    subtitle: "A fair path to respond to any fact on your record. State your side with evidence — both parties are heard.",
    empty: "No facts to respond to yet. When someone records a fact about you, it shows up here so you can add your side.",
    reportedByThem: "About you",
    reportedByYou: "By you",
    open: "On record",
    disputed: "Disputed",
    resolved: "Resolved",
    disputeThis: "Dispute this fact",
    yourSide: "Your side of the story",
    statementPh: "Explain what actually happened — dates, amounts, context.",
    attach: "Attach evidence",
    attached: "Evidence attached",
    optional: "optional",
    submit: "Submit dispute",
    submitting: "Submitting…",
    addStatement: "Add a statement",
    addPh: "Add more context or respond to the other party…",
    send: "Add to dispute",
    sending: "Adding…",
    thread: "Dispute thread",
    you: "You",
    them: "Other party",
    hasEvidence: "Evidence attached",
    reassure: "Facts stay on record, but a dispute marks them as contested and shows both sides. Nothing is a verdict — it's a transparent account.",
    err: "Could not submit. Please try again.",
    markResolved: "Mark as resolved",
    resolving: "Resolving…",
    resolveNote: "You recorded this fact. Resolving closes the dispute as settled.",
    flagBtn: "Report a problem",
    flagTitle: "Report this fact for review",
    rAbuse: "Abusive",
    rFalse: "False / inaccurate",
    rHarass: "Harassment",
    rOther: "Other",
    flagNotePh: "Add context for the review team (optional).",
    flagSend: "Submit report",
    flagSending: "Submitting…",
    flagged: "Reported. Our team will review it.",
    cancel: "Cancel",
  },
  es: {
    title: "Centro de apelaciones",
    subtitle: "Un camino justo para responder a cualquier hecho en tu historial. Da tu versión con evidencia — ambas partes son escuchadas.",
    empty: "Aún no hay hechos que responder. Cuando alguien registre un hecho sobre ti, aparecerá aquí para que agregues tu versión.",
    reportedByThem: "Sobre ti",
    reportedByYou: "Por ti",
    open: "En historial",
    disputed: "En disputa",
    resolved: "Resuelto",
    disputeThis: "Disputar este hecho",
    yourSide: "Tu versión de los hechos",
    statementPh: "Explica qué pasó realmente — fechas, montos, contexto.",
    attach: "Adjuntar evidencia",
    attached: "Evidencia adjunta",
    optional: "opcional",
    submit: "Enviar disputa",
    submitting: "Enviando…",
    addStatement: "Agregar una declaración",
    addPh: "Agrega más contexto o responde a la otra parte…",
    send: "Agregar a la disputa",
    sending: "Agregando…",
    thread: "Hilo de la disputa",
    you: "Tú",
    them: "La otra parte",
    hasEvidence: "Evidencia adjunta",
    reassure: "Los hechos permanecen en el historial, pero una disputa los marca como controvertidos y muestra ambas versiones. Nada es un veredicto — es un relato transparente.",
    err: "No se pudo enviar. Inténtalo de nuevo.",
    markResolved: "Marcar como resuelto",
    resolving: "Resolviendo…",
    resolveNote: "Tú registraste este hecho. Resolver cierra la disputa como saldada.",
    flagBtn: "Reportar un problema",
    flagTitle: "Reportar este hecho para revisión",
    rAbuse: "Abusivo",
    rFalse: "Falso / inexacto",
    rHarass: "Acoso",
    rOther: "Otro",
    flagNotePh: "Añade contexto para el equipo de revisión (opcional).",
    flagSend: "Enviar reporte",
    flagSending: "Enviando…",
    flagged: "Reportado. Nuestro equipo lo revisará.",
    cancel: "Cancelar",
  },
};

export default function AppealsScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const { user } = useAuth();

  const [cases, setCases] = useState<DisputeCase[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = () => {
    if (user) fetchDisputeCases(user.id).then(setCases);
  };
  useEffect(load, [user]);

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <p className="text-[14px] leading-snug text-ink-soft">{c.subtitle}</p>

          {cases === null ? (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : cases.length === 0 ? (
            <Card className="mt-4 flex flex-col items-center gap-3 p-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-tint text-brand">
                <Scale className="h-6 w-6" />
              </span>
              <p className="text-[13.5px] leading-snug text-ink-soft">{c.empty}</p>
            </Card>
          ) : (
            <div className="mt-4 space-y-3">
              {cases.map((cs) => (
                <DisputeCard
                  key={cs.reportId}
                  cs={cs}
                  c={c}
                  locale={locale}
                  userId={user?.id ?? ""}
                  isOpen={open === cs.reportId}
                  onToggle={() => setOpen(open === cs.reportId ? null : cs.reportId)}
                  onChanged={load}
                />
              ))}
            </div>
          )}

          <p className="mt-5 text-center text-[12.5px] leading-snug text-ink-faint">{c.reassure}</p>
        </Screen>
      </PageFade>
    </>
  );
}

function DisputeCard({
  cs,
  c,
  locale,
  userId,
  isOpen,
  onToggle,
  onChanged,
}: {
  cs: DisputeCase;
  c: (typeof copy)["en"];
  locale: "en" | "es";
  userId: string;
  isOpen: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const [statement, setStatement] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [resolving, setResolving] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [flagReason, setFlagReason] = useState<FlagReason>("false");
  const [flagNote, setFlagNote] = useState("");
  const [flagBusy, setFlagBusy] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const isSubject = cs.direction === "about_me";
  const isDisputed = cs.status === "disputed";
  const isResolved = cs.status === "resolved";
  // The subject can open a dispute; both parties can add to an ongoing one.
  const canDispute = isSubject && cs.status === "open";
  const canAdd = isDisputed;
  // The author can formally resolve a disputed fact they recorded.
  const canResolve = cs.direction === "by_me" && isDisputed;

  async function handleResolve() {
    if (resolving) return;
    setResolving(true);
    try {
      await resolveReport(cs.reportId);
      onChanged();
    } catch {
      setError(c.err);
    } finally {
      setResolving(false);
    }
  }

  async function handleFlag() {
    if (flagBusy) return;
    setFlagBusy(true);
    try {
      await flagContent(cs.reportId, flagReason, flagNote.trim());
      setFlagged(true);
      setShowFlag(false);
    } catch {
      setError(c.err);
    } finally {
      setFlagBusy(false);
    }
  }

  async function handleSubmit(kind: "open" | "add") {
    if (busy || (!statement.trim() && !file)) return;
    setBusy(true);
    setError(null);
    try {
      let evidencePath: string | null = null;
      if (file && userId) evidencePath = await uploadDocument(userId, file, "evidence", cs.leaseId);
      if (kind === "open") await disputeReport(cs.reportId, statement.trim(), evidencePath);
      else await addDisputeEntry(cs.reportId, statement.trim(), evidencePath);
      setStatement("");
      setFile(null);
      onChanged();
    } catch {
      setError(c.err);
    } finally {
      setBusy(false);
    }
  }

  const statusChip = isResolved ? (
    <Chip tone="verify" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
      {c.resolved}
    </Chip>
  ) : isDisputed ? (
    <Chip tone="dispute" icon={<Scale className="h-3.5 w-3.5" />}>
      {c.disputed}
    </Chip>
  ) : (
    <Chip tone="neutral" icon={<Clock className="h-3.5 w-3.5" />}>
      {c.open}
    </Chip>
  );

  return (
    <Card className="overflow-hidden p-0">
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-4 text-left">
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
            isResolved ? "bg-verify-tint text-verify" : isDisputed ? "bg-danger-tint text-danger" : "bg-brand-tint text-brand",
          )}
        >
          <Flag className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold text-ink">{reportTypeLabel(cs.type, locale)}</div>
          <div className="truncate text-[12.5px] text-ink-faint">
            {cs.address} · {isSubject ? c.reportedByThem : c.reportedByYou}
          </div>
        </div>
        {statusChip}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-faint transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="border-t border-line px-4 pb-4 pt-4">
          {cs.description && (
            <p className="rounded-xl bg-surface-2 px-3.5 py-3 text-[13px] leading-snug text-ink-soft">
              {cs.description}
            </p>
          )}

          {/* Dispute thread */}
          {cs.entries.length > 0 && (
            <>
              <div className="mb-2 mt-4 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
                <MessageSquareText className="h-3.5 w-3.5" /> {c.thread}
              </div>
              <div className="space-y-2">
                {cs.entries.map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      "rounded-xl px-3.5 py-2.5",
                      e.mine ? "bg-brand-tint" : "bg-surface-2",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("text-[12px] font-bold", e.mine ? "text-brand" : "text-ink-soft")}>
                        {e.mine ? c.you : c.them}
                      </span>
                      <span className="text-[11px] text-ink-faint">{e.timeLabel}</span>
                    </div>
                    {e.statement && <p className="mt-1 text-[13px] leading-snug text-ink">{e.statement}</p>}
                    {e.evidencePath && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-verify">
                        <Paperclip className="h-3.5 w-3.5" /> {c.hasEvidence}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Compose: open a dispute (subject, still open) or add to it (disputed) */}
          {(canDispute || canAdd) && (
            <div className="mt-4">
              <div className="mb-1.5 text-[13px] font-semibold text-ink-soft">
                {canDispute ? c.yourSide : c.addStatement}
              </div>
              <textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder={canDispute ? c.statementPh : c.addPh}
                rows={3}
                className="w-full resize-none rounded-xl border-[1.5px] border-line-strong bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-tint"
              />

              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-verify-tint px-3.5 py-2.5 text-[13px] font-semibold text-verify">
                  <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <button className="text-verify/70 underline" onClick={() => setFile(null)}>
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-2 px-4 py-2.5 text-[12.5px] font-semibold text-ink-soft"
                >
                  <Paperclip className="h-4 w-4" />
                  {c.attach} · {c.optional}
                </button>
              )}

              {error && <p className="mt-2 text-[13px] font-medium text-danger">{error}</p>}

              <Button
                full
                className="mt-3"
                disabled={busy || (!statement.trim() && !file)}
                onClick={() => handleSubmit(canDispute ? "open" : "add")}
                icon={
                  busy ? (
                    <Loader2 className="h-[18px] w-[18px] animate-spin" />
                  ) : canDispute ? (
                    <Scale className="h-[18px] w-[18px]" />
                  ) : (
                    <Send className="h-[18px] w-[18px]" />
                  )
                }
              >
                {busy
                  ? canDispute
                    ? c.submitting
                    : c.sending
                  : canDispute
                    ? c.submit
                    : c.send}
              </Button>
            </div>
          )}

          {/* Author resolves a disputed fact */}
          {canResolve && (
            <div className="mt-4 border-t border-line pt-4">
              <p className="mb-2 text-[12px] leading-snug text-ink-faint">{c.resolveNote}</p>
              <Button
                full
                variant="secondary"
                disabled={resolving}
                onClick={handleResolve}
                icon={resolving ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <CheckCircle2 className="h-[18px] w-[18px]" />}
              >
                {resolving ? c.resolving : c.markResolved}
              </Button>
            </div>
          )}

          {/* Moderation: report the fact for review */}
          <div className="mt-4 border-t border-line pt-3">
            {flagged ? (
              <p className="flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-verify">
                <Check className="h-4 w-4" strokeWidth={3} /> {c.flagged}
              </p>
            ) : showFlag ? (
              <div>
                <div className="mb-2 text-[13px] font-bold text-ink">{c.flagTitle}</div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["abuse", c.rAbuse],
                      ["false", c.rFalse],
                      ["harassment", c.rHarass],
                      ["other", c.rOther],
                    ] as [FlagReason, string][]
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFlagReason(key)}
                      className={
                        "rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors " +
                        (flagReason === key
                          ? "border-danger/30 bg-danger-tint text-danger"
                          : "border-line bg-surface text-ink-soft")
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={flagNote}
                  onChange={(e) => setFlagNote(e.target.value)}
                  placeholder={c.flagNotePh}
                  rows={2}
                  className="mt-2.5 w-full resize-none rounded-xl border-[1.5px] border-line-strong bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-tint"
                />
                <div className="mt-2 flex gap-2">
                  <Button variant="secondary" full onClick={() => setShowFlag(false)} disabled={flagBusy}>
                    {c.cancel}
                  </Button>
                  <Button
                    full
                    className="bg-danger text-white hover:bg-danger"
                    disabled={flagBusy}
                    onClick={handleFlag}
                    icon={flagBusy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <AlertOctagon className="h-[18px] w-[18px]" />}
                  >
                    {flagBusy ? c.flagSending : c.flagSend}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowFlag(true)}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-faint hover:text-danger"
              >
                <AlertOctagon className="h-4 w-4" /> {c.flagBtn}
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
