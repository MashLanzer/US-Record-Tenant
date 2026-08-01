"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  ShieldCheck,
  Plus,
  Sparkles,
  CreditCard,
  MessageSquare,
  UserPlus,
  Check,
} from "lucide-react";
import { Screen } from "@/components/app-shell";
import { SectionTitle } from "@/components/app-header";
import { Avatar, Card, StatCard, Button } from "@/components/ui/primitives";
import { TrustRing } from "@/components/ui/trust";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { useAuth } from "@/lib/auth";
import {
  fetchStats,
  fetchNotifications,
  describeNotification,
  trustLabel,
  fetchIncomingInvitations,
  acceptInvitation,
  declineInvitation,
  type StatsData,
  type NotificationItem,
  type Invitation,
} from "@/lib/data";
import { displayName, displayInitials } from "@/lib/identity";

const copy = {
  en: {
    greeting: "Welcome",
    yourScore: "YOUR TRUST INDEX",
    rentals: "Rentals",
    onTime: "On-time",
    activity: "Recent activity",
    addContract: "Add contract",
    noActivity: "No activity yet. Add a contract to get started.",
    inviteTitle: "You've been invited",
    inviteBy: "invites you to a rental",
    accept: "Accept",
    decline: "Decline",
  },
  es: {
    greeting: "Bienvenido",
    yourScore: "TU ÍNDICE DE CONFIANZA",
    rentals: "Alquileres",
    onTime: "Pagos ok",
    activity: "Actividad reciente",
    addContract: "Añadir contrato",
    noActivity: "Aún no hay actividad. Añade un contrato para empezar.",
    inviteTitle: "Te invitaron",
    inviteBy: "te invita a un alquiler",
    accept: "Aceptar",
    decline: "Rechazar",
  },
};

function iconFor(type: string) {
  switch (type) {
    case "payment_recorded":
      return <CreditCard className="h-5 w-5" />;
    case "message":
      return <MessageSquare className="h-5 w-5" />;
    case "welcome":
      return <Sparkles className="h-5 w-5" />;
    default:
      return <ShieldCheck className="h-5 w-5" />;
  }
}

export default function HomeScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();
  const { profile, user } = useAuth();

  const [stats, setStats] = useState<StatsData | null>(null);
  const [notifs, setNotifs] = useState<NotificationItem[] | null>(null);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [busyInvite, setBusyInvite] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchStats(user.id, locale).then((s) => alive && setStats(s));
    fetchNotifications(user.id).then((n) => alive && setNotifs(n));
    fetchIncomingInvitations(user.email ?? "").then((i) => alive && setInvites(i));
    return () => {
      alive = false;
    };
  }, [user, locale]);

  async function respondInvite(inv: Invitation, accept: boolean) {
    if (busyInvite) return;
    setBusyInvite(inv.id);
    try {
      if (accept) await acceptInvitation(inv.id);
      else await declineInvitation(inv.id);
      setInvites((prev) => prev.filter((x) => x.id !== inv.id));
      if (user && accept) fetchStats(user.id, locale).then(setStats);
    } catch {
      /* ignore */
    } finally {
      setBusyInvite(null);
    }
  }

  const name = displayName(profile, user?.email, locale);
  const initials = displayInitials(profile, user?.email);
  const score = profile?.trust_score ?? 70;
  const ratingLabel = trustLabel(score, locale);
  const unread = (notifs ?? []).filter((n) => !n.read).length;
  const recent = (notifs ?? []).slice(0, 3);

  return (
    <PageFade>
      <Screen>
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[13px] text-ink-faint">{c.greeting}</p>
            <h1 className="truncate text-[26px] font-extrabold tracking-tight text-ink">{name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="relative grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface text-ink-soft"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-surface bg-brand" />
              )}
            </Link>
            <Link href="/profile" aria-label="Profile">
              <Avatar initials={initials} size={44} verified={!!profile?.identity_verified} />
            </Link>
          </div>
        </div>

        {/* Incoming invitations */}
        {invites.map((inv) => (
          <Card key={inv.id} className="mt-4 border-brand/30 bg-brand-tint p-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white">
                <UserPlus className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold text-ink">{c.inviteTitle}</div>
                <div className="truncate text-[12.5px] text-ink-soft">
                  {inv.inviterName} {c.inviteBy} · {inv.address}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                full
                size="sm"
                disabled={busyInvite === inv.id}
                onClick={() => respondInvite(inv, true)}
                icon={<Check className="h-4 w-4" />}
              >
                {c.accept}
              </Button>
              <Button
                full
                size="sm"
                variant="secondary"
                disabled={busyInvite === inv.id}
                onClick={() => respondInvite(inv, false)}
              >
                {c.decline}
              </Button>
            </div>
          </Card>
        ))}

        {/* Trust score hero card */}
        <Link href="/reputation" className="mt-4 block">
          <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] p-5">
            <div className="flex items-center gap-4">
              <TrustRing score={score} size={92} tone="white" onDark label="" />
              <div className="min-w-0 text-white">
                <div className="text-[10px] font-semibold opacity-85">{c.yourScore}</div>
                <div className="mt-0.5 text-[13px] opacity-95">{ratingLabel}</div>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-white/70" />
            </div>
          </Card>
        </Link>

        {/* KPIs */}
        <div className="mt-3 flex gap-3">
          <StatCard label={c.rentals} value={stats ? String(stats.rentals) : "—"} />
          <StatCard
            label={c.onTime}
            value={stats && stats.rentals > 0 ? `${stats.onTimeRate}%` : "—"}
            tone="verify"
          />
        </div>

        {/* Activity */}
        <SectionTitle
          action={
            <Link href="/notifications" className="text-[13px] font-semibold text-brand">
              {g.actions.seeAll}
            </Link>
          }
        >
          {c.activity}
        </SectionTitle>
        <Card className="p-2">
          {recent.length === 0 ? (
            <p className="px-3 py-4 text-center text-[13px] text-ink-faint">{c.noActivity}</p>
          ) : (
            <Stagger>
              {recent.map((n) => {
                const d = describeNotification(n, locale);
                const toneCls =
                  d.tone === "verify"
                    ? "bg-verify-tint text-verify"
                    : d.tone === "amber"
                      ? "bg-amber-tint text-amber"
                      : "bg-brand-tint text-brand";
                return (
                  <StaggerItem key={n.id}>
                    <div className="flex items-center gap-3 rounded-xl p-2">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneCls}`}>
                        {iconFor(n.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-semibold text-ink">{d.title}</div>
                        {d.desc && <div className="truncate text-[12px] text-ink-faint">{d.desc}</div>}
                      </div>
                      <span className="text-[12px] text-ink-faint">{n.timeLabel}</span>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </Card>

        {/* Primary action */}
        <div className="mt-5">
          <Button href="/rentals/new" full icon={<Plus className="h-[18px] w-[18px]" />}>
            {c.addContract}
          </Button>
        </div>
      </Screen>
    </PageFade>
  );
}
