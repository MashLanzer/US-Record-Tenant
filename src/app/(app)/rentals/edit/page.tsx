"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Button, Field, Input, SegmentedControl, Skeleton } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { fetchRentalById, updateRental, deleteRental, type Rental } from "@/lib/data";

const copy = {
  en: {
    title: "Edit contract",
    address: "Property address",
    city: "City",
    rent: "Monthly rent (USD)",
    start: "Start date",
    end: "End date",
    statusL: "Status",
    active: "Active",
    past: "Past",
    save: "Save changes",
    saving: "Saving…",
    saved: "Contract updated.",
    err: "Could not save. Please try again.",
    notFound: "Contract not found.",
    onlyLandlord: "Only the landlord who manages this property can edit the contract.",
    dangerZone: "Danger zone",
    deleteBtn: "Delete contract",
    deleting: "Deleting…",
    confirmTitle: "Delete this contract?",
    confirmBody:
      "This permanently removes the contract and everything tied to it — payments, recorded facts, ratings and disputes. This cannot be undone.",
    confirmDelete: "Yes, delete",
    cancel: "Cancel",
  },
  es: {
    title: "Editar contrato",
    address: "Dirección del inmueble",
    city: "Ciudad",
    rent: "Renta mensual (USD)",
    start: "Fecha de inicio",
    end: "Fecha de fin",
    statusL: "Estado",
    active: "Activo",
    past: "Pasado",
    save: "Guardar cambios",
    saving: "Guardando…",
    saved: "Contrato actualizado.",
    err: "No se pudo guardar. Inténtalo de nuevo.",
    notFound: "Contrato no encontrado.",
    onlyLandlord: "Solo el propietario que administra este inmueble puede editar el contrato.",
    dangerZone: "Zona de peligro",
    deleteBtn: "Eliminar contrato",
    deleting: "Eliminando…",
    confirmTitle: "¿Eliminar este contrato?",
    confirmBody:
      "Esto elimina permanentemente el contrato y todo lo asociado — pagos, hechos registrados, calificaciones y disputas. No se puede deshacer.",
    confirmDelete: "Sí, eliminar",
    cancel: "Cancelar",
  },
};

export default function EditRentalScreen() {
  const c = useT(copy);
  const router = useRouter();
  const { user } = useAuth();

  const [rental, setRental] = useState<Rental | null | undefined>(undefined);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [rent, setRent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"active" | "past">("active");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    const id = new URLSearchParams(window.location.search).get("id") ?? "";
    fetchRentalById(user.id, id).then((r) => {
      setRental(r);
      if (r) {
        setAddress(r.address);
        setCity(r.city);
        setRent(String(r.rent));
        setStartDate(r.startDate);
        setEndDate(r.endDate ?? "");
        setStatus(r.status);
      }
    });
  }, [user]);

  const valid = address.trim() && city.trim() && Number(rent) > 0 && startDate;

  async function handleSave() {
    if (!rental || !valid || saving) return;
    setSaving(true);
    setMsg(null);
    setError(false);
    try {
      await updateRental({
        leaseId: rental.id,
        propertyId: rental.propertyId,
        address: address.trim(),
        city: city.trim(),
        rent: Math.round(Number(rent)),
        startDate,
        endDate: status === "past" && endDate ? endDate : null,
        status,
      });
      setMsg(c.saved);
      setTimeout(() => router.push(`/property?id=${rental.id}`), 600);
    } catch {
      setError(true);
      setMsg(c.err);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!rental || deleting) return;
    setDeleting(true);
    try {
      await deleteRental(rental.id, rental.propertyId);
      router.push("/rentals");
    } catch {
      setError(true);
      setMsg(c.err);
      setDeleting(false);
      setConfirm(false);
    }
  }

  if (rental === undefined) {
    return (
      <>
        <AppHeader title={c.title} back />
        <PageFade>
          <Screen>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </Screen>
        </PageFade>
      </>
    );
  }

  if (rental === null) {
    return (
      <>
        <AppHeader title={c.title} back />
        <PageFade>
          <Screen>
            <p className="mt-10 text-center text-[15px] text-ink-faint">{c.notFound}</p>
          </Screen>
        </PageFade>
      </>
    );
  }

  if (rental.relation !== "landlord") {
    return (
      <>
        <AppHeader title={c.title} back />
        <PageFade>
          <Screen>
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-amber/30 bg-amber-tint p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
              <p className="text-[13.5px] leading-snug text-amber">{c.onlyLandlord}</p>
            </div>
          </Screen>
        </PageFade>
      </>
    );
  }

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <div className="space-y-4">
            <Field label={c.address}>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
            <Field label={c.city}>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <Field label={c.rent}>
              <Input type="number" inputMode="numeric" min={0} value={rent} onChange={(e) => setRent(e.target.value)} />
            </Field>

            <div>
              <span className="mb-1.5 block text-[12.5px] font-semibold text-ink-soft">{c.statusL}</span>
              <SegmentedControl
                options={[
                  { value: "active", label: c.active },
                  { value: "past", label: c.past },
                ]}
                value={status}
                onChange={setStatus}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Field label={c.start}>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </Field>
              </div>
              {status === "past" && (
                <div className="flex-1">
                  <Field label={c.end}>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </Field>
                </div>
              )}
            </div>

            {msg && (
              <p className={"text-[13px] font-medium " + (error ? "text-danger" : "text-verify")}>{msg}</p>
            )}

            <Button
              full
              size="lg"
              disabled={!valid || saving}
              onClick={handleSave}
              icon={saving ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Check className="h-[18px] w-[18px]" />}
            >
              {saving ? c.saving : c.save}
            </Button>
          </div>

          {/* Danger zone */}
          <div className="mt-10">
            <div className="mb-2.5 text-[13px] font-bold uppercase tracking-wider text-danger">{c.dangerZone}</div>
            {confirm ? (
              <div className="rounded-2xl border border-danger/30 bg-danger-tint p-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                  <div>
                    <div className="text-[14px] font-bold text-danger">{c.confirmTitle}</div>
                    <p className="mt-1 text-[13px] leading-snug text-ink-soft">{c.confirmBody}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" full onClick={() => setConfirm(false)} disabled={deleting}>
                    {c.cancel}
                  </Button>
                  <Button
                    full
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-danger text-white hover:bg-danger"
                    icon={deleting ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Trash2 className="h-[18px] w-[18px]" />}
                  >
                    {deleting ? c.deleting : c.confirmDelete}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                full
                onClick={() => setConfirm(true)}
                className="border-danger/30 text-danger"
                icon={<Trash2 className="h-[18px] w-[18px]" />}
              >
                {c.deleteBtn}
              </Button>
            )}
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
