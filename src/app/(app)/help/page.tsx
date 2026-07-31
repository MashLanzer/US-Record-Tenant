"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Rocket,
  ShieldCheck,
  Scale,
  CreditCard,
  ChevronDown,
  MessageSquare,
  Heart,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Input, Button } from "@/components/ui/primitives";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT } from "@/lib/i18n";

const copy = {
  en: {
    title: "Help & support",
    placeholder: "Search help articles",
    reassure: "There's a real person behind this. We usually reply within an hour.",
    catGettingStarted: "Getting started",
    catVerification: "Verification",
    catDisputes: "Disputes",
    catPayments: "Payments",
    faqTitle: "Frequently asked",
    faq: [
      {
        q: "How is my trust score calculated?",
        a: "Your score reflects bank-verified payments, care of the property, communication, and contract compliance. Every factor is transparent and evidence-based.",
      },
      {
        q: "Who can see my record?",
        a: "Only people you grant access to, and only with a permissible purpose. You can see every access under Your dossier.",
      },
      {
        q: "How do I dispute something?",
        a: "Open the record, tap Dispute, and add evidence. The other party is notified and can respond — it's always a two-way, fair process.",
      },
      {
        q: "Does verification cost anything?",
        a: "No. Verifying your identity and record is free, and your verified record stays yours forever.",
      },
    ],
    chat: "Chat with support",
    ticket: "Submit a ticket",
  },
  es: {
    title: "Ayuda y soporte",
    placeholder: "Busca artículos de ayuda",
    reassure: "Hay una persona real detrás de esto. Solemos responder en menos de una hora.",
    catGettingStarted: "Primeros pasos",
    catVerification: "Verificación",
    catDisputes: "Disputas",
    catPayments: "Pagos",
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        q: "¿Cómo se calcula mi score de confianza?",
        a: "Tu score refleja pagos verificados por el banco, el cuidado de la propiedad, la comunicación y el cumplimiento del contrato. Cada factor es transparente y basado en evidencia.",
      },
      {
        q: "¿Quién puede ver mi historial?",
        a: "Solo las personas a las que das acceso, y únicamente con un propósito permitido. Puedes ver cada acceso en Tu expediente.",
      },
      {
        q: "¿Cómo disputo algo?",
        a: "Abre el registro, toca Disputar y agrega evidencia. La otra parte es notificada y puede responder — siempre es un proceso justo de dos vías.",
      },
      {
        q: "¿La verificación tiene costo?",
        a: "No. Verificar tu identidad e historial es gratis, y tu historial verificado es tuyo para siempre.",
      },
    ],
    chat: "Chatear con soporte",
    ticket: "Enviar un ticket",
  },
};

export default function HelpScreen() {
  const c = useT(copy);
  const [open, setOpen] = useState<number | null>(0);

  const categories = [
    { label: c.catGettingStarted, icon: <Rocket className="h-5 w-5" />, tone: "bg-brand-tint text-brand" },
    { label: c.catVerification, icon: <ShieldCheck className="h-5 w-5" />, tone: "bg-verify-tint text-verify" },
    { label: c.catDisputes, icon: <Scale className="h-5 w-5" />, tone: "bg-amber-tint text-amber" },
    { label: c.catPayments, icon: <CreditCard className="h-5 w-5" />, tone: "bg-violet-tint text-violet" },
  ];

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          {/* Search */}
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
            <Input placeholder={c.placeholder} className="pl-11" />
          </div>

          {/* Reassurance */}
          <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-verify-tint px-3.5 py-3">
            <Heart className="h-[18px] w-[18px] shrink-0 text-verify" />
            <p className="text-[12.5px] font-medium leading-relaxed text-verify">{c.reassure}</p>
          </div>

          {/* Category tiles */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <Card key={cat.label} onClick={() => {}} className="p-4">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${cat.tone}`}>
                  {cat.icon}
                </span>
                <div className="mt-3 text-[14px] font-bold text-ink">{cat.label}</div>
              </Card>
            ))}
          </div>

          {/* FAQ accordion */}
          <h2 className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
            {c.faqTitle}
          </h2>
          <Card className="divide-y divide-line px-4">
            {c.faq.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className="py-1">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 py-3.5 text-left"
                  >
                    <span className="flex-1 text-[14.5px] font-semibold text-ink">{f.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-ink-faint transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <p className="pb-4 pr-7 text-[13.5px] leading-relaxed text-ink-soft">{f.a}</p>
                  )}
                </div>
              );
            })}
          </Card>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <Button href="/messages" full icon={<MessageSquare className="h-[18px] w-[18px]" />}>
              {c.chat}
            </Button>
            <Button href="/help" full variant="secondary">
              {c.ticket}
            </Button>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
