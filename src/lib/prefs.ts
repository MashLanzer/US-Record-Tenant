"use client";

import { useEffect, useState } from "react";

/**
 * A boolean preference persisted to localStorage, so toggles in Settings
 * survive reloads and app restarts. SSR-safe: starts from `fallback` until
 * the client reads the stored value.
 */
export function usePref(key: string, fallback: boolean): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`tt.pref.${key}`);
      if (raw !== null) setValue(raw === "1");
    } catch {
      /* localStorage unavailable — keep fallback */
    }
  }, [key]);

  const update = (v: boolean) => {
    setValue(v);
    try {
      window.localStorage.setItem(`tt.pref.${key}`, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  return [value, update];
}
