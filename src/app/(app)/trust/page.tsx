"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldQuestion,
  Send,
  Lock,
  Clock,
  Loader2,
  BadgeCheck,
  CreditCard,
  Star,
  Flag,
  Scale,
} from "lucide-react";
import { Screen } from "@/components/app-shell";
import { AppHeader } from "@/components/app-header";
import { Avatar, Card, Chip, Button, Skeleton } from "@/components/ui/primitives";
import { TrustRing } from "@/components/ui/trust";
import { PageFade } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { useAuth } from "@/lib/auth";
import {
  fetchPublicProfile,
  recordProfileView,
  fetchAccessStatus,
  fetchTrustReport,
  requestAccess,
  type PublicProfileData,
  type TrustReport,
  type AccessStatus,
} from "@/lib/data";

const copy = {
  en: {
    title: "Trust profile",
    verified: "Identity verified",
    unverified: "Unverified",
    indexLabel: "Trust Index",
    memberSince: "Member since",
    message: "Message",
    notFound: "Profile not found",
    reportTitle: "Trust report",
    gatedTitle: "Full report is private",
    gatedBody: "Ask this person for permission to see their verified history — leases, on-time payments, ratings and any disputes. They decide.",
    msgPh: "Add a note (optional) — e.g. why you're requesting.",
    requestBtn: "Request full report",
    requesting: "Sending…",
    pendingTitle: "Request sent",
    pendingBody: "Waiting for approval. You'll be notified when they respond.",
    declinedTitle: "Request not approved",
    declinedBody: "This person declined. You can ask again if something changed.",
    requestAgain: "Request again",
    leases: "Verified leases",
    onTime: "On-time payments",
    ratings: "Rating",
    facts: "Facts on record",
    disputes: "Disputed",
    noData: "No verified history yet.",
    self: "This is your public trust profile — this is what others see.",
    fcraNote: "Not a consumer report. Don't use it for FCRA-covered credit, housing, insurance or employment decisions.",
  },
  es: {
    title: "Perfil de confianza",
    verified: "Identidad verificada",
    unverified: "Sin verificar",
    indexLabel: "Índice de confianza",
    memberSince: "Miembro desde",
    message: "Mensaje",
    notFound: "Perfil no encontrado",
    reportTitle: "Reporte de confianza",
    gatedTitle: "El reporte completo es privado",
    gatedBody: "Pide permiso a esta persona para ver su historial verificado — contratos, pagos a tiempo, calificaciones y disputas. Ella decide.",
    msgPh: "Añade una nota (opcional) — ej. por qué lo solicitas.",
    requestBtn: "Solicitar reporte completo",
    requesting: "Enviando…",
    pendingTitle: "Solicitud enviada",
    pendingBody: "Esperando aprobación. Te avisaremos cuando responda.",
    declinedTitle: "Solicitud no aprobada",
    declinedBody: "Esta persona la rechazó. Puedes volver a pedir si algo cambió.",
    requestAgain: "Solicitar de nuevo",
    leases: "Contratos verificados",
    onTime: "Pagos a tiempo",
    ratings: "Calificación",
    facts: "Hechos en historial",
    disputes: "En disputa",
    noData: "Aún no hay historial verificado.",
    self: "Este es tu perfil público de confianza — esto es lo que ven los demás.",
    fcraNote: "No es un informe del consumidor. No lo uses para decisiones de crédito, vivienda, seguros o empleo cubiertas por la FCRA.",
  },
};

