"use client";

import {
  Camera,
  Images,
  FileUp,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Button, Card, Chip } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";

const copy = {
  en: {
    title: "Upload evidence",
    dropTitle: "Add a receipt, photo or document",
    dropHint: "Every file is checked for authenticity before it's attached.",
    takePhoto: "Take photo",
    gallery: "Choose from gallery",
    file: "Choose file",
    filesLabel: "Files",
    verified: "Authentic · verified by AI",
    checking: "Checking authenticity…",
    attach: "Attach",
    reassure: "Files stay private until you attach them to a record.",
  },
  es: {
    title: "Subir evidencia",
    dropTitle: "Agrega un recibo, foto o documento",
    dropHint: "Cada archivo se revisa por autenticidad antes de adjuntarse.",
    takePhoto: "Tomar foto",
    gallery: "Elegir de la galería",
    file: "Elegir archivo",
    filesLabel: "Archivos",
    verified: "Auténtico · verificado por IA",
    checking: "Verificando autenticidad…",
    attach: "Adjuntar",
    reassure: "Los archivos son privados hasta que los adjuntas a un registro.",
  },
};

const FILES = [
  { name: "lease_agreement.pdf", size: "1.2 MB", progress: 100, verified: true },
  { name: "rent_receipt_sep.jpg", size: "480 KB", progress: 64, verified: false },
];

export default function EvidenceScreen() {
  const c = useT(copy);

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Dropzone */}
          <Card className="border-[1.5px] border-dashed border-line-strong bg-surface-2 p-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--brand-tint-2),var(--violet-tint))] text-brand">
              <FileUp className="h-7 w-7" />
            </span>
            <div className="mt-3.5 text-[16px] font-bold text-ink">{c.dropTitle}</div>
            <div className="mt-1 text-[13px] text-ink-faint">{c.dropHint}</div>

            <div className="mt-5 grid gap-2.5">
              <Button variant="secondary" full icon={<Camera className="h-[18px] w-[18px]" />}>
                {c.takePhoto}
              </Button>
              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="secondary" icon={<Images className="h-[18px] w-[18px]" />}>
                  {c.gallery}
                </Button>
                <Button variant="secondary" icon={<FileUp className="h-[18px] w-[18px]" />}>
                  {c.file}
                </Button>
              </div>
            </div>
          </Card>

          {/* File list */}
          <h2 className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
            {c.filesLabel}
          </h2>
          <Card className="divide-y divide-line p-2">
            {FILES.map((f) => (
              <div key={f.name} className="flex items-center gap-3 p-2">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                  <FileText className="h-[22px] w-[22px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-[13px] font-medium text-ink">
                      {f.name}
                    </span>
                    <span className="shrink-0 text-[12px] text-ink-faint tnum">{f.size}</span>
                  </div>
                  {f.verified ? (
                    <div className="mt-1.5">
                      <Chip tone="verify" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                        {c.verified}
                      </Chip>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                        <div
                          className="h-full rounded-full bg-brand-600 transition-all"
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-faint">
                        <Sparkles className="h-3.5 w-3.5 text-brand" />
                        {c.checking}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Card>

          <p className="mt-4 text-center text-[12.5px] text-ink-faint">{c.reassure}</p>

          {/* Attach */}
          <div className="mt-5">
            <Button full size="lg">
              {c.attach}
            </Button>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
