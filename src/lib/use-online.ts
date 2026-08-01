"use client";

import { useEffect, useState } from "react";

/**
 * Tracks browser/network connectivity. Starts optimistic (true) so SSR and the
 * first client paint agree, then syncs to the real value and listens for
 * online/offline events.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return online;
}
