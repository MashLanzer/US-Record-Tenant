"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Shield, MapPin, Star, ArrowUpRight, Lock } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { Card, Input, Button, Avatar } from "@/components/ui/primitives";
import { PageFade, Stagger, StaggerItem } from "@/components/motion";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";

const copy = {
  en: {
    title: "Search",
    subtitle: "Find verified tenants and landlords.",
    placeholder: "Name, email, or property",
    filters: "Filters",
    roleTenant: "Tenants",
    roleLandlord: "Landlords",
    verifiedOnly: "Verified only",
    location: "Near me",
    minScore: "Score 80+",
    recent: "Recent searches",
    privacyTitle: "Search responsibly",
    privacyBody:
      "Searching people requires a valid, permissible purpose. Every lookup is recorded for the person you view.",
    search: "Search",
  },
  es: {
    title: "Buscar",
    subtitle: "Encuentra inquilinos y propietarios verificados.",
    placeholder: "Nombre, correo o propiedad",
    filters: "Filtros",
    roleTenant: "Inquilinos",
    roleLandlord: "Propietarios",
    verifiedOnly: "Solo verificados",
    location: "Cerca de mí",
    minScore: "Score 80+",
    recent: "Búsquedas recientes",
    privacyTitle: "Busca de forma responsable",
    privacyBody:
      "Buscar personas requiere un propósito válido y permitido. Cada consulta queda registrada para la persona que consultas.",
    search: "Buscar",
  },
};

const recent = [
  { id: "r1", name: "James D.", initials: "JD", verified: true, en: "Tenant · Brooklyn, NY", es: "Inquilino · Brooklyn, NY" },
  { id: "r2", name: "Maple Ridge Homes", initials: "MR", verified: true, en: "Landlord · Manhattan, NY", es: "Propietario · Manhattan, NY" },
  { id: "r3", name: "Ana P.", initials: "AP", verified: true, en: "Tenant · Queens, NY", es: "Inquilino · Queens, NY" },
];

export default function SearchScreen() {
  const c = useT(copy);
  const g = useT(common);
  const { locale } = useLocale();
  const [active, setActive] = useState<string[]>(["verified"]);

  const filters = [
    { key: "tenant", label: c.roleTenant, icon: null },
    { key: "landlord", label: c.roleLandlord, icon: null },
    { key: "verified", label: c.verifiedOnly, icon: <Shield className="h-3.5 w-3.5" /> },
    { key: "location", label: c.location, icon: <MapPin className="h-3.5 w-3.5" /> },
    { key: "score", label: c.minScore, icon: <Star className="h-3.5 w-3.5" /> },
  ];

  const toggle = (k: string) =>
    setActive((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  return (
    <PageFade>
      <Screen>
        <div className="pt-1">
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{c.title}</h1>
          <p className="mt-0.5 text-[14px] text-ink-faint">{c.subtitle}</p>
        </div>

        {/* Search box */}
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
          <Input placeholder={c.placeholder} className="pl-11" />
        </div>

        {/* Filter chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((f) => {
            const on = active.includes(f.key);
            return (
              <button
                key={f.key}
                onClick={() => toggle(f.key)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-all active:scale-[.97] ${
                  on
                    ? "border-brand/30 bg-brand-tint text-brand"
                    : "border-line bg-surface text-ink-soft hover:bg-surface-3"
                }`}
              >
                {f.icon}
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Recent searches */}
        <h2 className="mb-2.5 mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-faint">
          {c.recent}
        </h2>
        <Card className="p-2">
          <Stagger>
            {recent.map((r) => (
              <StaggerItem key={r.id}>
                <Link
                  href="/search/results"
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-3"
                >
                  <Avatar initials={r.initials} size={40} verified={r.verified} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-ink">{r.name}</div>
                    <div className="truncate text-[12px] text-ink-faint">
                      {locale === "es" ? r.es : r.en}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-faint" />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Card>

        {/* Privacy note */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-surface-2 p-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
            <Lock className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold text-ink">{c.privacyTitle}</div>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-faint">{c.privacyBody}</p>
          </div>
        </div>

        {/* Primary action */}
        <div className="mt-5">
          <Button href="/search/results" full icon={<Search className="h-[18px] w-[18px]" />}>
            {c.search}
          </Button>
        </div>
      </Screen>
    </PageFade>
  );
}
