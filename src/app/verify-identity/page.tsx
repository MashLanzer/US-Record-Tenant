"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, IdCard, ScanFace, FileText, Lock, ChevronRight } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Card, Button, Chip } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { updateIdentityVerified } from "@/lib/data";

const copy = {
  en: {
    title: "Verify your identity",
    subtitle: "A verified badge boosts your trust score and unlocks more of the app.",
    note: "Prototype: real government-ID and selfie checks arrive with our verification partner. For now you can activate your badge, or skip and verify later.",
    whatWeVerify: "What we'll verify",
    idTitle: "Government ID",
    idSub: "Passport, license or ID card",
    selfieTitle: "Liveness selfie",
    selfieSub: "A quick selfie to confirm it's you",
    addressTitle: "Proof of address / ownership",
    addressSub: "For landlords: property ownership",
    soon: "With partner",
    verify: "Activate verified badge",
    verifying: "Activating…",
    skip: "Skip for now",
    encrypted: "Encrypted end-to-end",
  },
  es: {
    title: "Verifica tu identidad",
    subtitle: "Un badge verificado sube tu índice de confianza y desbloquea más funciones.",
    note: "Prototipo: la verificación real de identidad y selfie llega con nuestro proveedor. Por ahora puedes activar tu badge, u omitir y verificar después.",
    whatWeVerify: "Qué verificaremos",
    idTitle: "Identidad oficial",
    idSub: "Pasaporte, licencia o cédula",
    selfieTitle: "Selfie con prueba de vida",
    selfieSub: "Una selfie rápida para confirmar que eres tú",
    addressTitle: "Comprobante de domicilio / propiedad",
    addressSub: "Para propietarios: titularidad del inmueble",
    soon: "Con proveedor",
    verify: "Activar badge verificado",
    verifying: "Activando…",
    skip: "Omitir por ahora",
    encrypted: "Cifrado de extremo a extremo",
  },
};

export default function VerifyIdentityScreen() {
  const c = useT(copy);
  const router = useRouter();
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(false);

  async function handleVerify() {
    if (verifying) return;
    setVerifying(true);
    try {
      if (user) await updateIdentityVerified(user.id);
      router.push("/consent");
    } catch {
      setVerifying(false);
    }
  }

  const items = [
    { icon: <IdCard className="h-5 w-5" />, title: c.idTitle, sub: c.idSub },
    { icon: <ScanFace className="h-5 w-5" />, title: c.selfieTitle, sub: c.selfieSub },
    { icon: <FileText className="h-5 w-5" />, title: c.addressTitle, sub: c.addressSub },
  ];

  return (
    <AuthShell showLogo>
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{c.title}</h1>
        <p className="mt-1.5 text-[14px] text-ink-soft">{c.subtitle}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-amber/30 bg-amber-tint px-4 py-3 text-[12.5px] leading-relaxed text-amber">
        {c.note}
      </div>

      <div className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
        {c.whatWeVerify}
      </div>
      <Stagger className="flex flex-col gap-2.5">
        {items.map((it) => (
          <StaggerItem key={it.title}>
            <Card className="flex items-center gap-3.5 p-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                {it.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-ink">{it.title}</div>
                <div className="text-[13px] text-ink-faint">{it.sub}</div>
              </div>
              <Chip tone="neutral">{c.soon}</Chip>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-auto pt-8">
        <div className="mb-3 flex items-center justify-center gap-1.5 text-[12px] font-medium text-ink-faint">
          <Lock className="h-3.5 w-3.5 text-verify" />
          {c.encrypted}
        </div>
        <Button
          full
          size="lg"
          onClick={handleVerify}
          disabled={verifying}
          icon={<ShieldCheck className="h-[18px] w-[18px]" />}
        >
          {verifying ? c.verifying : c.verify}
        </Button>
        <Button
          full
          size="lg"
          variant="ghost"
          href="/consent"
          className="mt-3 border-transparent"
          iconRight={<ChevronRight className="h-[18px] w-[18px]" />}
        >
          {c.skip}
        </Button>
      </div>
    </AuthShell>
  );
}
