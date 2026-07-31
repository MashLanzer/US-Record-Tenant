"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldQuestion, MessageSquare, Send } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { AppHeader } from "@/components/app-header";
import { Avatar, Card, Chip, Button, Skeleton } from "@/components/ui/primitives";
import { TrustRing } from "@/components/ui/trust";
import { PageFade } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { useAuth } from "@/lib/auth";
import { fetchPublicProfile, recordProfileView, type PublicProfileData } from "@/lib/data";

const copy = {
  en: {
    title: "Trust profile",
    verified: "Identity verified",
    unverified: "Unverified",
    indexLabel: "Trust Index",
    memberSince: "Member since",
    message: "Message",
    request: "Request rental",
    notFound: "Profile not found",
  },
  es: {
    title: "Perfil de confianza",
    verified: "Identidad verificada",
    unverified: "Sin verificar",
    indexLabel: "Índice de confianza",
    memberSince: "Miembro desde",
    message: "Mensaje",
    request: "Solicitar alquiler",
    notFound: "Perfil no encontrado",
  },
};

export default function PublicTrustScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();
  const { user } = useAuth();

  const [profile, setProfile] = useState<PublicProfileData | null | undefined>(undefined);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") ?? "";
    let alive = true;
    fetchPublicProfile(id).then((p) => alive && setProfile(p));
    // Transparency: record that the current user looked at this profile.
    if (user && id && id !== user.id) {
      void recordProfileView(user.id, id);
    }
    return () => {
      alive = false;
    };
  }, [user]);

  if (profile === undefined) {
    return (
      <>
        <AppHeader title={c.title} back />
        <PageFade>
          <Screen>
            <div className="flex flex-col items-center pt-4">
              <Skeleton className="h-[72px] w-[72px] rounded-[28%]" />
              <Skeleton className="mt-3 h-6 w-40 rounded-full" />
              <Skeleton className="mt-2 h-6 w-32 rounded-full" />
            </div>
            <Skeleton className="mt-5 h-64 w-full rounded-2xl" />
            <Skeleton className="mt-6 h-12 w-full rounded-xl" />
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

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            <Button href="/messages/new" full icon={<Send className="h-[18px] w-[18px]" />}>
              {c.message}
            </Button>
            <Button variant="ghost" full icon={<MessageSquare className="h-[18px] w-[18px]" />}>
              {c.request}
            </Button>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
