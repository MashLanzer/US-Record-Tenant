"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Upload, ShieldCheck, ExternalLink } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Button, Skeleton, Chip } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { listDocuments, uploadDocument, getDocumentUrl, type DocItem } from "@/lib/data";

const copy = {
  en: {
    title: "Documents",
    subtitle: "Contracts, receipts and evidence — securely stored.",
    upload: "Upload document",
    uploading: "Uploading…",
    emptyTitle: "No documents yet",
    emptyDesc: "Upload a lease, receipt or any document. Files are private and encrypted.",
    integrity: "Files are stored privately. Only you can open them.",
    open: "Open",
    demo: "Demo mode — connect a real account to upload files.",
    kindLease: "Lease",
    kindEvidence: "Evidence",
    kindDoc: "Document",
  },
  es: {
    title: "Documentos",
    subtitle: "Contratos, recibos y evidencias — guardados de forma segura.",
    upload: "Subir documento",
    uploading: "Subiendo…",
    emptyTitle: "Aún no hay documentos",
    emptyDesc: "Sube un contrato, recibo o cualquier documento. Los archivos son privados y cifrados.",
    integrity: "Los archivos se guardan de forma privada. Solo tú puedes abrirlos.",
    open: "Abrir",
    demo: "Modo demo — conecta una cuenta real para subir archivos.",
    kindLease: "Contrato",
    kindEvidence: "Evidencia",
    kindDoc: "Documento",
  },
};

export default function DocumentsScreen() {
  const c = useT(copy);
  const { user, demoMode } = useAuth();
  const [docs, setDocs] = useState<DocItem[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    if (!user) return;
    setDocs(await listDocuments(user.id));
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
      for (const file of Array.from(files)) {
        await uploadDocument(user.id, file, "document");
      }
      await load();
    } catch {
      setNote(c.demo);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function open(doc: DocItem) {
    const url = await getDocumentUrl(doc.path);
    if (url) window.open(url, "_blank");
  }

  const kindLabel = (k: string) => (k === "lease" ? c.kindLease : k === "evidence" ? c.kindEvidence : c.kindDoc);

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <p className="text-[14px] text-ink-faint">{c.subtitle}</p>

          <input ref={fileRef} type="file" multiple className="hidden" onChange={onFiles} />
          <Button
            full
            className="mt-4"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            icon={<Upload className="h-[18px] w-[18px]" />}
          >
            {uploading ? c.uploading : c.upload}
          </Button>
          {note && <p className="mt-2 text-center text-[12.5px] font-medium text-amber">{note}</p>}

          {docs === null ? (
            <div className="mt-4 space-y-2">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={<FileText />} title={c.emptyTitle} description={c.emptyDesc} />
            </div>
          ) : (
            <>
              <Stagger className="mt-4 space-y-2">
                {docs.map((d) => (
                  <StaggerItem key={d.id}>
                    <Card onClick={() => open(d)} className="flex items-center gap-3 p-3.5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-semibold text-ink">{d.name}</div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <Chip tone={d.kind === "evidence" ? "verify" : "neutral"}>{kindLabel(d.kind)}</Chip>
                          <span className="text-[12px] text-ink-faint">{d.timeLabel}</span>
                        </div>
                      </div>
                      {d.path && <ExternalLink className="h-[18px] w-[18px] shrink-0 text-ink-ghost" />}
                    </Card>
                  </StaggerItem>
                ))}
              </Stagger>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-verify-tint px-3 py-2.5 text-[12.5px] font-medium text-verify">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                {c.integrity}
              </div>
            </>
          )}
        </Screen>
      </PageFade>
    </>
  );
}
