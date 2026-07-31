"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, MapPin, Star, Lock, ShieldCheck } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { Input, Button } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";

const copy = {
  en: {
    title: "Search",
    subtitle: "Find verified tenants and landlords.",
    placeholder: "Search by name",
    roleTenant: "Tenants",
    roleLandlord: "Landlords",
    verifiedOnly: "Verified only",
    location: "Near me",
    minScore: "Score 80+",
    privacyTitle: "Search responsibly",
    privacyBody: "Searching people requires a valid, permissible purpose.",
    search: "Search",
  },
  es: {
    title: "Buscar",
    subtitle: "Encuentra inquilinos y propietarios verificados.",
    placeholder: "Buscar por nombre",
    roleTenant: "Inquilinos",
    roleLandlord: "Propietarios",
    verifiedOnly: "Solo verificados",
    location: "Cerca de mí",
    minScore: "Score 80+",
    privacyTitle: "Busca de forma responsable",
    privacyBody: "Buscar personas requiere un propósito válido y legítimo.",
    search: "Buscar",
  },
};

export default function SearchScreen() {
  const c = useT(copy);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string[]>(["verified"]);

  const filters = [
    { key: "tenant", label: c.roleTenant, icon: null },
    { key: "landlord", label: c.roleLandlord, icon: null },
    { key: "verified", label: c.verifiedOnly, icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    { key: "location", label: c.location, icon: <MapPin className="h-3.5 w-3.5" /> },
    { key: "score", label: c.minScore, icon: <Star className="h-3.5 w-3.5" /> },
  ];

  const toggle = (k: string) =>
    setActive((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  const submit = () => {
    router.push("/search/results?q=" + encodeURIComponent(query.trim()));
  };

  return (
    <PageFade>
      <Screen>
        <div className="pt-1">
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{c.title}</h1>
          <p className="mt-0.5 text-[14px] text-ink-faint">{c.subtitle}</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {/* Search box */}
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={c.placeholder}
              className="pl-11"
            />
          </div>

          {/* Filter chips (decorative multi-select) */}
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((f) => {
              const on = active.includes(f.key);
              return (
                <button
                  key={f.key}
                  type="button"
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

          {/* Privacy note */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-surface-2 p-3.5">
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
            <Button type="submit" full icon={<Search className="h-[18px] w-[18px]" />}>
              {c.search}
            </Button>
          </div>
        </form>
      </Screen>
    </PageFade>
  );
}
