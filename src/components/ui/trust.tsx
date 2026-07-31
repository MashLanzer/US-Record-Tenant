"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { TrustFactor } from "@/lib/mock";

/**
 * TrustRing — the signature reputation dial. Animates a count-up + arc fill
 * on mount. Never a black box: pair it with <FactorBars> for the "why".
 */
export function TrustRing({
  score,
  size = 104,
  tone = "verify",
  onDark = false,
  label,
}: {
  score: number;
  size?: number;
  tone?: "verify" | "brand" | "white";
  onDark?: boolean;
  label?: string;
}) {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(score);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(eased * score));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const arcColor =
    tone === "white" ? "#ffffff" : tone === "brand" ? "var(--brand)" : "var(--verify)";
  const trackColor = onDark ? "rgba(255,255,255,.22)" : "var(--surface-3)";
  const inner = onDark ? "transparent" : "var(--surface)";

  return (
    <div
      ref={ref}
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${arcColor} 0 ${shown}%, ${trackColor} ${shown}% 100%)`,
      }}
    >
      <div
        className="absolute rounded-full"
        style={{ inset: size * 0.11, background: inner }}
      />
      <div className="relative text-center leading-none">
        <span
          className={cn("font-extrabold tracking-tight tnum")}
          style={{ fontSize: size * 0.3, color: tone === "white" ? "#fff" : "var(--ink)" }}
        >
          {shown}
        </span>
        {label && (
          <span className="mt-1 block text-[10px] font-semibold text-ink-faint">{label}</span>
        )}
      </div>
    </div>
  );
}

export function FactorBars({
  factors,
  labelKey = "en",
}: {
  factors: TrustFactor[];
  labelKey?: "en" | "es";
}) {
  const barTone = { verify: "bg-verify", brand: "bg-brand", amber: "bg-amber" };
  return (
    <div className="flex flex-col gap-2.5">
      {factors.map((f) => (
        <div key={f.key} className="grid grid-cols-[1fr_auto] items-center gap-2">
          <div className="min-w-0">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="truncate text-[13px] text-ink-soft">
                {labelKey === "es" ? f.labelEs : f.labelEn}
              </span>
              <span className="text-[13px] font-semibold text-ink tnum">{f.score}</span>
            </div>
            <div className="h-[7px] overflow-hidden rounded-full bg-surface-3">
              <div
                className={cn("h-full rounded-full transition-all duration-700", barTone[f.tone])}
                style={{ width: `${f.score}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
