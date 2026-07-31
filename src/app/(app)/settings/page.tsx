"use client";

import { useState } from "react";
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
import { AppHeader, SectionTitle } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, ListRow, Toggle } from "@/components/ui/primitives";
import { ThemeToggle, LangToggle } from "@/components/toggles";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { me } from "@/lib/mock";

const copy = {
  en: {
    title: "Settings",
    account: "Account",
    name: "Name",
    email: "Email",
    security: "Security",
    faceId: "Face ID",
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
    faceId: "Face ID",
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
  const [faceId, setFaceId] = useState(true);
  const [notify, setNotify] = useState(true);

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Account */}
          <SectionTitle>{c.account}</SectionTitle>
          <Card className="divide-y divide-line px-3.5">
            <ListRow icon={<User className="h-5 w-5" />} title={c.name} subtitle={me.name} right={chevron} onClick={() => {}} />
            <ListRow icon={<Mail className="h-5 w-5" />} title={c.email} subtitle="maria.r@email.com" right={chevron} onClick={() => {}} />
          </Card>

          {/* Security */}
          <SectionTitle>{c.security}</SectionTitle>
          <Card className="divide-y divide-line px-3.5">
            <ListRow
              icon={<ScanFace className="h-5 w-5" />}
              title={c.faceId}
              tone="verify"
              right={<Toggle checked={faceId} onChange={setFaceId} />}
            />
            <ListRow icon={<Lock className="h-5 w-5" />} title={c.changePassword} right={chevron} onClick={() => {}} />
          </Card>

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
            <ListRow icon={<Info className="h-5 w-5" />} title={c.about} tone="neutral" right={chevron} onClick={() => {}} />
            <ListRow icon={<CircleHelp className="h-5 w-5" />} title={c.help} tone="neutral" right={chevron} href="/help" />
          </Card>

          {/* Log out */}
          <Card className="mt-6 px-3.5">
            <ListRow icon={<LogOut className="h-5 w-5" />} title={<span className="text-danger">{c.logout}</span>} tone="danger" onClick={() => {}} />
          </Card>
        </Screen>
      </PageFade>
    </>
  );
}
