"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gavel, Check, Loader2, Info, Scale } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Button, Card, Skeleton } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { scanProtectedClass } from "@/lib/fair-housing";
import {
  fetchPublicProfile,
  issueAdverseAction,
  type PublicProfileData,
  type AdverseDecision,
} from "@/lib/data";

const copy = {
  en: {
    title: "Adverse action notice",
    intro: "If you deny, condition or modify a housing decision based in whole or in part on information from Tenant Trust, U.S. law (FCRA) may require you to give the applicant this notice. Complete it and we'll deliver it in-app.",
    about: "Notice about",
    decision: "Decision taken",
    dDenied: "Application denied",
    dConditional: "Approved with conditions",
    dDeposit: "Higher deposit required",
    dCosigner: "Cosigner/guarantor required",
    dOther: "Other adverse action",
    reasonsL: "Principal reasons",
    rHistory: "Rental/payment history",
    rDisputed: "Disputed or unresolved facts",
    rVerify: "Could not verify information",
    rInsufficient: "Insufficient rental history",
    rOther: "Other",
    noteL: "Additional detail (optional)",
    notePh: "Anything else the applicant should know.",
    preview: "What the applicant will receive",
    send: "Send notice",
    sending: "Sending…",
    disclaimer: "This is a template for transparency, not legal advice. Have it reviewed by an attorney before relying on it.",
    needReason: "Select at least one reason.",
    notFound: "Person not found.",
    fhCertify: "I certify this decision is not based on race, color, national origin, religion, sex, familial status, disability, or any other protected class, and that the same criteria apply to every applicant.",
    fhLearn: "Fair Housing policy",
    fhNoteWarn: "Your note may reference a protected class. Please remove it — adverse actions must be about conduct only.",
    stateRules: "Check your state's screening rules",
    // Notice body
    nHeading: "Notice of Adverse Action",
    nP1: "This notice is provided because an adverse action was taken, in whole or in part, based on information obtained through Tenant Trust.",
    nP2: "Tenant Trust did not make the decision to take this action and is unable to provide the specific reasons for it. The reasons, if any, are indicated by the party that issued this notice.",
    nRights: "Your rights",
    nR1: "You have the right to obtain a free copy of the information about you from Tenant Trust — it is always available inside your account, on your profile and trust report.",
    nR2: "You have the right to dispute the accuracy or completeness of any information. Open a dispute from the Appeals center in the app; we will reinvestigate within 30 days.",
    nR3: "The party that took this action is identified below, along with the reasons they selected.",
  },
  es: {
    title: "Aviso de acción adversa",
    intro: "Si niegas, condicionas o modificas una decisión de vivienda basándote total o parcialmente en información de Tenant Trust, la ley de EE. UU. (FCRA) puede exigirte entregar este aviso al solicitante. Complétalo y lo entregamos dentro de la app.",
    about: "Aviso sobre",
    decision: "Decisión tomada",
    dDenied: "Solicitud denegada",
    dConditional: "Aprobada con condiciones",
    dDeposit: "Se requiere depósito mayor",
    dCosigner: "Se requiere cosignatario/garante",
    dOther: "Otra acción adversa",
    reasonsL: "Razones principales",
    rHistory: "Historial de alquiler/pagos",
    rDisputed: "Hechos en disputa o sin resolver",
    rVerify: "No se pudo verificar la información",
    rInsufficient: "Historial de alquiler insuficiente",
    rOther: "Otra",
    noteL: "Detalle adicional (opcional)",
    notePh: "Algo más que el solicitante deba saber.",
    preview: "Lo que recibirá el solicitante",
    send: "Enviar aviso",
    sending: "Enviando…",
    disclaimer: "Esta es una plantilla para transparencia, no asesoría legal. Haz que un abogado la revise antes de usarla.",
    needReason: "Selecciona al menos una razón.",
    notFound: "Persona no encontrada.",
    fhCertify: "Certifico que esta decisión no se basa en raza, color, origen nacional, religión, sexo, estatus familiar, discapacidad ni ninguna otra clase protegida, y que se aplican los mismos criterios a cada solicitante.",
    fhLearn: "Política de Vivienda Justa",
    fhNoteWarn: "Tu nota podría referir a una clase protegida. Elimínala — las acciones adversas deben ser solo sobre conducta.",
    stateRules: "Revisa las reglas de screening de tu estado",
    nHeading: "Aviso de Acción Adversa",
    nP1: "Este aviso se entrega porque se tomó una acción adversa, total o parcialmente, con base en información obtenida a través de Tenant Trust.",
    nP2: "Tenant Trust no tomó la decisión de esta acción y no puede dar las razones específicas. Las razones, si las hay, las indica la parte que emitió este aviso.",
    nRights: "Tus derechos",
    nR1: "Tienes derecho a obtener una copia gratuita de la información sobre ti en Tenant Trust — siempre está disponible dentro de tu cuenta, en tu perfil y reporte de confianza.",
    nR2: "Tienes derecho a disputar la exactitud o integridad de cualquier información. Abre una disputa desde el Centro de Apelaciones; reinvestigaremos dentro de 30 días.",
    nR3: "La parte que tomó esta acción se identifica abajo, junto con las razones que seleccionó.",
  },
};

const REASONS = [
  { key: "rental_history", label: "rHistory" },
  { key: "disputed_facts", label: "rDisputed" },
  { key: "unverified", label: "rVerify" },
  { key: "insufficient_history", label: "rInsufficient" },
  { key: "other", label: "rOther" },
] as const;

