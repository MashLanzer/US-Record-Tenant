"use client";

import { WifiOff } from "lucide-react";
import { useOnline } from "@/lib/use-online";
import { useT } from "@/lib/i18n";

/** A slim banner shown while the device is offline, so failed saves make sense. */
export function OfflineBanner() {
  const online = useOnline();
  const c = useT({
    en: { msg: "You're offline. Changes won't save until you reconnect." },
    es: { msg: "Estás sin conexión. Los cambios no se guardarán hasta que te reconectes." },
  });

  if (online) return null;

  return (
    <div className="safe-top sticky top-0 z-50 flex items-center justify-center gap-2 bg-danger px-4 py-2 text-[12.5px] font-semibold text-white">
      <WifiOff className="h-4 w-4 shrink-0" />
      {c.msg}
    </div>
  );
}
