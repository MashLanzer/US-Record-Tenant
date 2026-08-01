"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Avatar, Button, Card, Field, Input } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { updateProfile } from "@/lib/data";
import { initialsFrom } from "@/lib/identity";

const copy = {
  en: {
    title: "Edit profile",
    fullName: "Full name",
    fullNamePh: "Jane Doe",
    phone: "Phone",
    phonePh: "(555) 123-4567",
    phoneHint: "Only shared when you choose to.",
    bio: "About you",
    bioPh: "A short line landlords or tenants will see.",
    email: "Email",
    emailHint: "Your login email can't be changed here.",
    save: "Save changes",
    saving: "Saving…",
    saved: "Profile updated.",
    err: "Could not save. Please try again.",
    demo: "Sign in to edit your real profile.",
  },
  es: {
    title: "Editar perfil",
    fullName: "Nombre completo",
    fullNamePh: "Juana Pérez",
    phone: "Teléfono",
    phonePh: "(555) 123-4567",
    phoneHint: "Solo se comparte cuando tú lo decides.",
    bio: "Sobre ti",
    bioPh: "Una línea breve que verán inquilinos o propietarios.",
    email: "Correo",
    emailHint: "Tu correo de acceso no se cambia aquí.",
    save: "Guardar cambios",
    saving: "Guardando…",
    saved: "Perfil actualizado.",
    err: "No se pudo guardar. Inténtalo de nuevo.",
    demo: "Inicia sesión para editar tu perfil real.",
  },
};

export default function EditProfileScreen() {
  const c = useT(copy);
  const router = useRouter();
  const { profile, user, demoMode, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const initials = initialsFrom(fullName) === "?" ? (profile?.avatar_initials ?? "?") : initialsFrom(fullName);

  async function handleSave() {
    if (!user || saving) return;
    setSaving(true);
    setMsg(null);
    setError(false);
    try {
      await updateProfile(user.id, {
        full_name: fullName,
        phone,
        bio,
        avatar_initials: initials,
      });
      await refreshProfile();
      setMsg(c.saved);
      setTimeout(() => router.push("/profile"), 600);
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
            <Avatar initials={initials} size={72} verified={!!profile?.identity_verified} />
          </div>

          {demoMode && (
            <p className="mt-4 rounded-xl bg-amber-tint px-3.5 py-2.5 text-center text-[12.5px] font-medium text-amber">
              {c.demo}
            </p>
          )}

          <Card className="mt-5 space-y-4 p-4">
            <Field label={c.fullName}>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={c.fullNamePh} />
            </Field>
            <Field label={c.phone} hint={c.phoneHint}>
              <Input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={c.phonePh}
              />
            </Field>
            <Field label={c.bio}>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={c.bioPh}
                rows={3}
                maxLength={160}
                className="w-full resize-none rounded-xl border-[1.5px] border-line-strong bg-surface-2 px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-tint"
              />
            </Field>
            <Field label={c.email} hint={c.emailHint}>
              <Input value={user?.email ?? ""} disabled className="opacity-60" />
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
            disabled={saving || demoMode}
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
