"use client";

import { useEffect, useState } from "react";
import {
  Home,
  MapPin,
  ShieldCheck,
  Flag,
  CircleDollarSign,
  CalendarRange,
  BadgeCheck,
  CreditCard,
  Plus,
  Check,
  Clock,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card, Button, Chip, Field, Input, SegmentedControl, Skeleton } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { useAuth } from "@/lib/auth";
import {
  fetchRentalById,
  fetchPayments,
  createPayment,
  formatMonthYear,
  type Rental,
  type PaymentItem,
} from "@/lib/data";

const copy = {
  en: {
    map: "Map",
    youManage: "You manage this property",
    youRent: "You rent this property",
    verified: "Verified",
    unverified: "Unverified",
    contract: "Contract",
    rent: "Rent",
    perMonth: "/mo",
    leaseTerm: "Lease term",
    status: "Status",
    active: "Active",
    past: "Past",
    payments: "Payments",
    onTimeRate: "on-time",
    noPayments: "No payments recorded yet.",
    record: "Record payment",
    onTime: "On time",
    late: "Late",
    amount: "Amount (USD)",
    dueDate: "Due date",
    save: "Save payment",
    saving: "Saving…",
    cancel: "Cancel",
    report: "Report a fact",
    notFound: "Rental not found.",
  },
  es: {
    map: "Mapa",
    youManage: "Administras esta propiedad",
    youRent: "Rentas esta propiedad",
    verified: "Verificado",
    unverified: "Sin verificar",
    contract: "Contrato",
    rent: "Renta",
    perMonth: "/mes",
    leaseTerm: "Plazo del contrato",
    status: "Estado",
    active: "Activo",
    past: "Pasado",
    payments: "Pagos",
    onTimeRate: "a tiempo",
    noPayments: "Aún no hay pagos registrados.",
    record: "Registrar pago",
    onTime: "A tiempo",
    late: "Tardío",
    amount: "Monto (USD)",
    dueDate: "Fecha de vencimiento",
    save: "Guardar pago",
    saving: "Guardando…",
    cancel: "Cancelar",
    report: "Reportar un hecho",
    notFound: "Alquiler no encontrado.",
  },
};

