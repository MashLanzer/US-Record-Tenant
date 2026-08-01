"use client";

import {
  User,
  Mail,
  ChevronRight,
  ScanFace,
  Lock,
  Shield,
  FileText,
  Moon,
  Languages,
  Bell,
  Info,
  CircleHelp,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { AppHeader, SectionTitle } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, ListRow, Toggle } from "@/components/ui/primitives";
import { ThemeToggle, LangToggle } from "@/components/toggles";
import { PageFade } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { displayName } from "@/lib/identity";
import { usePref } from "@/lib/prefs";
import { isBiometricAvailable } from "@/lib/biometric";
import { isNativeApp } from "@/lib/platform";

const copy = {
  en: {
    title: "Settings",
    account: "Account",
    name: "Name",
    email: "Email",
    security: "Security",
    faceId: "Biometric unlock",
    faceIdSub: "Use Face ID / fingerprint on this device",
    faceIdWeb: "Biometric unlock works in the mobile app. Install Tenant Trust on your phone to enable it.",
    faceIdNone: "No biometrics are set up on this device. Add Face ID or a fingerprint in your device settings first.",
    changePassword: "Change password",
    privacy: "Privacy",
    consent: "Consent & data",
    consentSub: "Manage who can see your record",
    dossier: "Your dossier",
    dossierSub: "See every access to your data",
    preferences: "Preferences",
    darkMode: "Dark mode",
    language: "Language",
    app: "App",
    notifications: "Notifications",
    about: "About",
    help: "Help & support",
    logout: "Log out",
  },
  es: {
    title: "Ajustes",
    account: "Cuenta",
    name: "Nombre",
    email: "Correo",
    security: "Seguridad",
    faceId: "Desbloqueo biométrico",
    faceIdSub: "Usa Face ID / huella en este dispositivo",
    faceIdWeb: "El desbloqueo biométrico funciona en la app móvil. Instala Tenant Trust en tu teléfono para activarlo.",
    faceIdNone: "No hay biometría configurada en este dispositivo. Añade Face ID o una huella en los ajustes del sistema primero.",
    changePassword: "Cambiar contraseña",
    privacy: "Privacidad",
    consent: "Consentimiento y datos",
    consentSub: "Gestiona quién ve tu historial",
    dossier: "Tu expediente",
    dossierSub: "Cada acceso a tus datos",
    preferences: "Preferencias",
    darkMode: "Modo oscuro",
    language: "Idioma",
    app: "App",
    notifications: "Notificaciones",
    about: "Acerca de",
    help: "Ayuda y soporte",
    logout: "Cerrar sesión",
  },
};

const chevron = <ChevronRight className="h-5 w-5 text-ink-faint" />;

export default function SettingsScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const { signOut, profile, user } = useAuth();
  const [faceId, setFaceId] = usePref("biometric", false);
  const [notify, setNotify] = usePref("notifications", true);
  const [bioMsg, setBioMsg] = useState<string | null>(null);
  const name = displayName(profile, user?.email, locale);

  async function toggleFaceId(next: boolean) {
    setBioMsg(null);
    if (!next) {
      setFaceId(false);
      return;
    }
    if (!isNativeApp()) {
      setBioMsg(c.faceIdWeb);
      return;
    }
    const ok = await isBiometricAvailable();
    if (ok) setFaceId(true);
    else setBioMsg(c.faceIdNone);
  }

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Account */}
          <SectionTitle>{c.account}</SectionTitle>
          <Card className="divide-y divide-line px-3.5">
            <ListRow icon={<User className="h-5 w-5" />} title={c.name} subtitle={name} right={chevron} href="/profile/edit" />
            <ListRow icon={<Mail className="h-5 w-5" />} title={c.email} subtitle={user?.email ?? "—"} right={chevron} href="/profile/edit" />
          </Card>

          {/* Security */}
          <SectionTitle>{c.security}</SectionTitle>
          <Card className="divide-y divide-line px-3.5">
            <ListRow
              icon={<ScanFace className="h-5 w-5" />}
              title={c.faceId}
              subtitle={c.faceIdSub}
              tone="verify"
              right={<Toggle checked={faceId} onChange={toggleFaceId} />}
            />
            <ListRow icon={<Lock className="h-5 w-5" />} title={c.changePassword} right={chevron} href="/settings/password" />
          </Card>
          {bioMsg && (
            <p className="mt-2 rounded-xl bg-amber-tint px-3.5 py-2.5 text-[12.5px] font-medium text-amber">{bioMsg}</p>
          )}

          {/* Privacy */}
          <SectionTitle>{c.privacy}</SectionTitle>
          <Card className="divide-y divide-line px-3.5">
            <ListRow icon={<Shield className="h-5 w-5" />} title={c.consent} subtitle={c.consentSub} right={chevron} href="/consent" />
            <ListRow icon={<FileText className="h-5 w-5" />} title={c.dossier} subtitle={c.dossierSub} right={chevron} href="/dossier" />
          </Card>

          {/* Preferences */}
          <SectionTitle>{c.preferences}</SectionTitle>
          <Card className="divide-y divide-line px-3.5">
            <ListRow icon={<Moon className="h-5 w-5" />} title={c.darkMode} tone="neutral" right={<ThemeToggle />} />
            <ListRow icon={<Languages className="h-5 w-5" />} title={c.language} tone="neutral" right={<LangToggle />} />
          </Card>

          {/* App */}
          <SectionTitle>{c.app}</SectionTitle>
          <Card className="divide-y divide-line px-3.5">
            <ListRow
              icon={<Bell className="h-5 w-5" />}
              title={c.notifications}
              tone="amber"
              right={<Toggle checked={notify} onChange={setNotify} />}
            />
            <ListRow icon={<Info className="h-5 w-5" />} title={c.about} tone="neutral" right={chevron} href="/about" />
            <ListRow icon={<CircleHelp className="h-5 w-5" />} title={c.help} tone="neutral" right={chevron} href="/help" />
          </Card>

          {/* Log out */}
          <Card className="mt-6 px-3.5">
            <ListRow icon={<LogOut className="h-5 w-5" />} title={<span className="text-danger">{c.logout}</span>} tone="danger" onClick={signOut} />
          </Card>
        </Screen>
      </PageFade>
    </>
  );
}
