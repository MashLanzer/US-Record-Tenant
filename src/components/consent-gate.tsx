"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Check, Loader2, FileText, Lock, Scale } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { LEGAL_VERSIONS, REQUIRED_CONSENTS, LEGAL_EFFECTIVE, type LegalDocKey } from "@/lib/legal";
import { pendingConsents, recordConsents } from "@/lib/data";

const copy = {
  en: {
    title: "Before you continue",
    body: "We've updated the agreements that govern Tenant Trust. Please review and accept to keep using the app.",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    fcra: "FCRA Notice",
    review: "Review",
    agree: "I have read and agree to the documents above, and I confirm the information I provide is truthful.",
    accept: "Accept & continue",
    saving: "Saving…",
    effective: "Effective",
  },
  es: {
    title: "Antes de continuar",
    body: "Actualizamos los acuerdos que rigen Tenant Trust. Por favor revísalos y acéptalos para seguir usando la app.",
    terms: "Términos del servicio",
    privacy: "Política de privacidad",
    fcra: "Aviso FCRA",
    review: "Ver",
    agree: "He leído y acepto los documentos anteriores, y confirmo que la información que proporciono es veraz.",
    accept: "Aceptar y continuar",
    saving: "Guardando…",
    effective: "Vigente desde",
  },
};

const DOC_META: Record<LegalDocKey, { href: string; icon: typeof FileText; key: keyof (typeof copy)["en"] }> = {
  terms: { href: "/legal/terms", icon: FileText, key: "terms" },
  privacy: { href: "/legal/privacy", icon: Lock, key: "privacy" },
  fcra: { href: "/legal/fcra", icon: Scale, key: "fcra" },
};

export function ConsentGate({ children }: { children: ReactNode }) {
  const c = useT(copy);
  const { user, demoMode } = useAuth();

  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState<{ document: string; version: string }[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!user || demoMode) {
      setChecking(false);
      setPending([]);
      return;
    }
    const required = REQUIRED_CONSENTS.map((d) => ({ document: d, version: LEGAL_VERSIONS[d] }));
    pendingConsents(user.id, required).then((p) => {
      if (!alive) return;
      setPending(p);
      setChecking(false);
    });
    return () => {
      alive = false;
    };
  }, [user, demoMode]);

  async function handleAccept() {
    if (!user || !agreed || busy) return;
    setBusy(true);
    try {
      await recordConsents(user.id, pending);
      setPending([]);
    } catch {
      /* keep gate up on failure */
    } finally {
      setBusy(false);
    }
  }

  // Transparent while checking or when nothing is pending.
  if (checking || pending.length === 0) return <>{children}</>;

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-6 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] text-white">
            <ShieldCheck className="h-8 w-8" />
          </span>
          <h1 className="mt-4 text-[22px] font-extrabold tracking-tight text-ink">{c.title}</h1>
          <p className="mt-2 text-[14px] leading-snug text-ink-soft">{c.body}</p>
          <p className="mt-1 text-[12px] text-ink-faint">
            {c.effective} {LEGAL_EFFECTIVE}
          </p>
        </div>

        <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
          {REQUIRED_CONSENTS.map((d) => {
            const m = DOC_META[d];
            const Icon = m.icon;
            return (
              <div key={d} className="flex items-center gap-3 px-4 py-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1 text-[14px] font-semibold text-ink">
                  {c[m.key]} <span className="text-ink-faint">v{LEGAL_VERSIONS[d]}</span>
                </span>
                <Link href={m.href} className="text-[13px] font-semibold text-brand">
                  {c.review}
                </Link>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setAgreed((v) => !v)}
          className="mt-5 flex w-full items-start gap-3 text-left"
          aria-pressed={agreed}
        >
          <span
            className={
              "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-[1.5px] transition-colors " +
              (agreed ? "border-brand bg-brand text-white" : "border-line-strong bg-surface-2 text-transparent")
            }
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <span className="text-[13px] leading-snug text-ink-soft">{c.agree}</span>
        </button>

        <button
          onClick={handleAccept}
          disabled={!agreed || busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" strokeWidth={3} />}
          {busy ? c.saving : c.accept}
        </button>
      </div>
    </div>
  );
}
