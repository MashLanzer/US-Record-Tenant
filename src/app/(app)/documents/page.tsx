"use client";

import { ShieldCheck, Download, Share2, ZoomIn } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Button } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";

const copy = {
  en: {
    title: "Lease agreement.pdf",
    docHeading: "Residential Lease Agreement",
    integrityTitle: "Authentic document · verified",
    integritySub: "Hash matches the sealed original. No edits detected.",
    hashLabel: "SHA-256",
    verifiedOn: "Verified Jan 12, 2023",
    download: "Download",
    share: "Share",
    zoom: "Zoom",
  },
  es: {
    title: "Contrato de arrendamiento.pdf",
    docHeading: "Contrato de Arrendamiento Residencial",
    integrityTitle: "Documento auténtico · verificado",
    integritySub: "El hash coincide con el original sellado. Sin ediciones detectadas.",
    hashLabel: "SHA-256",
    verifiedOn: "Verificado 12 ene 2023",
    download: "Descargar",
    share: "Compartir",
    zoom: "Ampliar",
  },
};

const HASH = "9f2c4a8b1e7d3f6091a2c5b4e8d70f1c";

export default function DocumentsScreen() {
  const c = useT(copy);

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Document preview */}
          <Card className="overflow-hidden p-4">
            <div className="mx-auto aspect-[3/4] w-full max-w-[360px] rounded-lg border border-line bg-surface-2 p-6 shadow-[var(--shadow-1)]">
              <div className="mb-5 h-4 w-3/5 rounded bg-surface-3" />
              <div className="text-[13px] font-bold text-ink-soft">{c.docHeading}</div>
              <div className="mt-5 space-y-2.5">
                {[
                  "w-full",
                  "w-full",
                  "w-11/12",
                  "w-full",
                  "w-4/5",
                ].map((w, i) => (
                  <div key={`a${i}`} className={`h-2 rounded bg-surface-3 ${w}`} />
                ))}
              </div>
              <div className="mt-6 space-y-2.5">
                {["w-full", "w-full", "w-3/4", "w-full", "w-2/3"].map((w, i) => (
                  <div key={`b${i}`} className={`h-2 rounded bg-surface-3 ${w}`} />
                ))}
              </div>
              <div className="mt-8 flex items-end justify-between">
                <div className="h-8 w-24 rounded bg-surface-3" />
                <div className="h-2 w-16 rounded bg-surface-3" />
              </div>
            </div>
          </Card>

          {/* Integrity badge */}
          <Card className="mt-4 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-verify-tint text-verify">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-ink">{c.integrityTitle}</div>
                <p className="mt-0.5 text-[13px] text-ink-soft">{c.integritySub}</p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-line bg-surface-2 px-3 py-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                {c.hashLabel}
              </div>
              <div className="mt-0.5 break-all font-mono text-[12px] text-ink-soft">{HASH}</div>
            </div>
            <div className="mt-2.5 text-[12px] text-ink-faint tnum">{c.verifiedOn}</div>
          </Card>

          {/* Action bar */}
          <div className="mt-6 flex gap-3">
            <Button full icon={<Download className="h-[18px] w-[18px]" />}>
              {c.download}
            </Button>
            <Button variant="secondary" icon={<Share2 className="h-[18px] w-[18px]" />} aria-label={c.share}>
              {c.share}
            </Button>
            <Button variant="secondary" icon={<ZoomIn className="h-[18px] w-[18px]" />} aria-label={c.zoom}>
              {c.zoom}
            </Button>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