const DECISIONS: { key: AdverseDecision; label: keyof (typeof copy)["en"] }[] = [
  { key: "denied", label: "dDenied" },
  { key: "conditional", label: "dConditional" },
  { key: "deposit_increase", label: "dDeposit" },
  { key: "cosigner_required", label: "dCosigner" },
  { key: "other", label: "dOther" },
];

export default function AdverseActionScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const router = useRouter();
  const { user } = useAuth();

  const [subject, setSubject] = useState<PublicProfileData | null | undefined>(undefined);
  const [decision, setDecision] = useState<AdverseDecision>("denied");
  const [reasons, setReasons] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [certified, setCertified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noteScan = useMemo(() => scanProtectedClass(note), [note]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("subject") ?? "";
    fetchPublicProfile(id).then(setSubject);
  }, []);

  function toggleReason(key: string) {
    setReasons((prev) => (prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]));
  }

  async function handleSend() {
    if (!subject || busy || !certified || noteScan.flagged) return;
    if (reasons.length === 0) {
      setError(c.needReason);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const labels = reasons.map((k) => c[REASONS.find((r) => r.key === k)!.label]);
      await issueAdverseAction(subject.id, decision, labels, note.trim());
      router.push(`/trust?id=${subject.id}`);
    } catch {
      setError(c.notFound);
      setBusy(false);
    }
  }

  if (subject === undefined) {
    return (
      <>
        <AppHeader title={c.title} back />
        <PageFade>
          <Screen>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </Screen>
        </PageFade>
      </>
    );
  }
  if (subject === null) {
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
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber/30 bg-amber-tint p-3.5">
            <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber" />
            <p className="text-[12.5px] leading-snug text-amber">{c.intro}</p>
          </div>

          <p className="mt-3 text-[12.5px] text-ink-faint">
            {c.about} <span className="font-semibold text-ink-soft">{subject.name}</span>
          </p>
          <Link
            href="/legal/state-rules"
            className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand"
          >
            <Scale className="h-3.5 w-3.5" /> {c.stateRules}
          </Link>

          {/* Decision */}
          <div className="mb-2 mt-5 text-[13px] font-bold uppercase tracking-wider text-ink-faint">{c.decision}</div>
          <div className="flex flex-wrap gap-2">
            {DECISIONS.map((d) => (
              <button
                key={d.key}
                onClick={() => setDecision(d.key)}
                className={
                  "rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors " +
                  (decision === d.key ? "border-brand/30 bg-brand-tint text-brand" : "border-line bg-surface text-ink-soft")
                }
              >
                {c[d.label]}
              </button>
            ))}
          </div>

          {/* Reasons */}
          <div className="mb-2 mt-5 text-[13px] font-bold uppercase tracking-wider text-ink-faint">{c.reasonsL}</div>
          <Card className="divide-y divide-line p-0">
            {REASONS.map((r) => {
              const on = reasons.includes(r.key);
              return (
                <button key={r.key} onClick={() => toggleReason(r.key)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                  <span
                    className={
                      "grid h-5 w-5 shrink-0 place-items-center rounded-md border-[1.5px] transition-colors " +
                      (on ? "border-brand bg-brand text-white" : "border-line-strong bg-surface-2 text-transparent")
                    }
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-[14px] text-ink">{c[r.label]}</span>
                </button>
              );
            })}
          </Card>

          {/* Note */}
          <div className="mb-2 mt-5 text-[13px] font-bold uppercase tracking-wider text-ink-faint">{c.noteL}</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={c.notePh}
            rows={2}
            className="w-full resize-none rounded-xl border-[1.5px] border-line-strong bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-tint"
          />

          {/* Preview */}
          <div className="mb-2 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">{c.preview}</div>
          <Card className="space-y-2.5 p-4">
            <div className="text-[15px] font-extrabold text-ink">{c.nHeading}</div>
            <p className="text-[12.5px] leading-relaxed text-ink-soft">{c.nP1}</p>
            <p className="text-[12.5px] leading-relaxed text-ink-soft">{c.nP2}</p>
            <div className="pt-1 text-[13px] font-bold text-ink">{c.nRights}</div>
            <p className="text-[12.5px] leading-relaxed text-ink-soft">{c.nR1}</p>
            <p className="text-[12.5px] leading-relaxed text-ink-soft">{c.nR2}</p>
            <p className="text-[12.5px] leading-relaxed text-ink-soft">{c.nR3}</p>
          </Card>

          {/* Fair Housing note warning */}
          {noteScan.flagged && (
            <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-danger-tint px-3 py-2 text-[12px] font-medium text-danger">
              <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {c.fhNoteWarn}
            </p>
          )}

          {/* Fair Housing certification */}
          <button
            type="button"
            onClick={() => setCertified((v) => !v)}
            className="mt-4 flex w-full items-start gap-2.5 text-left"
            aria-pressed={certified}
          >
            <span
              className={
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-[1.5px] transition-colors " +
                (certified ? "border-brand bg-brand text-white" : "border-line-strong bg-surface-2 text-transparent")
              }
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="text-[12px] leading-snug text-ink-soft">
              {c.fhCertify}{" "}
              <Link href="/legal/fair-housing" className="font-semibold text-brand underline">
                {c.fhLearn}
              </Link>
            </span>
          </button>

          <p className="mt-3 text-[11px] leading-snug text-ink-faint">{c.disclaimer}</p>
          {error && <p className="mt-2 text-[13px] font-medium text-danger">{error}</p>}

          <Button
            full
            size="lg"
            className="mt-4"
            disabled={busy || reasons.length === 0 || !certified || noteScan.flagged}
            onClick={handleSend}
            icon={busy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Gavel className="h-[18px] w-[18px]" />}
          >
            {busy ? c.sending : c.send}
          </Button>
        </Screen>
      </PageFade>
    </>
  );
}
