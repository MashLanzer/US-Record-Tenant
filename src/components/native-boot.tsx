"use client";

import { useEffect } from "react";
import { isNativeApp } from "@/lib/platform";

/**
 * Native-only boot tasks. Hides the Capacitor splash screen once the web app
 * has mounted (so the branded splash covers the first paint, then dismisses
 * cleanly). No-op on the web. Renders nothing.
 */
export function NativeBoot() {
  useEffect(() => {
    if (!isNativeApp()) return;
    let cancelled = false;
    (async () => {
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        // Small delay avoids a flash between splash teardown and first paint.
        await new Promise((r) => setTimeout(r, 300));
        if (!cancelled) await SplashScreen.hide();
      } catch {
        /* plugin unavailable (web build) — ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
