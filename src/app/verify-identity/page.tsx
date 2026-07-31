"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Camera, FileText, ChevronRight, Lock, CircleHelp } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Card, Button } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { useAuth } from "@/lib/auth";
import { updateIdentityVerified } from "@/lib/data";

const copy = {
  en: {
    title: "Verify your identity",
    subtitle: "3 steps · ~2 min · encrypted",
    idTitle: "Government ID",
    idSub: "Matched and confirmed",
    selfieTitle: "Liveness selfie",
    selfieSub: "Checking it's really you…",
    addressTitle: "Proof of address / ownership",
    addressSub: "Up next",
    done: "Done",
    inProgress: "In progress",
    pending: "Pending",
    why: "Why we ask this?",
    encrypted: "Your documents are encrypted end-to-end",
    prototype: "Prototype verification — full ID checks arrive with our verification partner.",
    verifying: "Verifying…",
  },
  es: {
    title: "Verifica tu identidad",
    subtitle: "3 pasos · ~2 min · cifrado",
    idTitle: "Identidad oficial",
    idSub: "Coincide y confirmada",
    selfieTitle: "Selfie con prueba de vida",
    selfieSub: "Verificando que eres tú…",
    addressTitle: "Comprobante de domicilio / propiedad",
    addressSub: "A continuación",
    done: "Listo",
    inProgress: "En progreso",
    pending: "Pendiente",
    why: "¿Por qué lo pedimos?",
    encrypted: "Tus documentos están cifrados de extremo a extremo",
    prototype: "Verificación de prototipo — la verificación real de identidad llega con nuestro proveedor.",
    verifying: "Verificando…",
  },
};

export default function VerifyIdentityScreen() {
  const c = useT(copy);
  const g = useT(common);
  const router = useRouter();
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(false);

  async function handleContinue() {
    if (verifying) return;
    setVerifying(true);
    try {
      if (user) await updateIdentityVerified(user.id);
      router.push("/consent");
    } catch {
      setVerifying(false);
    }
  }

  return (
    <AuthShell showLogo>
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{c.title}</h1>
        <p className="mt-1.5 text-[14px] text-ink-faint">{c.subtitle}</p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-faint">{c.prototype}</p>
      </div>

      <Stagger className="mt-6 flex flex-col gap-3">
        {/* Step A — Government ID (done) */}
        <StaggerItem>
          <Card className="border-verify/40 bg-verify-tint/40 p-4">
            <div className="flex items-center gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-verify text-white shadow-[var(--shadow-1)]">
                <Check className="h-5 w-5" strokeWidth={3} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-ink">{c.idTitle}</div>
                <div className="text-[13px] text-verify">{c.idSub}</div>
              </div>
              <span className="rounded-full bg-verify px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                {c.done}
              </span>
            </div>
          </Card>
        </StaggerItem>

        {/* Step B — Liveness selfie (in progress) */}
        <StaggerItem>
          <Card className="border-brand/50 p-4 shadow-[var(--shadow-2)] ring-1 ring-brand/20">
            <div className="flex items-center gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                <Camera className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-ink">{c.selfieTitle}</div>
                <div className="text-[13px] text-ink-faint">{c.selfieSub}</div>
              </div>
              <span className="rounded-full bg-brand-tint px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
                {c.inProgress}
              </span>
            </div>
            <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-[60%] rounded-full bg-brand transition-all" />
            </div>
          </Card>
        </StaggerItem>

        {/* Step C — Proof of address (pending) */}
        <StaggerItem>
          <Card className="p-4 opacity-60">
            <div className="flex items-center gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-3 text-ink-faint">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-ink-soft">{c.addressTitle}</div>
                <div className="text-[13px] text-ink-ghost">{c.addressSub}</div>
              </div>
              <span className="rounded-full bg-surface-3 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
                {c.pending}
              </span>
            </div>
          </Card>
        </StaggerItem>
      </Stagger>

      <button className="mt-5 inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-brand hover:underline">
        <CircleHelp className="h-4 w-4" />
        {c.why}
      </button>

      <div className="mt-auto pt-8">
        <div className="mb-3 flex items-center justify-center gap-1.5 text-[12px] font-medium text-ink-faint">
          <Lock className="h-3.5 w-3.5 text-verify" />
          {c.encrypted}
        </div>
        <Button
          full
          size="lg"
          onClick={handleContinue}
          disabled={verifying}
          iconRight={<ChevronRight className="h-[18px] w-[18px]" />}
        >
          {verifying ? c.verifying : g.actions.continue}
        </Button>
      </div>
    </AuthShell>
  );
}
