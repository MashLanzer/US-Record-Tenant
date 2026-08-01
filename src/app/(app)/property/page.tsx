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
  UserPlus,
  Mail,
  Star,
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
  inviteToLease,
  fetchLeaseInvites,
  fetchReportsForLease,
  reportTypeLabel,
  submitRating,
  fetchMyRatingForLease,
  type Rental,
  type PaymentItem,
  type Invitation,
  type ReportItem,
  type MyRating,
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
    inviteTitle: "Invite the tenant",
    inviteSub: "Send an invite by email. When they accept, this lease becomes verified for both of you.",
    invitePh: "tenant@email.com",
    invite: "Send invite",
    inviting: "Sending…",
    invited: "Invited",
    accepted: "Accepted",
    declined: "Declined",
    inviteSent: "Invite sent.",
    inviteErr: "Could not send. Check the email and try again.",
    tenantLinked: "Tenant confirmed · lease verified",
    facts: "Facts on record",
    byYou: "By you",
    aboutYou: "About you",
    stOpen: "Open",
    stDisputed: "Disputed",
    stResolved: "Resolved",
    rateTitle: "Rate your counterparty",
    overall: "Overall",
    comm: "Communication",
    relLandlord: "Payment punctuality",
    careLandlord: "Property care",
    relTenant: "Deposit & fairness",
    careTenant: "Repairs & maintenance",
    comment: "Comment (optional)",
    commentPh: "Share your experience…",
    saveRating: "Save rating",
    savingRating: "Saving…",
    yourRating: "Your rating",
    editRating: "Edit",
    ratedNote: "Ratings feed the other party's trust score. One rating per lease — you can update it anytime.",
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
    inviteTitle: "Invita al inquilino",
    inviteSub: "Envía una invitación por correo. Cuando la acepte, el contrato queda verificado para ambos.",
    invitePh: "inquilino@correo.com",
    invite: "Enviar invitación",
    inviting: "Enviando…",
    invited: "Invitado",
    accepted: "Aceptada",
    declined: "Rechazada",
    inviteSent: "Invitación enviada.",
    inviteErr: "No se pudo enviar. Revisa el correo e inténtalo de nuevo.",
    tenantLinked: "Inquilino confirmado · contrato verificado",
    facts: "Hechos en el historial",
    byYou: "Por ti",
    aboutYou: "Sobre ti",
    stOpen: "Abierto",
    stDisputed: "En disputa",
    stResolved: "Resuelto",
    rateTitle: "Califica a tu contraparte",
    overall: "General",
    comm: "Comunicación",
    relLandlord: "Puntualidad de pago",
    careLandlord: "Cuidado de la propiedad",
    relTenant: "Depósito y trato",
    careTenant: "Reparaciones",
    comment: "Comentario (opcional)",
    commentPh: "Comparte tu experiencia…",
    saveRating: "Guardar calificación",
    savingRating: "Guardando…",
    yourRating: "Tu calificación",
    editRating: "Editar",
    ratedNote: "Las calificaciones alimentan el puntaje de confianza de la otra parte. Una por contrato — puedes actualizarla cuando quieras.",
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

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);

  const [myRating, setMyRating] = useState<MyRating | undefined>(undefined);
  const [showRate, setShowRate] = useState(false);
  const [rOverall, setROverall] = useState(0);
  const [rComm, setRComm] = useState(0);
  const [rRel, setRRel] = useState(0);
  const [rCare, setRCare] = useState(0);
  const [rComment, setRComment] = useState("");
  const [savingRating, setSavingRating] = useState(false);

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

  // Load sent invites once we know this is the landlord's un-linked lease.
  useEffect(() => {
    if (rental && rental.relation === "landlord" && !rental.tenantId) {
      fetchLeaseInvites(rental.id).then(setInvites);
    }
  }, [rental]);

  // Load recorded facts for this lease.
  useEffect(() => {
    if (rental && user) fetchReportsForLease(rental.id, user.id).then(setReports);
  }, [rental, user]);

  // Load my existing rating (if the lease is bilateral).
  useEffect(() => {
    const bilateral = rental && (rental.relation === "tenant" || rental.tenantId);
    if (rental && user && bilateral) {
      fetchMyRatingForLease(rental.id, user.id).then((r) => {
        setMyRating(r);
        if (r) {
          setROverall(r.overall);
          setRComm(r.communication ?? 0);
          setRRel(r.reliability ?? 0);
          setRCare(r.care ?? 0);
          setRComment(r.comment ?? "");
        }
      });
    } else {
      setMyRating(null);
    }
  }, [rental, user]);

  async function handleSaveRating() {
    if (!rental || !user || savingRating || rOverall < 1) return;
    setSavingRating(true);
    try {
      await submitRating(rental.id, {
        overall: rOverall,
        communication: rComm || rOverall,
        reliability: rRel || rOverall,
        care: rCare || rOverall,
        comment: rComment.trim(),
      });
      setMyRating(await fetchMyRatingForLease(rental.id, user.id));
      setShowRate(false);
    } catch {
      /* ignore */
    } finally {
      setSavingRating(false);
    }
  }

  async function handleInvite() {
    if (!rental || !user || inviting || !inviteEmail.trim()) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      await inviteToLease(user.id, rental.id, inviteEmail);
      setInviteEmail("");
      setInviteMsg(c.inviteSent);
      setInvites(await fetchLeaseInvites(rental.id));
    } catch {
      setInviteMsg(c.inviteErr);
    } finally {
      setInviting(false);
    }
  }

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

          {/* Invite tenant (landlord, lease not yet linked to a tenant) */}
          {rental.relation === "landlord" &&
            (rental.tenantId ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-verify-tint px-3.5 py-2.5 text-[13px] font-semibold text-verify">
                <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
                {c.tenantLinked}
              </div>
            ) : (
              <Card className="mt-3 p-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                    <UserPlus className="h-[18px] w-[18px]" />
                  </span>
                  <div className="text-[15px] font-bold text-ink">{c.inviteTitle}</div>
                </div>
                <p className="mt-2 text-[12.5px] leading-snug text-ink-soft">{c.inviteSub}</p>

                <div className="mt-3 flex gap-2">
                  <Input
                    type="email"
                    inputMode="email"
                    placeholder={c.invitePh}
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                    {inviting ? c.inviting : c.invite}
                  </Button>
                </div>
                {inviteMsg && <p className="mt-2 text-[12.5px] font-medium text-ink-soft">{inviteMsg}</p>}

                {invites.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-line pt-3">
                    {invites.map((inv) => (
                      <div key={inv.id} className="flex items-center gap-2 text-[13px]">
                        <Mail className="h-4 w-4 shrink-0 text-ink-faint" />
                        <span className="min-w-0 flex-1 truncate text-ink-soft">{inv.inviteeEmail}</span>
                        <Chip
                          tone={inv.status === "accepted" ? "verify" : inv.status === "declined" ? "dispute" : "pending"}
                        >
                          {inv.status === "accepted" ? c.accepted : inv.status === "declined" ? c.declined : c.invited}
                        </Chip>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}

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

          {/* Facts on record */}
          {reports.length > 0 && (
            <>
              <div className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
                {c.facts}
              </div>
              <Card className="divide-y divide-line p-0">
                {reports.map((r) => (
                  <div key={r.id} className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-[14px] font-semibold text-ink">
                        {reportTypeLabel(r.type, locale)}
                      </span>
                      <Chip tone={r.direction === "by_me" ? "brand" : "pending"}>
                        {r.direction === "by_me" ? c.byYou : c.aboutYou}
                      </Chip>
                      <Chip tone={r.status === "resolved" ? "verify" : r.status === "disputed" ? "dispute" : "neutral"}>
                        {r.status === "resolved" ? c.stResolved : r.status === "disputed" ? c.stDisputed : c.stOpen}
                      </Chip>
                    </div>
                    {r.description && (
                      <p className="mt-1 text-[13px] leading-snug text-ink-soft">{r.description}</p>
                    )}
                    <div className="mt-1 text-[11px] text-ink-faint">{r.timeLabel}</div>
                  </div>
                ))}
              </Card>
            </>
          )}

          {/* Rate counterparty */}
          {(rental.relation === "tenant" || rental.tenantId) && myRating !== undefined && (
            <>
              <div className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
                {c.rateTitle}
              </div>
              {myRating && !showRate ? (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[12px] text-ink-faint">{c.yourRating}</div>
                      <div className="mt-1">
                        <StarField label="" value={myRating.overall} />
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => setShowRate(true)}>
                      {c.editRating}
                    </Button>
                  </div>
                  {myRating.comment && <p className="mt-2 text-[13px] text-ink-soft">{myRating.comment}</p>}
                </Card>
              ) : (
                <Card className="space-y-3.5 p-4">
                  <StarField label={c.overall} value={rOverall} onChange={setROverall} />
                  <StarField label={c.comm} value={rComm} onChange={setRComm} />
                  <StarField
                    label={rental.relation === "landlord" ? c.relLandlord : c.relTenant}
                    value={rRel}
                    onChange={setRRel}
                  />
                  <StarField
                    label={rental.relation === "landlord" ? c.careLandlord : c.careTenant}
                    value={rCare}
                    onChange={setRCare}
                  />
                  <div>
                    <div className="mb-1.5 text-[13px] font-semibold text-ink-soft">{c.comment}</div>
                    <textarea
                      value={rComment}
                      onChange={(e) => setRComment(e.target.value)}
                      placeholder={c.commentPh}
                      rows={3}
                      className="w-full resize-none rounded-xl border-[1.5px] border-line-strong bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-tint"
                    />
                  </div>
                  <p className="text-[11.5px] leading-snug text-ink-faint">{c.ratedNote}</p>
                  <Button
                    full
                    disabled={rOverall < 1 || savingRating}
                    onClick={handleSaveRating}
                    icon={<Star className="h-[18px] w-[18px]" />}
                  >
                    {savingRating ? c.savingRating : c.saveRating}
                  </Button>
                </Card>
              )}
            </>
          )}

          {/* Report */}
          {(rental.relation === "tenant" || rental.tenantId) && (
            <div className="mt-6">
              <Button
                href={`/report?lease=${rental.id}`}
                variant="ghost"
                full
                icon={<Flag className="h-[18px] w-[18px]" />}
              >
                {c.report}
              </Button>
            </div>
          )}
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

function StarField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange?: (v: number) => void;
}) {
  const readOnly = !onChange;
  return (
    <div className={label ? "flex items-center justify-between gap-3" : "flex items-center gap-1"}>
      {label && <span className="text-[14px] text-ink-soft">{label}</span>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(n)}
            className={
              (readOnly ? "cursor-default " : "transition-transform active:scale-90 ") +
              (n <= value ? "text-amber" : "text-line-strong")
            }
            aria-label={`${n}`}
          >
            <Star className="h-6 w-6" fill={n <= value ? "currentColor" : "none"} strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}
