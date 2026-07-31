"use client";

import Link from "next/link";
import {
  Home,
  MapPin,
  ShieldCheck,
  FileText,
  Flag,
  ChevronRight,
  CircleDollarSign,
  CalendarRange,
  Landmark,
  BadgeCheck,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Button, Chip, Avatar } from "@/components/ui/primitives";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { properties, landlordMe } from "@/lib/mock";

const copy = {
  en: {
    map: "Map",
    verifiedLandlord: "Verified landlord",
    contract: "Contract",
    rent: "Rent",
    perMonth: "/mo",
    leaseTerm: "Lease term",
    termValue: "12 months · renews Jan 2025",
    deposit: "Deposit",
    status: "Status",
    active: "Active",
    documents: "Documents",
    lease: "Lease agreement.pdf",
    leaseMeta: "Signed · 8 pages",
    inspection: "Move-in inspection.pdf",
    inspectionMeta: "Signed · 3 pages",
    viewLease: "View lease",
    report: "Report a fact",
  },
  es: {
    map: "Mapa",
    verifiedLandlord: "Propietario verificado",
    contract: "Contrato",
    rent: "Renta",
    perMonth: "/mes",
    leaseTerm: "Plazo del contrato",
    termValue: "12 meses · renueva ene 2025",
    deposit: "Depósito",
    status: "Estado",
    active: "Activo",
    documents: "Documentos",
    lease: "Contrato de arrendamiento.pdf",
    leaseMeta: "Firmado · 8 páginas",
    inspection: "Inspección de entrada.pdf",
    inspectionMeta: "Firmado · 3 páginas",
    viewLease: "Ver contrato",
    report: "Reportar un hecho",
  },
};

export default function PropertyScreen() {
  const c = useT(copy);
  const g = useT(common);
  const p = properties[0];
  const deposit = p.rent * 2;

  const rows = [
    {
      icon: <CircleDollarSign className="h-[18px] w-[18px]" />,
      label: c.rent,
      value: (
        <span className="tnum">
          ${p.rent.toLocaleString()}
          <span className="text-ink-faint">{c.perMonth}</span>
        </span>
      ),
    },
    { icon: <CalendarRange className="h-[18px] w-[18px]" />, label: c.leaseTerm, value: c.termValue },
    {
      icon: <Landmark className="h-[18px] w-[18px]" />,
      label: c.deposit,
      value: <span className="tnum">${deposit.toLocaleString()}</span>,
    },
    {
      icon: <BadgeCheck className="h-[18px] w-[18px]" />,
      label: c.status,
      value: <Chip tone="verify">{c.active}</Chip>,
    },
  ];

  const docs = [
    { title: c.lease, meta: c.leaseMeta },
    { title: c.inspection, meta: c.inspectionMeta },
  ];

  return (
    <>
      <AppHeader title={p.address} back />
      <PageFade>
        <Screen>
          {/* Hero */}
          <Card className="overflow-hidden p-0">
            <div className="relative h-36 bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))]">
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <Home className="h-8 w-8 text-white" />
                </span>
              </div>
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5" /> {p.city}
              </span>
              <span className="absolute right-3 top-3 rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90">
                {c.map}
              </span>
            </div>
            <div className="p-4">
              <div className="text-[16px] font-bold text-ink">{p.address}</div>
              <div className="mt-0.5 text-[13px] text-ink-faint">{p.city}</div>
            </div>
          </Card>

          {/* Verified landlord */}
          <Card className="mt-3 flex items-center gap-3 p-3.5">
            <Avatar initials={landlordMe.initials} size={44} verified />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                {c.verifiedLandlord}
              </div>
              <div className="text-[15px] font-bold text-ink">{landlordMe.name}</div>
            </div>
            <Chip tone="verify" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
              {g.status.verified}
            </Chip>
          </Card>

          {/* Contract data */}
          <div className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
            {c.contract}
          </div>
          <Card className="divide-y divide-line p-0">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center gap-3 px-4 py-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                  {r.icon}
                </span>
                <span className="text-[14px] text-ink-soft">{r.label}</span>
                <span className="ml-auto text-[15px] font-semibold text-ink">{r.value}</span>
              </div>
            ))}
          </Card>

          {/* Documents */}
          <div className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
            {c.documents}
          </div>
          <Card className="p-0">
            <Stagger className="divide-y divide-line">
              {docs.map((d) => (
                <StaggerItem key={d.title}>
                  <Link href="/documents" className="flex items-center gap-3 px-4 py-3.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-semibold text-ink">{d.title}</div>
                      <div className="truncate text-[13px] text-ink-faint">{d.meta}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-ink-ghost" />
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </Card>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <Button href="/documents" full icon={<FileText className="h-[18px] w-[18px]" />}>
              {c.viewLease}
            </Button>
            <Button href="/report" variant="ghost" full icon={<Flag className="h-[18px] w-[18px]" />}>
              {c.report}
            </Button>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
