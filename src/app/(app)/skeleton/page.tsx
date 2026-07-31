"use client";

import { Screen } from "@/components/app-shell";
import { AppHeader } from "@/components/app-header";
import { Card, Skeleton } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";

const copy = {
  en: {
    title: "Skeleton loading",
    caption: "Skeletons mirror the real layout so the app feels instant and never janky.",
  },
  es: {
    title: "Carga con esqueleto",
    caption: "Los esqueletos reflejan el diseño real para que la app se sienta instantánea y nunca brusca.",
  },
};

export default function SkeletonScreen() {
  const c = useT(copy);

  return (
    <>
      <AppHeader title={c.title} />
      <PageFade>
        <Screen>
          {/* Header row: avatar + two lines */}
          <div className="mt-1 flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>

          {/* Large hero card */}
          <Skeleton className="mt-4 h-[120px] w-full rounded-2xl" />

          {/* Two stat cards */}
          <div className="mt-3 flex gap-3">
            <Skeleton className="h-20 flex-1 rounded-2xl" />
            <Skeleton className="h-20 flex-1 rounded-2xl" />
          </div>

          {/* List rows */}
          <div className="mt-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>

          {/* Caption */}
          <Card className="mt-6 bg-surface-2 p-4">
            <p className="text-[13px] leading-relaxed text-ink-soft">{c.caption}</p>
          </Card>
        </Screen>
      </PageFade>
    </>
  );
}
