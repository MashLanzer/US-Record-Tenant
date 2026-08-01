"use client";

import { useEffect, useState } from "react";
import { MapPin, Scale, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { US_JURISDICTIONS } from "@/lib/legal";
import { FEDERAL_BASELINE, getStateRule } from "@/lib/state-laws";

const copy = {
  en: {
    title: "Screening rules",
    intro: "Tenant-screening law varies by state and city. These are notable statewide rules for the jurisdiction you select — always confirm local (city/county) rules too.",
    pick: "Jurisdiction",
    stateRules: "State rules",
    federal: "Applies everywhere (federal)",
    none: "No notable statewide screening protections beyond the federal baseline. Check your city and county rules.",
    disclaimer: "Not legal advice, not exhaustive, and subject to change. Verify with an attorney and current local law.",
  },
  es: {
    title: "Reglas de screening",
    intro: "La ley de screening de inquilinos varía por estado y ciudad. Estas son reglas estatales notables para la jurisdicción que elijas — confirma siempre también las reglas locales (ciudad/condado).",
    pick: "Jurisdicción",
    stateRules: "Reglas del estado",
    federal: "Aplica en todas partes (federal)",
    none: "No hay protecciones estatales notables más allá de la base federal. Revisa las reglas de tu ciudad y condado.",
    disclaimer: "No es asesoría legal, no es exhaustivo y puede cambiar. Verifica con un abogado y la ley local vigente.",
  },
};

export default function StateRulesScreen() {
  const c = useT(copy);
  const { locale } = useLocale();
  const { profile } = useAuth();
  const [code, setCode] = useState("");

  useEffect(() => {
    if (profile?.jurisdiction) setCode(profile.jurisdiction);
  }, [profile]);

  const rule = getStateRule(code);
  const stateName = US_JURISDICTIONS.find((s) => s.code === code)?.name ?? "";
  const stateItems = rule ? (locale === "es" ? rule.es : rule.en) : [];
  const federalItems = locale === "es" ? FEDERAL_BASELINE.es : FEDERAL_BASELINE.en;

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <p className="text-[13.5px] leading-snug text-ink-soft">{c.intro}</p>

          <div className="mb-1.5 mt-5 text-[12.5px] font-semibold text-ink-soft">{c.pick}</div>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint" />
            <select
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-xl border-[1.5px] border-line-strong bg-surface-2 py-3 pl-11 pr-3.5 text-[15px] text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-tint"
            >
              <option value="">—</option>
              {US_JURISDICTIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {code && (
            <>
              <div className="mb-2.5 mt-6 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
                <Scale className="h-3.5 w-3.5" /> {c.stateRules} · {stateName}
              </div>
              <Card className="p-4">
                {stateItems.length > 0 ? (
                  <ul className="space-y-2.5">
                    {stateItems.map((t, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-soft">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        {t}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] leading-snug text-ink-faint">{c.none}</p>
                )}
              </Card>
            </>
          )}

          <div className="mb-2.5 mt-6 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
            <ShieldCheck className="h-3.5 w-3.5" /> {c.federal}
          </div>
          <Card className="p-4">
            <ul className="space-y-2.5">
              {federalItems.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-soft">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-verify" />
                  {t}
                </li>
              ))}
            </ul>
          </Card>

          <p className="mt-4 text-[11px] leading-snug text-ink-faint">{c.disclaimer}</p>
        </Screen>
      </PageFade>
    </>
  );
}
