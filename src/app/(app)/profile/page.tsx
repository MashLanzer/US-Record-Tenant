"use client";

import {
  ChevronRight,
  ShieldCheck,
  BadgeCheck,
  BarChart3,
  FileText,
  Sparkles,
  CircleHelp,
  Settings,
  LogOut,
  Share2,
  Check,
} from "lucide-react";
import { Screen } from "@/components/app-shell";
import { SectionTitle } from "@/components/app-header";
import { Avatar, Card, Chip, ListRow, Button } from "@/components/ui/primitives";
import { TrustRing, FactorBars } from "@/components/ui/trust";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { useAuth } from "@/lib/auth";
import { me, trustFactors, verifications } from "@/lib/mock";

const copy = {
  en: {
    memberSince: "Member since",
    yourIndex: "Your Trust Index",
    whatWeVerify: "Verified about you",
    account: "Account",
    reputation: "How your score works",
    reputationSub: "Every factor, explained",
    verification: "Verification status",
    verificationSub: "IDs, income, background",
    stats: "Statistics",
    statsSub: "Your trends over time",
    dossier: "Your dossier",
    dossierSub: "Who has viewed your record",
    premium: "Premium",
    premiumSub: "Unlock deeper insights",
    help: "Help & support",
    helpSub: "Answers and contact",
    settings: "Settings",
    settingsSub: "Privacy, language, theme",
    share: "Share profile",
    logout: "Log out",
  },
  es: {
    memberSince: "Miembro desde",
    yourIndex: "Tu índice de confianza",
    whatWeVerify: "Verificado sobre ti",
    account: "Cuenta",
    reputation: "Cómo funciona tu score",
    reputationSub: "Cada factor, explicado",
    verification: "Estado de verificación",
    verificationSub: "IDs, ingresos, antecedentes",
    stats: "Estadísticas",
    statsSub: "Tus tendencias en el tiempo",
    dossier: "Tu expediente",
    dossierSub: "Quién ha visto tu historial",
    premium: "Premium",
    premiumSub: "Desbloquea más análisis",
    help: "Ayuda y soporte",
    helpSub: "Respuestas y contacto",
    settings: "Ajustes",
    settingsSub: "Privacidad, idioma, tema",
    share: "Compartir perfil",
    logout: "Cerrar sesión",
  },
};

export default function ProfileScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();
  const { signOut } = useAuth();

  const verifiedChips = verifications.filter((v) => v.state === "verified");

  const menu = [
    { icon: <ShieldCheck className="h-5 w-5" />, title: c.reputation, subtitle: c.reputationSub, href: "/reputation", tone: "brand" as const },
    { icon: <BadgeCheck className="h-5 w-5" />, title: c.verification, subtitle: c.verificationSub, href: "/verification-status", tone: "verify" as const },
    { icon: <BarChart3 className="h-5 w-5" />, title: c.stats, subtitle: c.statsSub, href: "/stats", tone: "brand" as const },
    { icon: <FileText className="h-5 w-5" />, title: c.dossier, subtitle: c.dossierSub, href: "/dossier", tone: "neutral" as const },
    { icon: <Sparkles className="h-5 w-5" />, title: c.premium, subtitle: c.premiumSub, href: "/premium", tone: "amber" as const },
    { icon: <CircleHelp className="h-5 w-5" />, title: c.help, subtitle: c.helpSub, href: "/help", tone: "neutral" as const },
    { icon: <Settings className="h-5 w-5" />, title: c.settings, subtitle: c.settingsSub, href: "/settings", tone: "neutral" as const },
  ];

  return (
    <PageFade>
      <Screen>
        {/* Header */}
        <div className="flex flex-col items-center pt-2 text-center">
          <Avatar initials={me.initials} size={64} verified />
          <h1 className="mt-3 text-[24px] font-extrabold tracking-tight text-ink">{me.name}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <Chip tone="brand">{g.roles.tenant}</Chip>
            <span className="text-[13px] text-ink-faint">
              {c.memberSince} {me.memberSince}
            </span>
          </div>
        </div>

        {/* Verification chips */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {verifiedChips.map((v) => (
            <Chip key={v.key} tone="verify" icon={<Check className="h-3.5 w-3.5" strokeWidth={3} />}>
              {locale === "es" ? v.labelEs : v.labelEn}
            </Chip>
          ))}
        </div>

        {/* Trust card */}
        <Card className="mt-5 p-5">
          <div className="flex items-center gap-4">
            <TrustRing score={me.trustScore} size={92} />
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                {c.yourIndex}
              </div>
              <div className="mt-0.5 text-[14px] font-semibold text-ink">
                {locale === "es" ? me.ratingLabelEs : me.ratingLabelEn}
              </div>
              <div className="text-[12px] text-ink-faint">
                {locale === "es" ? me.yearsEs : me.yearsEn}
              </div>
            </div>
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <FactorBars factors={trustFactors} labelKey={locale} />
          </div>
        </Card>

        {/* Menu */}
        <SectionTitle>{c.account}</SectionTitle>
        <Card className="p-2">
          <Stagger>
            {menu.map((m, i) => (
              <StaggerItem key={m.href}>
                <div className={i > 0 ? "border-t border-line" : ""}>
                  <div className="px-2 py-1">
                    <ListRow
                      icon={m.icon}
                      title={m.title}
                      subtitle={m.subtitle}
                      href={m.href}
                      tone={m.tone}
                      right={<ChevronRight className="h-5 w-5 shrink-0 text-ink-ghost" />}
                    />
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Card>

        {/* Share */}
        <div className="mt-5">
          <Button href="/trust" variant="secondary" full icon={<Share2 className="h-[18px] w-[18px]" />}>
            {c.share}
          </Button>
        </div>

        {/* Log out */}
        <Card className="mt-3 p-2">
          <div className="px-2 py-1">
            <ListRow
              icon={<LogOut className="h-5 w-5" />}
              title={<span className="text-danger">{c.logout}</span>}
              onClick={signOut}
              tone="danger"
            />
          </div>
        </Card>
      </Screen>
    </PageFade>
  );
}
