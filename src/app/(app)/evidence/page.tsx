"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, FileUp, ShieldCheck, UploadCloud, Check } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Button, Skeleton, Chip } from "@/components/ui/primitives";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { listDocuments, uploadDocument, getDocumentUrl, type DocItem } from "@/lib/data";

const copy = {
  en: {
    title: "Upload evidence",
    intro: "Attach a receipt, photo or document. This is what keeps every record fair and verifiable.",
    takePhoto: "Take photo",
    chooseFile: "Choose file",
    uploading: "Uploading…",
    uploaded: "Your evidence",
    authentic: "Stored · verified",
    demo: "Demo mode — connect a real account to upload evidence.",
    empty: "No evidence uploaded yet.",
  },
  es: {
    title: "Subir evidencia",
    intro: "Adjunta un recibo, foto o documento. Esto es lo que mantiene cada registro justo y verificable.",
    takePhoto: "Tomar foto",
    chooseFile: "Elegir archivo",
    uploading: "Subiendo…",
    uploaded: "Tu evidencia",
    authentic: "Guardado · verificado",
    demo: "Modo demo — conecta una cuenta real para subir evidencia.",
    empty: "Aún no hay evidencia subida.",
  },
};

export default function EvidenceScreen() {
  const c = useT(copy);
  const { user, demoMode } = useAuth();
  const [docs, setDocs] = useState<DocItem[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    if (!user) return;
    setDocs(await listDocuments(user.id, "evidence"));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;
    if (demoMode) {
      setNote(c.demo);
      return;
    }
    setUploading(true);
    setNote(null);
    try {
      for (const file of Array.from(files)) await uploadDocument(user.id, file, "evidence");
      await load();
    } catch {
      setNote(c.demo);
    } finally {
      setUploading(false);
      if (cameraRef.current) cameraRef.current.value = "";
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function open(doc: DocItem) {
    const url = await getDocumentUrl(doc.path);
    if (url) window.open(url, "_blank");
  }

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface-2 p-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
              <ShieldCheck className="h-[18px] w-[18px]" />
            </span>
            <p className="text-[13px] leading-snug text-ink-soft">{c.intro}</p>
          </div>

          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFiles} />
          <input ref={fileRef} type="file" multiple className="hidden" onChange={onFiles} />

          <Card className="mt-4 flex flex-col items-center gap-3 border-dashed p-6 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-tint text-brand">
              <UploadCloud className="h-6 w-6" />
            </span>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                full
                disabled={uploading}
                onClick={() => cameraRef.current?.click()}
                icon={<Camera className="h-[18px] w-[18px]" />}
              >
                {c.takePhoto}
              </Button>
              <Button
                full
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                icon={<FileUp className="h-[18px] w-[18px]" />}
              >
                {uploading ? c.uploading : c.chooseFile}
              </Button>
            </div>
            {note && <p className="text-[12.5px] font-medium text-amber">{note}</p>}
          </Card>

          <div className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
            {c.uploaded}
          </div>

          {docs === null ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : docs.length === 0 ? (
            <p className="px-1 text-[13px] text-ink-faint">{c.empty}</p>
          ) : (
            <Stagger className="space-y-2">
              {docs.map((d) => (
                <StaggerItem key={d.id}>
                  <Card onClick={() => open(d)} className="flex items-center gap-3 p-3.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-verify-tint text-verify">
                      <Check className="h-5 w-5" strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-semibold text-ink">{d.name}</div>
                      <div className="text-[12px] text-ink-faint">{d.timeLabel}</div>
                    </div>
                    <Chip tone="verify" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                      {c.authentic}
                    </Chip>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </Screen>
      </PageFade>
    </>
  );
}
