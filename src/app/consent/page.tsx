"use client";

import { useState } from "react";
import { ShieldCheck, Check, ShieldOff, Bell, BarChart3, Share2, ChevronRight } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Card, Button, Toggle } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";

const copy = {
  en: {
    title: "Consent & privacy",
    subtitle: "You control what's shared. Facts, never opinions.",
    promise: "Your record is built from verified facts and evidence — nothing more.",
    storeTitle: "What we store",
    neverTitle: "What we NEVER store",
    store: [
      "Verified lease dates & rent amounts",
      "Bank-confirmed payment history",
      "Signed confirmations from both parties",
      "Evidence you choose to attach",
    ],
    never: [
      "Race, religion, or any protected class",
      "Retaliatory or unverified accusations",
      "Sealed, expunged, or dismissed records",
      "Anything without evidence from both sides",
    ],
    permsTitle: "Permissions",
    pushT: "Push notifications",
    pushS: "Verifications, disputes, and messages",
    analyticsT: "Anonymous analytics",
    analyticsS: "Helps us improve — never sold",
    shareT: "Share verified profile",
    shareS: "Let landlords request your trust profile",
    protected: "Protected classes stay protected — always.",
    accept: "Accept & continue",
    customize: "Customize",
  },
  es: {
    title: "Consentimiento y privacidad",
    subtitle: "Tú controlas lo que se comparte. Hechos, nunca opiniones.",
    promise: "Tu historial se construye con hechos verificados y evidencia — nada más.",
    storeTitle: "Lo que guardamos",
    neverTitle: "Lo que NUNCA guardamos",
    store: [
      "Fechas de contrato y montos de renta verificados",
      "Historial de pagos confirmado por el banco",
      "Confirmaciones firmadas por ambas partes",
      "Evidencia que decidas adjuntar",
    ],
    never: [
      "Raza, religión o cualquier clase protegida",
      "Acusaciones sin verificar o de represalia",
      "Registros sellados, eliminados o desestimados",
      "Cualquier cosa sin evidencia de ambas partes",
    ],
    permsTitle: "Permisos",
    pushT: "Notificaciones push",
    pushS: "Verificaciones, disputas y mensajes",
    analyticsT: "Analítica anónima",
    analyticsS: "Nos ayuda a mejorar — nunca se vende",
    shareT: "Compartir perfil verificado",
    shareS: "Permite que propietarios pidan tu perfil de confianza",
    protected: "Las clases protegidas quedan protegidas — siempre.",
    accept: "Aceptar y continuar",
    customize: "Personalizar",
  },
};

export default function ConsentScreen() {
  const c = useT(copy);
  const [push, setPush] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [share, setShare] = useState(true);

  const perms = [
    { icon: <Bell className="h-5 w-5" />, title: c.pushT, sub: c.pushS, checked: push, set: setPush },
    { icon: <BarChart3 className="h-5 w-5" />, title: c.analyticsT, sub: c.analyticsS, checked: analytics, set: setAnalytics },
    { icon: <Share2 className="h-5 w-5" />, title: c.shareT, sub: c.shareS, checked: share, set: setShare },
  ];

  return (
    <AuthShell showLogo>
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{c.title}</h1>
        <p className="mt-1.5 text-[14px] text-ink-faint">{c.subtitle}</p>
      </div>

      {/* Privacy promise header */}
      <Card className="mt-5 border-verify/40 bg-verify-tint/40 p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-verify text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <p className="text-[13.5px] font-medium leading-relaxed text-ink">{c.promise}</p>
        </div>
      </Card>

      {/* What we store */}
      <Card className="mt-4 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-verify-tint text-verify">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
          <h2 className="text-[15px] font-bold text-ink">{c.storeTitle}</h2>
        </div>
        <ul className="flex flex-col gap-2.5">
          {c.store.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-verify" strokeWidth={3} />
              <span className="text-[13.5px] leading-snug text-ink-soft">{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* What we NEVER store */}
      <Card className="mt-4 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-danger-tint text-danger">
            <ShieldOff className="h-4 w-4" />
          </span>
          <h2 className="text-[15px] font-bold text-ink">{c.neverTitle}</h2>
        </div>
        <ul className="flex flex-col gap-2.5">
          {c.never.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <ShieldOff className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              <span className="text-[13.5px] leading-snug text-ink-soft">{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 rounded-xl bg-verify-tint/40 px-3 py-2 text-[12.5px] font-semibold text-verify">
          {c.protected}
        </div>
      </Card>

      {/* Permissions */}
      <h2 className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
        {c.permsTitle}
      </h2>
      <Card className="p-1.5">
        <Stagger>
          {perms.map((p, i) => (
            <StaggerItem key={p.title}>
              <div className={`flex items-center gap-3 px-2.5 py-3 ${i > 0 ? "border-t border-line" : ""}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-3 text-ink-soft">
                  {p.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14.5px] font-semibold text-ink">{p.title}</div>
                  <div className="text-[12.5px] text-ink-faint">{p.sub}</div>
                </div>
                <Toggle checked={p.checked} onChange={p.set} />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Card>

      <div className="mt-auto flex flex-col gap-2.5 pt-8">
        <Button href="/home" full size="lg" iconRight={<ChevronRight className="h-[18px] w-[18px]" />}>
          {c.accept}
        </Button>
        <Button href="/home" full variant="ghost">
          {c.customize}
        </Button>
      </div>
    </AuthShell>
  );
}
