"use client";

import { useEffect, useState } from "react";
import { FileCheck2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Skeleton } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { fetchMyConsents, type ConsentRecord } from "@/lib/data";

const copy = {
  en: {
    title: "My consents",
    intro: "A record of every agreement you've accepted, with its version and date. This log is immutable.",
    empty: "No consents recorded yet.",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    fcra: "FCRA Notice",
    version: "Version",
  },
  es: {
    title: "Mis consentimientos",
    intro: "El registro de cada acuerdo que has aceptado, con su versión y fecha. Este registro es inmutable.",
    empty: "Aún no hay consentimientos registrados.",
    terms: "Términos del servicio",
    privacy: "Política de privacidad",
    fcra: "Aviso FCRA",
    version: "Versión",
  },
};

export default function ConsentsScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const { user } = useAuth();
  const [items, setItems] = useState<ConsentRecord[] | null>(null);

  useEffect(() => {
    if (user) fetchMyConsents(user.id).then(setItems);
  }, [user]);

  const label = (doc: string) => (doc === "terms" ? c.terms : doc === "privacy" ? c.privacy : c.fcra);
  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(locale === "es" ? "es" : "en", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <p className="text-[13.5px] leading-snug text-ink-soft">{c.intro}</p>

          {items === null ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : items.length === 0 ? (
            <p className="mt-8 text-center text-[14px] text-ink-faint">{c.empty}</p>
          ) : (
            <Card className="mt-4 divide-y divide-line p-0">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-verify-tint text-verify">
                    <FileCheck2 className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-ink">{label(it.document)}</div>
                    <div className="text-[12px] text-ink-faint">
                      {c.version} {it.version} · {fmt(it.acceptedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </Screen>
      </PageFade>
    </>
  );
}
