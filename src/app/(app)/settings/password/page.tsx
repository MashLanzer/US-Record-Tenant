"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Button, Card, Field, Input } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { updatePassword } from "@/lib/data";

const copy = {
  en: {
    title: "Change password",
    intro: "Choose a new password for your account. Use at least 8 characters.",
    newPass: "New password",
    confirm: "Confirm password",
    show: "Show",
    hide: "Hide",
    save: "Update password",
    saving: "Updating…",
    saved: "Password updated.",
    tooShort: "Use at least 8 characters.",
    mismatch: "Passwords don't match.",
    err: "Could not update. Please try again.",
    demo: "Sign in to change your password.",
  },
  es: {
    title: "Cambiar contraseña",
    intro: "Elige una nueva contraseña para tu cuenta. Usa al menos 8 caracteres.",
    newPass: "Nueva contraseña",
    confirm: "Confirmar contraseña",
    show: "Mostrar",
    hide: "Ocultar",
    save: "Actualizar contraseña",
    saving: "Actualizando…",
    saved: "Contraseña actualizada.",
    tooShort: "Usa al menos 8 caracteres.",
    mismatch: "Las contraseñas no coinciden.",
    err: "No se pudo actualizar. Inténtalo de nuevo.",
    demo: "Inicia sesión para cambiar tu contraseña.",
  },
};

export default function ChangePasswordScreen() {
  const c = useT(copy);
  const router = useRouter();
  const { demoMode } = useAuth();

  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function handleSave() {
    if (saving) return;
    setMsg(null);
    setError(false);
    if (pass.length < 8) {
      setError(true);
      setMsg(c.tooShort);
      return;
    }
    if (pass !== confirm) {
      setError(true);
      setMsg(c.mismatch);
      return;
    }
    setSaving(true);
    try {
      await updatePassword(pass);
      setMsg(c.saved);
      setTimeout(() => router.push("/settings"), 700);
    } catch {
      setError(true);
      setMsg(c.err);
      setSaving(false);
    }
  }

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <div className="flex flex-col items-center pt-1">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-tint text-brand">
              <Lock className="h-7 w-7" />
            </span>
          </div>
          <p className="mt-4 text-center text-[13.5px] leading-snug text-ink-soft">{c.intro}</p>

          {demoMode && (
            <p className="mt-4 rounded-xl bg-amber-tint px-3.5 py-2.5 text-center text-[12.5px] font-medium text-amber">
              {c.demo}
            </p>
          )}

          <Card className="mt-5 space-y-4 p-4">
            <Field label={c.newPass}>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
                  aria-label={show ? c.hide : c.show}
                >
                  {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </Field>
            <Field label={c.confirm}>
              <Input
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
          </Card>

          {msg && (
            <p className={"mt-3 text-center text-[13px] font-medium " + (error ? "text-danger" : "text-verify")}>
              {msg}
            </p>
          )}

          <Button
            full
            size="lg"
            className="mt-5"
            disabled={saving || demoMode || !pass || !confirm}
            onClick={handleSave}
            icon={saving ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Check className="h-[18px] w-[18px]" />}
          >
            {saving ? c.saving : c.save}
          </Button>
        </Screen>
      </PageFade>
    </>
  );
}
