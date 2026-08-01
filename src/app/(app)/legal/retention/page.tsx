"use client";

import Link from "next/link";
import { Clock, ShieldCheck, Download, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { RETENTION } from "@/lib/retention";

const copy = {
  en: {
    title: "Data retention",
    intro: "How long we keep each kind of data, and when it's deleted. Transient data is removed automatically; your durable records stay until you delete your account.",
    keep: "Kept",
    hold: "Legal hold",
    holdBody: "Information that is part of an open dispute or legal claim is preserved and not auto-deleted, even past its normal window, until the matter is resolved.",
    rights: "Your data rights",
    export: "Export my data",
    del: "Delete my account",
    disclaimer: "This schedule is provided for transparency and may change. It is not legal advice.",
  },
  es: {
    title: "Retención de datos",
    intro: "Cuánto tiempo guardamos cada tipo de dato y cuándo se elimina. Los datos transitorios se borran automáticamente; tus registros duraderos permanecen hasta que elimines tu cuenta.",
    keep: "Se guarda",
    hold: "Retención legal",
    holdBody: "La información que es parte de una disputa abierta o reclamo legal se preserva y no se elimina automáticamente, incluso pasado su plazo normal, hasta que el asunto se resuelva.",
    rights: "Tus derechos sobre los datos",
    export: "Exportar mis datos",
    del: "Eliminar mi cuenta",
    disclaimer: "Este calendario se ofrece por transparencia y puede cambiar. No es asesoría legal.",
  },
};

export default function RetentionScreen() {
  const c = useT(copy);
  const { locale } = useLocale();

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <p className="text-[13.5px] leading-snug text-ink-soft">{c.intro}</p>

          <Card className="mt-4 divide-y divide-line p-0">
            {RETENTION.map((r) => {
              const row = locale === "es" ? r.es : r.en;
              return (
                <div key={r.key} className="flex items-start gap-3 px-4 py-3.5">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-ink">{row.data}</div>
                    <div className="text-[12px] text-ink-faint">{row.basis}</div>
                  </div>
                  <span className="shrink-0 text-right text-[12.5px] font-bold text-ink-soft">
                    {row.keep}
                  </span>
                </div>
              );
            })}
          </Card>

          {/* Legal hold */}
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-amber/30 bg-amber-tint p-3.5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
            <div>
              <div className="text-[13.5px] font-bold text-amber">{c.hold}</div>
              <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">{c.holdBody}</p>
            </div>
          </div>

          {/* Rights shortcuts */}
          <div className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">{c.rights}</div>
          <Card className="divide-y divide-line p-0">
            <Link href="/settings" className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                <Download className="h-[18px] w-[18px]" />
              </span>
              <span className="flex-1 text-[14px] font-semibold text-ink">{c.export}</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-danger-tint text-danger">
                <Trash2 className="h-[18px] w-[18px]" />
              </span>
              <span className="flex-1 text-[14px] font-semibold text-danger">{c.del}</span>
            </Link>
          </Card>

          <p className="mt-4 text-[11px] leading-snug text-ink-faint">{c.disclaimer}</p>
        </Screen>
      </PageFade>
    </>
  );
}
