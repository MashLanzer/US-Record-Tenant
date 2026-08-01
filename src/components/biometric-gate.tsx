"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ScanFace, Loader2, LockKeyhole } from "lucide-react";
import { isNativeApp } from "@/lib/platform";
import { authenticateBiometric } from "@/lib/biometric";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";

// Session flag so we only require biometrics once per app launch, not on every
// in-app navigation.
let unlockedThisSession = false;

const copy = {
  en: {
    title: "Tenant Trust is locked",
    sub: "Unlock with Face ID or your fingerprint to continue.",
    unlock: "Unlock",
    checking: "Verifying…",
    failed: "Couldn't verify. Try again.",
  },
  es: {
    title: "Tenant Trust está bloqueado",
    sub: "Desbloquea con Face ID o tu huella para continuar.",
    unlock: "Desbloquear",
    checking: "Verificando…",
    failed: "No se pudo verificar. Inténtalo de nuevo.",
  },
};

/**
 * Requires a biometric unlock on native app launch when the user enabled it in
 * Settings and a session exists. On the web (or when disabled) it's transparent.
 */
export function BiometricGate({ children }: { children: ReactNode }) {
  const c = useT(copy);
  const { user, demoMode } = useAuth();

  const enabled = (() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem("tt.pref.biometric") === "1";
    } catch {
      return false;
    }
  })();

  const gateApplies = isNativeApp() && enabled && !demoMode && !!user;

  const [locked, setLocked] = useState(gateApplies && !unlockedThisSession);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const attempt = async () => {
    setBusy(true);
    setFailed(false);
    const ok = await authenticateBiometric(c.sub);
    setBusy(false);
    if (ok) {
      unlockedThisSession = true;
      setLocked(false);
    } else {
      setFailed(true);
    }
  };

  useEffect(() => {
    if (!gateApplies || unlockedThisSession) {
      setLocked(false);
      return;
    }
    setLocked(true);
    void attempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateApplies]);

  if (!locked) return <>{children}</>;

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-8 text-center">
      <div className="flex flex-col items-center">
        <span className="grid h-20 w-20 place-items-center rounded-[28px] bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] text-white shadow-[var(--shadow-2)]">
          <LockKeyhole className="h-9 w-9" />
        </span>
        <h1 className="mt-6 text-[20px] font-extrabold tracking-tight text-ink">{c.title}</h1>
        <p className="mt-2 max-w-xs text-[14px] leading-snug text-ink-soft">{c.sub}</p>
        {failed && <p className="mt-3 text-[13px] font-medium text-danger">{c.failed}</p>}
        <button
          onClick={attempt}
          disabled={busy}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-[15px] font-bold text-white disabled:opacity-70"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanFace className="h-5 w-5" />}
          {busy ? c.checking : c.unlock}
        </button>
      </div>
    </div>
  );
}