export default function PublicTrustScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();
  const { user } = useAuth();

  const [profile, setProfile] = useState<PublicProfileData | null | undefined>(undefined);
  const [report, setReport] = useState<TrustReport | null>(null);
  const [status, setStatus] = useState<AccessStatus>("none");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") ?? "";
    let alive = true;
    fetchPublicProfile(id).then((p) => alive && setProfile(p));
    if (id) {
      fetchTrustReport(id).then((r) => alive && setReport(r));
      if (user) fetchAccessStatus(user.id, id).then((s) => alive && setStatus(s));
    }
    if (user && id && id !== user.id) void recordProfileView(user.id, id);
    return () => {
      alive = false;
    };
  }, [user]);

  async function handleRequest() {
    if (!profile || busy) return;
    setBusy(true);
    try {
      await requestAccess(profile.id, message.trim());
      setStatus("pending");
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  if (profile === undefined) {
    return (
      <>
        <AppHeader title={c.title} back />
        <PageFade>
          <Screen>
            <div className="flex flex-col items-center pt-4">
              <Skeleton className="h-[72px] w-[72px] rounded-[28%]" />
              <Skeleton className="mt-3 h-6 w-40 rounded-full" />
            </div>
            <Skeleton className="mt-5 h-64 w-full rounded-2xl" />
          </Screen>
        </PageFade>
      </>
    );
  }

  if (profile === null) {
    return (
      <>
        <AppHeader title={c.title} back />
        <PageFade>
          <Screen>
            <p className="mt-16 text-center text-[15px] text-ink-faint">{c.notFound}</p>
          </Screen>
        </PageFade>
      </>
    );
  }

  const p = profile;
  const roleLabel = p.role === "landlord" ? g.roles.landlord : g.roles.tenant;
  const isSelf = status === "self";

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Hero */}
          <div className="flex flex-col items-center pt-3 text-center">
            <Avatar initials={p.initials} size={72} verified={p.verified} />
            <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-ink">{p.name}</h1>
            <div className="mt-2">
              {p.verified ? (
                <Chip tone="verify" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                  {c.verified}
                </Chip>
              ) : (
                <Chip tone="neutral" icon={<ShieldQuestion className="h-3.5 w-3.5" />}>
                  {c.unverified}
                </Chip>
              )}
            </div>
          </div>

          {/* Score card */}
          <Card className="mt-5 flex flex-col items-center p-6 text-center">
            <TrustRing score={p.score} size={128} />
            <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-ink-faint">
              {c.indexLabel}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Chip tone="brand">{roleLabel}</Chip>
              <span className="text-[13px] text-ink-faint tnum">
                {c.memberSince} {p.memberYear}
              </span>
            </div>
          </Card>

          {isSelf && (
            <p className="mt-3 text-center text-[12.5px] leading-snug text-ink-faint">{c.self}</p>
          )}

          {/* Full report (access granted) */}
          {report ? (
            <>
              <div className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
                {c.reportTitle}
              </div>
              <Card className="divide-y divide-line p-0">
                <ReportRow icon={<BadgeCheck className="h-[18px] w-[18px]" />} label={c.leases}>
                  <span className="tnum">
                    {report.verifiedLeases}
                    <span className="text-ink-faint">/{report.leases}</span>
                  </span>
                </ReportRow>
                {report.onTimeRate !== null && (
                  <ReportRow icon={<CreditCard className="h-[18px] w-[18px]" />} label={c.onTime}>
                    <span className="tnum text-verify">{report.onTimeRate}%</span>
                  </ReportRow>
                )}
                {report.ratingCount > 0 && (
                  <ReportRow icon={<Star className="h-[18px] w-[18px]" />} label={c.ratings}>
                    <span className="tnum">
                      {report.ratingAvg.toFixed(1)}★{" "}
                      <span className="text-ink-faint">({report.ratingCount})</span>
                    </span>
                  </ReportRow>
                )}
                <ReportRow icon={<Flag className="h-[18px] w-[18px]" />} label={c.facts}>
                  <span className="tnum">{report.facts}</span>
                </ReportRow>
                {report.disputes > 0 && (
                  <ReportRow icon={<Scale className="h-[18px] w-[18px]" />} label={c.disputes}>
                    <Chip tone="dispute">{report.disputes}</Chip>
                  </ReportRow>
                )}
              </Card>
              {report.leases === 0 && report.facts === 0 && (
                <p className="mt-2 text-center text-[12.5px] text-ink-faint">{c.noData}</p>
              )}
              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-ink-faint">
                <Lock className="mt-0.5 h-3 w-3 shrink-0" /> {c.fcraNote}
              </p>
            </>
          ) : !isSelf ? (
            /* Gated — consent flow */
            <Card className="mt-6 p-4">
              {status === "pending" ? (
                <div className="flex items-start gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-tint text-amber">
                    <Clock className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <div className="text-[14px] font-bold text-ink">{c.pendingTitle}</div>
                    <p className="mt-1 text-[13px] leading-snug text-ink-soft">{c.pendingBody}</p>
                  </div>
                </div>
              ) : status === "declined" ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-danger-tint text-danger">
                      <Lock className="h-[18px] w-[18px]" />
                    </span>
                    <div>
                      <div className="text-[14px] font-bold text-ink">{c.declinedTitle}</div>
                      <p className="mt-1 text-[13px] leading-snug text-ink-soft">{c.declinedBody}</p>
                    </div>
                  </div>
                  <Button
                    full
                    className="mt-3"
                    disabled={busy}
                    onClick={handleRequest}
                    icon={busy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Send className="h-[18px] w-[18px]" />}
                  >
                    {busy ? c.requesting : c.requestAgain}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                      <Lock className="h-[18px] w-[18px]" />
                    </span>
                    <div>
                      <div className="text-[14px] font-bold text-ink">{c.gatedTitle}</div>
                      <p className="mt-1 text-[13px] leading-snug text-ink-soft">{c.gatedBody}</p>
                    </div>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={c.msgPh}
                    rows={2}
                    className="mt-3 w-full resize-none rounded-xl border-[1.5px] border-line-strong bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-tint"
                  />
                  <Button
                    full
                    className="mt-3"
                    disabled={busy}
                    onClick={handleRequest}
                    icon={busy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Send className="h-[18px] w-[18px]" />}
                  >
                    {busy ? c.requesting : c.requestBtn}
                  </Button>
                </>
              )}
            </Card>
          ) : null}

          {/* Message action */}
          {!isSelf && (
            <div className="mt-4">
              <Button href="/messages/new" variant="ghost" full icon={<Send className="h-[18px] w-[18px]" />}>
                {c.message}
              </Button>
            </div>
          )}
        </Screen>
      </PageFade>
    </>
  );
}

function ReportRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">{icon}</span>
      <span className="flex-1 text-[14px] text-ink-soft">{label}</span>
      <span className="text-[15px] font-semibold text-ink">{children}</span>
    </div>
  );
}
