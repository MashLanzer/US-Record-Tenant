"use client";

import { AppHeader } from "@/components/app-header";
import { Screen } from "@/components/app-shell";
import { Card } from "@/components/ui/primitives";
import { PageFade } from "@/components/motion";

export type LegalSection = { heading: string; body: string[] };

export function LegalDoc({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <AppHeader title={title} back />
      <PageFade>
        <Screen>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-faint">{updated}</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{intro}</p>

          <div className="mt-4 space-y-3">
            {sections.map((s, i) => (
              <Card key={i} className="p-4">
                <h2 className="text-[15px] font-bold text-ink">
                  {i + 1}. {s.heading}
                </h2>
                {s.body.map((p, j) => (
                  <p key={j} className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                    {p}
                  </p>
                ))}
              </Card>
            ))}
          </div>

          <p className="mt-5 text-center text-[12px] leading-snug text-ink-faint">
            This is a plain-language summary provided for transparency and is not legal advice.
          </p>
        </Screen>
      </PageFade>
    </>
  );
}
