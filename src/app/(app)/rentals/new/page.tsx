"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Info } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Button, Field, Input, SegmentedControl } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { createRental } from "@/lib/data";

const copy = {
  en: {
    title: "Add a contract",
    intro: "Record a rental you manage. It's saved to your account and appears in your history.",
    address: "Property address",
    addressPh: "742 Ocean Ave, Apt 4B",
    city: "City",
    cityPh: "Brooklyn, NY",
    rent: "Monthly rent (USD)",
    rentPh: "2400",
    start: "Start date",
    end: "End date",
    statusL: "Status",
    active: "Active",
    past: "Past",
    save: "Save contract",
    saving: "Saving…",
    demo: "Demo mode — connect a real account to save contracts.",
    err: "Could not save. Check the fields and try again.",
  },
  es: {
    title: "Añadir contrato",
    intro: "Registra un alquiler que administras. Se guarda en tu cuenta y aparece en tu historial.",
    address: "Dirección del inmueble",
    addressPh: "742 Ocean Ave, Apt 4B",
    city: "Ciudad",
    cityPh: "Brooklyn, NY",
    rent: "Renta mensual (USD)",
    rentPh: "2400",
    start: "Fecha de inicio",
    end: "Fecha de fin",
    statusL: "Estado",
    active: "Activo",
    past: "Pasado",
    save: "Guardar contrato",
    saving: "Guardando…",
    demo: "Modo demo — conecta una cuenta real para guardar contratos.",
    err: "No se pudo guardar. Revisa los campos e inténtalo de nuevo.",
  },
};

export default function NewRentalScreen() {
  const c = useT(copy);
  const router = useRouter();
  const { user, demoMode } = useAuth();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [rent, setRent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"active" | "past">("active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = address.trim() && city.trim() && Number(rent) > 0 && startDate;

  async function handleSave() {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    try {
      if (demoMode || !user) {
        // No backend in demo mode — just return to the list.
        router.push("/rentals");
        return;
      }
      await createRental(user.id, {
        address: address.trim(),
        city: city.trim(),
        rent: Math.round(Number(rent)),
        startDate,
        endDate: status === "past" && endDate ? endDate : null,
        status,
      });
      router.push("/rentals");
    } catch {
      setError(c.err);
      setSaving(false);
    }
  }

  return (
    <>
      <AppHeader title={c.title} back />
      <PageFade>
        <Screen>
          <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-line bg-surface-2 p-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
              <Home className="h-[18px] w-[18px]" />
            </span>
            <p className="text-[13px] leading-snug text-ink-soft">{c.intro}</p>
          </div>

          {demoMode && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-tint px-3 py-2.5 text-[12.5px] font-medium text-amber">
              <Info className="h-4 w-4 shrink-0" />
              {c.demo}
            </div>
          )}

          <div className="space-y-4">
            <Field label={c.address}>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={c.addressPh} />
            </Field>
            <Field label={c.city}>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder={c.cityPh} />
            </Field>
            <Field label={c.rent}>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                placeholder={c.rentPh}
              />
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

            {error && <p className="text-[13px] font-medium text-danger">{error}</p>}

            <Button full size="lg" disabled={!valid || saving} onClick={handleSave}>
              {saving ? c.saving : c.save}
            </Button>
          </div>
        </Screen>
      </PageFade>
    </>
  );
}
