"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IdCard, ScanFace, FileText, Check, Lock, Loader2, Upload, Camera } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Card, Button, Chip } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { uploadDocument, updateIdentityVerified } from "@/lib/data";

type StepKey = "id" | "selfie" | "address";

const copy = {
  en: {
    title: "Verify your identity",
    subtitle: "Complete the three steps below to activate your verified badge.",
    note: "Prototype: your files are stored securely now; automated ID matching arrives with our verification partner.",
    idTitle: "Government ID",
    idSub: "Passport, driver's license or ID card",
    selfieTitle: "Liveness selfie",
    selfieSub: "A quick selfie to confirm it's you",
    addressTitle: "Proof of address / ownership",
    addressSub: "Utility bill, lease or property deed",
    upload: "Upload",
    take: "Take selfie",
    uploading: "Uploading…",
    done: "Done",
    finish: "Finish verification",
    finishing: "Finishing…",
    uploadErr: "Upload failed. Please try again.",
    encrypted: "Encrypted end-to-end",
    loginFirst: "Please log in to verify.",
  },
  es: {
    title: "Verifica tu identidad",
    subtitle: "Completa los tres pasos para activar tu badge verificado.",
    note: "Prototipo: tus archivos se guardan de forma segura ahora; la verificación automática de ID llega con nuestro proveedor.",
    idTitle: "Identidad oficial",
    idSub: "Pasaporte, licencia o cédula",
    selfieTitle: "Selfie con prueba de vida",
    selfieSub: "Una selfie rápida para confirmar que eres tú",
    addressTitle: "Comprobante de domicilio / propiedad",
    addressSub: "Recibo, contrato o escritura",
    upload: "Subir",
    take: "Tomar selfie",
    uploading: "Subiendo…",
    done: "Listo",
    finish: "Finalizar verificación",
    finishing: "Finalizando…",
    uploadErr: "Falló la subida. Inténtalo de nuevo.",
    encrypted: "Cifrado de extremo a extremo",
    loginFirst: "Inicia sesión para verificar.",
  },
};

export default function VerifyIdentityScreen() {
  const c = useT(copy);
  const router = useRouter();
  const { user, demoMode, refreshProfile } = useAuth();

  const [done, setDone] = useState<Record<StepKey, boolean>>({ id: false, selfie: false, address: false });
  const [uploading, setUploading] = useState<StepKey | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refs = {
    id: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null),
    address: useRef<HTMLInputElement>(null),
  };

  async function handleFile(step: StepKey, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(step);
    setError(null);
    try {
      if (!demoMode && user) await uploadDocument(user.id, file, "verification");
      setDone((d) => ({ ...d, [step]: true }));
    } catch {
      setError(c.uploadErr);
    } finally {
      setUploading(null);
      if (refs[step].current) refs[step].current!.value = "";
    }
  }

  const allDone = done.id && done.selfie && done.address;

  async function finish() {
    if (!allDone || finishing) return;
    setFinishing(true);
    try {
      if (user) {
        await updateIdentityVerified(user.id);
        await refreshProfile();
      }
      router.push("/consent");
    } catch {
      setFinishing(false);
    }
  }

  const steps: { key: StepKey; icon: React.ReactNode; title: string; sub: string; action: string; selfie?: boolean }[] = [
    { key: "id", icon: <IdCard className="h-5 w-5" />, title: c.idTitle, sub: c.idSub, action: c.upload },
    { key: "selfie", icon: <ScanFace className="h-5 w-5" />, title: c.selfieTitle, sub: c.selfieSub, action: c.take, selfie: true },
    { key: "address", icon: <FileText className="h-5 w-5" />, title: c.addressTitle, sub: c.addressSub, action: c.upload },
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

      <div className="mt-5 flex flex-col gap-2.5">
        {steps.map((s) => {
          const isDone = done[s.key];
          const isUploading = uploading === s.key;
          return (
            <Card
              key={s.key}
              className={"p-3.5 " + (isDone ? "border-verify/40 bg-verify-tint/40" : "")}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={
                    "grid h-11 w-11 shrink-0 place-items-center rounded-xl " +
                    (isDone ? "bg-verify text-white" : "bg-brand-tint text-brand")
                  }
                >
                  {isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : s.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-bold text-ink">{s.title}</div>
                  <div className="text-[13px] text-ink-faint">{s.sub}</div>
                </div>
                {isDone ? (
                  <Chip tone="verify" icon={<Check className="h-3.5 w-3.5" strokeWidth={3} />}>
                    {c.done}
                  </Chip>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={isUploading}
                    onClick={() => refs[s.key].current?.click()}
                    icon={
                      isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : s.selfie ? (
                        <Camera className="h-4 w-4" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )
                    }
                  >
                    {isUploading ? c.uploading : s.action}
                  </Button>
                )}
              </div>
              <input
                ref={refs[s.key]}
                type="file"
                accept={s.selfie ? "image/*" : "image/*,application/pdf"}
                capture={s.selfie ? "user" : undefined}
                className="hidden"
                onChange={(e) => handleFile(s.key, e)}
              />
            </Card>
          );
        })}
      </div>

      {error && <p className="mt-3 text-[13px] font-medium text-danger">{error}</p>}
      {!user && !demoMode && <p className="mt-3 text-[13px] text-ink-faint">{c.loginFirst}</p>}

      <div className="mt-auto pt-8">
        <div className="mb-3 flex items-center justify-center gap-1.5 text-[12px] font-medium text-ink-faint">
          <Lock className="h-3.5 w-3.5 text-verify" />
          {c.encrypted}
        </div>
        <Button
          full
          size="lg"
          onClick={finish}
          disabled={!allDone || finishing}
          icon={finishing ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Check className="h-[18px] w-[18px]" />}
        >
          {finishing ? c.finishing : c.finish}
        </Button>
      </div>
    </AuthShell>
  );
}
