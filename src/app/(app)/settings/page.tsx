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
  Download,
  Trash2,
  Scale,
  AlertTriangle,
  Loader2,
  Clock,
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
import { exportMyData, deleteAccount } from "@/lib/data";

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
    dataPrivacy: "Data & rights",
    exportData: "Export my data",
    exportSub: "Download everything we hold on you",
    exporting: "Preparing…",
    fcra: "FCRA notice",
    fcraSub: "How you may use this app",
    consents: "My consents",
    consentsSub: "Agreements you've accepted",
    retention: "Data retention",
    retentionSub: "How long we keep your data",
    deleteAccount: "Delete my account",
    deleteSub: "Permanently erase your data",
    delTitle: "Delete your account?",
    delBody: "This permanently erases your profile, contracts, payments, facts, ratings and messages. This cannot be undone.",
    delConfirm: "Yes, delete everything",
    deleting: "Deleting…",
    cancel: "Cancel",
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
    dataPrivacy: "Datos y derechos",
    exportData: "Exportar mis datos",
    exportSub: "Descarga todo lo que tenemos de ti",
    exporting: "Preparando…",
    fcra: "Aviso FCRA",
    fcraSub: "Cómo puedes usar esta app",
    consents: "Mis consentimientos",
    consentsSub: "Acuerdos que has aceptado",
    retention: "Retención de datos",
    retentionSub: "Cuánto tiempo guardamos tus datos",
    deleteAccount: "Eliminar mi cuenta",
    deleteSub: "Borra tus datos permanentemente",
    delTitle: "¿Eliminar tu cuenta?",
    delBody: "Esto borra permanentemente tu perfil, contratos, pagos, hechos, calificaciones y mensajes. No se puede deshacer.",
    delConfirm: "Sí, eliminar todo",
    deleting: "Eliminando…",
    cancel: "Cancelar",
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
  const [exporting, setExporting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const name = displayName(profile, user?.email, locale);

  async function handleExport() {
    if (!user || exporting) return;
    setExporting(true);
    try {
      const data = await exportMyData(user.id);
      data.generated = new Date().toISOString();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tenant-trust-data-${user.id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteAccount();
      await signOut();
    } catch {
      setDeleting(false);
      setConfirmDel(false);
    }
  }

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

          {/* Data & rights */}
          <SectionTitle>{c.dataPrivacy}</SectionTitle>
          <Card className="divide-y divide-line px-3.5">
            <ListRow
              icon={exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              title={c.exportData}
              subtitle={exporting ? c.exporting : c.exportSub}
              tone="brand"
              onClick={handleExport}
            />
            <ListRow icon={<Scale className="h-5 w-5" />} title={c.fcra} subtitle={c.fcraSub} tone="neutral" right={chevron} href="/legal/fcra" />
            <ListRow icon={<FileText className="h-5 w-5" />} title={c.consents} subtitle={c.consentsSub} tone="neutral" right={chevron} href="/legal/consents" />
            <ListRow icon={<Clock className="h-5 w-5" />} title={c.retention} subtitle={c.retentionSub} tone="neutral" right={chevron} href="/legal/retention" />
            <ListRow
              icon={<Trash2 className="h-5 w-5" />}
              title={<span className="text-danger">{c.deleteAccount}</span>}
              subtitle={c.deleteSub}
              tone="danger"
              onClick={() => setConfirmDel(true)}
            />
          </Card>

          {confirmDel && (
            <div className="mt-3 rounded-2xl border border-danger/30 bg-danger-tint p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                <div>
                  <div className="text-[14px] font-bold text-danger">{c.delTitle}</div>
                  <p className="mt-1 text-[13px] leading-snug text-ink-soft">{c.delBody}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setConfirmDel(false)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-[14px] font-semibold text-ink-soft"
                >
                  {c.cancel}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-[14px] font-bold text-white disabled:opacity-70"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {deleting ? c.deleting : c.delConfirm}
                </button>
              </div>
            </div>
          )}

          {/* Log out */}
          <Card className="mt-6 px-3.5">
            <ListRow icon={<LogOut className="h-5 w-5" />} title={<span className="text-danger">{c.logout}</span>} tone="danger" onClick={signOut} />
          </Card>
        </Screen>
      </PageFade>
    </>
  );
}
