"use client";

import { FileText, Plus } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/empty";
import { PageFade } from "@/components/motion";
import { useT } from "@/lib/i18n";

const copy = {
  en: {
    title: "Empty state",
    emptyTitle: "No history yet",
    emptyDesc: "Link your first contract and start building your portable reputation.",
    addContract: "Add contract",
  },
  es: {
    title: "Estado vacío",
    emptyTitle: "Aún no hay historial",
    emptyDesc: "Vincula tu primer contrato y empieza a construir tu reputación portable.",
    addContract: "Añadir contrato",
  },
};

export default function EmptyStateScreen() {
  const c = useT(copy);

  return (
    <>
      <AppHeader title={c.title} />
      <PageFade>
        <Screen>
          <EmptyState
            icon={<FileText />}
            title={c.emptyTitle}
            description={c.emptyDesc}
            action={
              <Button href="/rentals" icon={<Plus className="h-[18px] w-[18px]" />}>
                {c.addContract}
              </Button>
            }
          />
        </Screen>
      </PageFade>
    </>
  );
}
