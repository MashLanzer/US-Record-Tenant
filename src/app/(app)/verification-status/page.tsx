"use client";

import {
  ShieldCheck,
  FileText,
  Landmark,
  FileSearch,
  Check,
  Clock,
  Lock,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Chip, Button } from "@/components/ui/primitives";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { useAuth } from "@/lib/auth";

const copy = {
  en: {
    title: "Verification status",
    trustLevel: "Trust level",
    verifiedName: "Identity verified",
    verifiedSub: "Your identity is confirmed and visible to landlords.",
    unverifiedName: "Identity not verified",
    unverifiedSub: "Verify your identity to unlock trusted rental records.",
    verifyNow: "Verify now",
    items: "Verification items",
    identity: "Identity",
    identityVerifiedSub: "Government ID confirmed",
    identityPendingSub: "Not started yet",
    income: "Income",
    incomeSub: "Bank-linked income check",
    background: "Background check",
    backgroundSub: "Rental & eviction history",
    complete: "Complete",
    pending: "Pending",
    locked: "Locked",
    comingSoon: "Coming soon",
  },
  es: {
    title: "Estado de verificación",
    trustLevel: "Nivel de confianza",
    verifiedName: "Identidad verificada",
    verifiedSub: "Tu identidad está confirmada y visible para los propietarios.",
    unverifiedName: "Identidad sin verificar",
    unverifiedSub: "Verifica tu identidad para desbloquear registros de alquiler confiables.",
    verifyNow: "Verificar ahora",
    items: "Elementos de verificación",
    identity: "Identidad",
    identityVerifiedSub: "Identidad oficial confirmada",
    identityPendingSub: "Aún no iniciado",
    income: "Ingresos",
    incomeSub: "Verificación de ingresos por banco",
    background: "Antecedentes",
    backgroundSub: "Historial de alquiler y desalojos",
    complete: "Completar",
    pending: "Pendiente",
    locked: "Bloqueado",
    comingSoon: "Próximamente",
  },
};

type RowState = "verified" | "pending" | "locked";

export default function VerificationStatusScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { profile } = useAuth();

  const idVerified = !!profile?.identity_verified;

  const rows: {
    key: string;
    icon: LucideIcon;
    title: string;
    subtitle: string;
    state: RowState;
    real: boolean;
    completeHref?: string;
  }[] = [
    {
      key: "identity",
      icon: FileText,
      title: c.identity,
      subtitle: idVerified ? c.identityVerifiedSub : c.identityPendingSub,
      state: idVerified ? "verified" : "pending",
      real: true,
      completeHref: "/verify-identity",
    },
    {
      key: "income",
      icon: Landmark,
      title: c.income,
      subtitle: c.incomeSub,
      state: "pending",
      real: false,
    },
    {
      key: "background",
      icon: FileSearch,
      title: c.background,
      subtitle: c.backgroundSub,
      state: "locked",
      real: false,
    },
  ];

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Trust level card — reflects real identity state */}
          {idVerified ? (
            <Card className="overflow-hidden border-verify/40 bg-verify-tint/50 p-5">
              <div className="flex items-center gap-2 text-verify">
                <ShieldCheck className="h-[18px] w-[18px]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">{c.trustLevel}</span>
              </div>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[22px] font-extrabold tracking-tight text-ink">{c.verifiedName}</div>
                  <div className="mt-1 text-[13px] leading-relaxed text-ink-soft">{c.verifiedSub}</div>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-verify text-white shadow-[var(--shadow-1)]">
                  <Check className="h-5 w-5" strokeWidth={3} />
                </span>
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] p-5">
              <div className="flex items-center gap-2 text-white/85">
                <ShieldCheck className="h-[18px] w-[18px]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">{c.trustLevel}</span>
              </div>
              <div className="mt-2 text-[22px] font-extrabold tracking-tight text-white">{c.unverifiedName}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-white/85">{c.unverifiedSub}</div>
              <div className="mt-4">
                <Button
                  href="/verify-identity"
                  variant="secondary"
                  full
                  iconRight={<ChevronRight className="h-[18px] w-[18px]" />}
                >
                  {c.verifyNow}
                </Button>
              </div>
            </Card>
          )}

          {/* Verification items */}
          <div className="mt-6 mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
            {c.items}
          </div>
          <Stagger className="flex flex-col gap-2.5">
            {rows.map((row) => {
              const Icon = row.icon;
              const iconWrap =
                row.state === "verified"
                  ? "bg-verify-tint text-verify"
                  : row.state === "pending"
                    ? "bg-amber-tint text-amber"
                    : "bg-surface-3 text-ink-faint";

              return (
                <StaggerItem key={row.key}>
                  <Card className={`p-4 ${row.state === "locked" ? "opacity-70" : ""}`}>
                    <div className="flex items-center gap-3.5">
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconWrap}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-semibold text-ink">{row.title}</div>
                        <div className="text-[12.5px] text-ink-faint">{row.subtitle}</div>
                        {!row.real && (
                          <div className="mt-0.5 text-[11.5px] font-medium text-ink-ghost">{c.comingSoon}</div>
                        )}
                      </div>
                      {row.state === "verified" && (
                        <Chip tone="verify" icon={<Check className="h-3.5 w-3.5" strokeWidth={3} />}>
                          {g.status.verified}
                        </Chip>
                      )}
                      {row.state === "pending" && (
                        <Chip tone="pending" icon={<Clock className="h-3.5 w-3.5" />}>
                          {g.status.pending}
                        </Chip>
                      )}
                      {row.state === "locked" && (
                        <Chip tone="neutral" icon={<Lock className="h-3.5 w-3.5" />}>
                          {c.locked}
                        </Chip>
                      )}
                    </div>

                    {/* Only the real, incomplete Identity row offers a working action */}
                    {row.real && row.state !== "verified" && row.completeHref && (
                      <div className="mt-3">
                        <Button
                          href={row.completeHref}
                          full
                          variant="ghost"
                          size="sm"
                          iconRight={<ChevronRight className="h-4 w-4" />}
                        >
                          {c.complete}
                        </Button>
                      </div>
                    )}
                  </Card>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Screen>
      </PageFade>
    </>
  );
}
