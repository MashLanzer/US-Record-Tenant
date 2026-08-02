"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "es";

/**
 * A per-screen dictionary. Screens colocate their own copy as
 * `{ en: {...}, es: {...} }` so no shared file becomes a merge bottleneck
 * and translation stays trivial.
 */
export type Dict<T> = Record<Locale, T>;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "tt.locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      window.localStorage.getItem(STORAGE_KEY)) as Locale | null;
    if (saved === "en" || saved === "es") {
      setLocaleState(saved);
    } else if (typeof navigator !== "undefined" && navigator.language.startsWith("es")) {
      setLocaleState("es");
    }
  }, []);

  // Keep the document language in sync so assistive tech reads content in the
  // right language (WCAG 3.1.1 Language of Page).
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  const toggle = () => setLocale(locale === "en" ? "es" : "en");

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggle }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

/** Pick the current-locale slice of a colocated dictionary. */
export function useT<T>(dict: Dict<T>): T {
  const { locale } = useLocale();
  return dict[locale];
}
