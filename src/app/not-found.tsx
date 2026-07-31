"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { AuthShell } from "@/components/auth-shell";
import { useT } from "@/lib/i18n";

export default function NotFound() {
  const c = useT({
    en: {
      title: "We couldn't find that page",
      body: "The link may be broken or the page may have moved. Let's get you back on track.",
      home: "Go to home",
    },
    es: {
      title: "No encontramos esa página",
      body: "El enlace puede estar roto o la página se movió. Te llevamos de vuelta.",
      home: "Ir al inicio",
    },
  });

  return (
    <AuthShell>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="grid h-[74px] w-[74px] place-items-center rounded-[22px] bg-amber-tint text-amber">
          <AlertTriangle className="h-9 w-9" />
        </div>
        <div className="mt-5 text-[11px] font-bold uppercase tracking-widest text-ink-faint">Error 404</div>
        <h1 className="mt-1 text-[22px] font-bold text-ink">{c.title}</h1>
        <p className="mt-2 max-w-[32ch] text-[14px] text-ink-soft">{c.body}</p>
        <Button href="/home" className="mt-6">
          {c.home}
        </Button>
      </div>
    </AuthShell>
  );
}
