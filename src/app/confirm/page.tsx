"use client";

import { useState } from "react";
import { Check, MapPin, Calendar, DollarSign, Link2, ShieldCheck, Home } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Card, Button, Avatar } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";

const copy = {
  en: {
    title: "Confirm this relationship",
    subtitle: "Both of you verify the same facts. This protects each party equally.",
    you: "You",
    counterparty: "David C.",
    landlord: "Landlord",
    tenant: "Tenant",
    detailsTitle: "Rental details",
    address: "742 Ocean Ave, Apt 4B",
    city: "Brooklyn, NY",
    datesLabel: "Term",
    dates: "Jan 2023 – present",
    rentLabel: "Rent",
    rent: "$2,400/mo",
    reassure: "When you both confirm, this becomes a verified fact on each of your records — tamper-proof and mutually agreed.",
    confirm: "Confirm relationship",
    reject: "I don't recognize this",
    successTitle: "Relationship confirmed",
    successSub: "Added to both records. Either party can attach evidence anytime.",
    goHome: "Go to home",
  },
  es: {
    title: "Confirma esta relación",
    subtitle: "Ambos verifican los mismos hechos. Esto protege a cada parte por igual.",
    you: "Tú",
    counterparty: "David C.",
    landlord: "Propietario",
    tenant: "Inquilino",
    detailsTitle: "Detalles del alquiler",
    address: "742 Ocean Ave, Apt 4B",
    city: "Brooklyn, NY",
    datesLabel: "Periodo",
    dates: "Ene 2023 – presente",
    rentLabel: "Renta",
    rent: "$2,400/mes",
    reassure: "Cuando ambos confirman, se convierte en un hecho verificado en el historial de cada uno — a prueba de manipulación y mutuamente acordado.",
    confirm: "Confirmar relación",
    reject: "No reconozco esto",
    successTitle: "Relación confirmada",
    successSub: "Agregada a ambos historiales. Cualquier parte puede adjuntar evidencia en cualquier momento.",
    goHome: "Ir al inicio",
  },
};

export default function ConfirmScreen() {
  const c = useT(copy);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <AuthShell showLogo>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-verify text-white shadow-[0_12px_30px_rgba(22,163,74,.4)]">
            <Check className="h-10 w-10" strokeWidth={3} />
          </div>
          <h1 className="mt-6 text-[24px] font-extrabold tracking-tight text-ink">{c.successTitle}</h1>
          <p className="mt-2 max-w-[300px] text-[14px] leading-relaxed text-ink-faint">{c.successSub}</p>

          <div className="mt-8 flex items-center gap-4">
            <Avatar initials="MR" size={56} verified />
            <span className="grid h-8 w-8 place-items-center rounded-full bg-verify-tint text-verify">
              <Link2 className="h-4 w-4" />
            </span>
            <Avatar initials="DC" size={56} verified />
          </div>
        </div>

        <div className="mt-auto pt-8">
          <Button href="/home" full size="lg" icon={<Home className="h-[18px] w-[18px]" />}>
            {c.goHome}
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell showLogo>
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{c.title}</h1>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-faint">{c.subtitle}</p>
      </div>

      {/* Two parties with connector */}
      <div className="mt-7 flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-2">
          <Avatar initials="MR" size={64} verified />
          <div className="text-center">
            <div className="text-[14px] font-bold text-ink">{c.you}</div>
            <div className="text-[12px] text-ink-faint">{c.tenant}</div>
          </div>
        </div>

        <span className="mb-8 grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-brand shadow-[var(--shadow-1)]">
          <Link2 className="h-4 w-4" />
        </span>

        <div className="flex flex-col items-center gap-2">
          <Avatar initials="DC" size={64} verified />
          <div className="text-center">
            <div className="text-[14px] font-bold text-ink">{c.counterparty}</div>
            <div className="text-[12px] text-ink-faint">{c.landlord}</div>
          </div>
        </div>
      </div>

      {/* Contract details */}
      <Card className="mt-6 p-1">
        <h2 className="px-4 pb-1 pt-3.5 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
          {c.detailsTitle}
        </h2>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
            <MapPin className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <div className="text-[14.5px] font-semibold text-ink">{c.address}</div>
            <div className="text-[12.5px] text-ink-faint">{c.city}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-line px-4 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-3 text-ink-soft">
            <Calendar className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] text-ink-faint">{c.datesLabel}</div>
            <div className="text-[14.5px] font-semibold text-ink">{c.dates}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-line px-4 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-3 text-ink-soft">
            <DollarSign className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] text-ink-faint">{c.rentLabel}</div>
            <div className="text-[14.5px] font-semibold text-ink tnum">{c.rent}</div>
          </div>
        </div>
      </Card>

      {/* Reassurance */}
      <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-verify-tint/40 px-4 py-3.5">
        <ShieldCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-verify" />
        <p className="text-[13px] leading-relaxed text-ink-soft">{c.reassure}</p>
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pt-8">
        <Button onClick={() => setConfirmed(true)} full size="lg" icon={<Check className="h-[18px] w-[18px]" strokeWidth={2.6} />}>
          {c.confirm}
        </Button>
        <Button href="/home" full variant="ghost">
          {c.reject}
        </Button>
      </div>
    </AuthShell>
  );
}
