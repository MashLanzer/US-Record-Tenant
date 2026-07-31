"use client";

import {
  ShieldCheck,
  FileText,
  Camera,
  Home,
  Landmark,
  FileSearch,
  TrendingUp,
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
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { verifications } from "@/lib/mock";

const copy = {
  en: {
    title: "Verification status",
    trustLevel: "Trust level",
    levelName: "Verified · Level 3",
    complete: "complete",
    nudge: "2 more to reach Fully Verified — unlock priority in landlord searches.",
    of: "of",
    completeBtn: "Complete",
    locked: "Locked",
  },
  es: {
    title: "Estado de verificación",
    trustLevel: "Nivel de confianza",
    levelName: "Verificado · Nivel 3",
    complete: "completos",
    nudge: "2 más para llegar a Totalmente Verificado — desbloquea prioridad en búsquedas.",
    of: "de",
    completeBtn: "Completar",
    locked: "Bloqueado",
  },
};

const ICONS: Record<string, LucideIcon> = {
  identity: FileText,
  selfie: Camera,
  address: Home,
  income: Landmark,
  background: FileSearch,
};

export default function VerificationStatusScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();

  const total = verifications.length;
  const done = verifications.filter((v) => v.state === "verified").length;
  const pct = Math.round((done / total) * 100);

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Trust level card */}
          <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] p-5">
            <div className="flex items-center gap-2 text-white/85">
              <ShieldCheck className="h-[18px] w-[18px]" />
              <span className="text-[11px] font-bold uppercase tracking-wider">{c.trustLevel}</span>
            </div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-[22px] font-extrabold tracking-tight text-white">{c.levelName}</div>
              <div className="text-[13px] font-semibold text-white/90 tnum">
                {done} {c.of} {total} {c.complete}
              </div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-white/85">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{c.nudge}</span>
            </div>
          </Card>

          {/* Verification list */}
          <Stagger className="mt-5 flex flex-col gap-2.5">
            {verifications.map((v) => {
              const Icon = ICONS[v.key] ?? FileText;
              const label = locale === "es" ? v.labelEs : v.labelEn;
              const date = locale === "es" ? v.dateEs : v.dateEn;

              const iconWrap =
                v.state === "verified"
                  ? "bg-verify-tint text-verify"
                  : v.state === "pending"
                    ? "bg-amber-tint text-amber"
                    : "bg-surface-3 text-ink-faint";

              return (
                <StaggerItem key={v.key}>
                  <Card className={`p-4 ${v.state === "locked" ? "opacity-70" : ""}`}>
                    <div className="flex items-center gap-3.5">
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconWrap}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-semibold text-ink">{label}</div>
                        {date && <div className="text-[12.5px] text-ink-faint">{date}</div>}
                      </div>
                      {v.state === "verified" && (
                        <Chip tone="verify" icon={<Check className="h-3.5 w-3.5" strokeWidth={3} />}>
                          {g.status.verified}
                        </Chip>
                      )}
                      {v.state === "pending" && (
                        <Chip tone="pending" icon={<Clock className="h-3.5 w-3.5" />}>
                          {g.status.pending}
                        </Chip>
                      )}
                      {v.state === "locked" && (
                        <Chip tone="neutral" icon={<Lock className="h-3.5 w-3.5" />}>
                          {c.locked}
                        </Chip>
                      )}
                    </div>

                    {v.state !== "verified" && (
                      <div className="mt-3">
                        <Button
                          full
                          variant="ghost"
                          size="sm"
                          iconRight={<ChevronRight className="h-4 w-4" />}
                        >
                          {c.completeBtn}
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