export default function PropertyScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();
  const { user } = useAuth();

  const [rental, setRental] = useState<Rental | null | undefined>(undefined);
  const [payments, setPayments] = useState<PaymentItem[] | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [payStatus, setPayStatus] = useState<"onTime" | "late">("onTime");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const id = new URLSearchParams(window.location.search).get("id") ?? "";
    let alive = true;
    fetchRentalById(user.id, id).then((r) => alive && setRental(r));
    fetchPayments(id).then((p) => alive && setPayments(p));
    return () => {
      alive = false;
    };
  }, [user]);

  async function handleRecord() {
    if (!rental || saving) return;
    setSaving(true);
    try {
      await createPayment(rental.id, {
        amount: Math.round(Number(amount) || rental.rent),
        dueDate: dueDate || new Date().toISOString().slice(0, 10),
        paidDate: payStatus === "onTime" ? dueDate || new Date().toISOString().slice(0, 10) : null,
        status: payStatus,
      });
      setShowForm(false);
      setPayments(await fetchPayments(rental.id));
    } catch {
      /* demo mode or error — ignore for now */
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  const onTimeRate =
    payments && payments.length > 0
      ? Math.round((payments.filter((p) => p.status === "onTime").length / payments.length) * 100)
      : null;

  if (rental === undefined) {
    return (
      <>
        <AppHeader title="…" back />
        <PageFade>
          <Screen>
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="mt-3 h-16 w-full rounded-2xl" />
            <Skeleton className="mt-3 h-40 w-full rounded-2xl" />
          </Screen>
        </PageFade>
      </>
    );
  }

  if (rental === null) {
    return (
      <>
        <AppHeader title="—" back />
        <PageFade>
          <Screen>
            <p className="mt-10 text-center text-[15px] text-ink-faint">{c.notFound}</p>
          </Screen>
        </PageFade>
      </>
    );
  }

  const term = `${formatMonthYear(rental.startDate, locale)} – ${
    rental.status === "past" ? formatMonthYear(rental.endDate, locale) : formatMonthYear(null, locale)
  }`;

  return (
    <>
      <AppHeader title={rental.address} back />
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
                <MapPin className="h-3.5 w-3.5" /> {rental.city}
              </span>
            </div>
            <div className="p-4">
              <div className="text-[16px] font-bold text-ink">{rental.address}</div>
              <div className="mt-0.5 text-[13px] text-ink-faint">{rental.city}</div>
            </div>
          </Card>

          {/* Relation */}
          <Card className="mt-3 flex items-center gap-3 p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1 text-[14px] font-semibold text-ink">
              {rental.relation === "landlord" ? c.youManage : c.youRent}
            </div>
            {rental.verified ? (
              <Chip tone="verify" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                {c.verified}
              </Chip>
            ) : (
              <Chip tone="pending" icon={<Clock className="h-3.5 w-3.5" />}>
                {c.unverified}
              </Chip>
            )}
          </Card>

          {/* Contract data */}
          <div className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
            {c.contract}
          </div>
          <Card className="divide-y divide-line p-0">
            <Row icon={<CircleDollarSign className="h-[18px] w-[18px]" />} label={c.rent}>
              <span className="tnum">
                ${rental.rent.toLocaleString()}
                <span className="text-ink-faint">{c.perMonth}</span>
              </span>
            </Row>
            <Row icon={<CalendarRange className="h-[18px] w-[18px]" />} label={c.leaseTerm}>
              <span className="tnum text-[14px]">{term}</span>
            </Row>
            <Row icon={<BadgeCheck className="h-[18px] w-[18px]" />} label={c.status}>
              <Chip tone={rental.status === "active" ? "verify" : "neutral"}>
                {rental.status === "active" ? c.active : c.past}
              </Chip>
            </Row>
          </Card>

          {/* Payments */}
          <div className="mb-2.5 mt-6 flex items-baseline justify-between">
            <span className="text-[13px] font-bold uppercase tracking-wider text-ink-faint">{c.payments}</span>
            {onTimeRate !== null && (
              <span className="text-[13px] font-bold text-verify tnum">
                {onTimeRate}% {c.onTimeRate}
              </span>
            )}
          </div>

          <Card className="p-0">
            {payments === null ? (
              <div className="space-y-2 p-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : payments.length === 0 ? (
              <p className="px-4 py-5 text-center text-[13px] text-ink-faint">{c.noPayments}</p>
            ) : (
              <div className="divide-y divide-line">
                {payments.map((p) => {
                  const label =
                    p.dueDate ? formatMonthYear(p.dueDate, locale) : locale === "es" ? p.monthEs : p.monthEn;
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                      <span
                        className={
                          "grid h-9 w-9 shrink-0 place-items-center rounded-xl " +
                          (p.status === "onTime" ? "bg-verify-tint text-verify" : "bg-amber-tint text-amber")
                        }
                      >
                        <CreditCard className="h-[18px] w-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-semibold text-ink">{label}</div>
                        <div className="text-[12px] text-ink-faint">
                          {p.status === "onTime" ? c.onTime : c.late}
                        </div>
                      </div>
                      <span className="text-[15px] font-bold text-ink tnum">${p.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Record payment form */}
          {showForm ? (
            <Card className="mt-3 space-y-3 p-4">
              <Field label={c.amount}>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={String(rental.rent)}
                />
              </Field>
              <Field label={c.dueDate}>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
              <SegmentedControl
                options={[
                  { value: "onTime", label: c.onTime },
                  { value: "late", label: c.late },
                ]}
                value={payStatus}
                onChange={setPayStatus}
                className="w-full"
              />
              <div className="flex gap-2">
                <Button variant="secondary" full onClick={() => setShowForm(false)}>
                  {c.cancel}
                </Button>
                <Button full disabled={saving} onClick={handleRecord} icon={<Check className="h-[18px] w-[18px]" />}>
                  {saving ? c.saving : c.save}
                </Button>
              </div>
            </Card>
          ) : (
            <Button
              variant="ghost"
              full
              className="mt-3"
              onClick={() => {
                setAmount(String(rental.rent));
                setShowForm(true);
              }}
              icon={<Plus className="h-[18px] w-[18px]" />}
            >
              {c.record}
            </Button>
          )}

          {/* Report */}
          <div className="mt-6">
            <Button href="/report" variant="ghost" full icon={<Flag className="h-[18px] w-[18px]" />}>
              {c.report}
            </Button>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">{icon}</span>
      <span className="text-[14px] text-ink-soft">{label}</span>
      <span className="ml-auto text-[15px] font-semibold text-ink">{children}</span>
    </div>
  );
}
