"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Profile, Role } from "@/lib/supabase/types";
import { isNativeApp } from "@/lib/platform";
import { me } from "@/lib/mock";

type AuthUser = { id: string; email: string | null };

type AuthResult = { error: string | null };

// Deep link the native app registers so OAuth can return into it.
const NATIVE_OAUTH_REDIRECT = "tenanttrust://login-callback";

/**
 * Native (Capacitor) Google sign-in: open the provider URL in an in-app
 * browser, then catch the `tenanttrust://login-callback?code=...` deep link,
 * exchange the code for a session, and close the browser.
 */
async function signInNativeGoogle(supabase: SupabaseClient): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: NATIVE_OAUTH_REDIRECT, skipBrowserRedirect: true },
  });
  if (error || !data?.url) return { error: error?.message ?? "Could not start Google sign-in" };

  const { Browser } = await import("@capacitor/browser");
  const { App } = await import("@capacitor/app");

  return new Promise<AuthResult>((resolve) => {
    let handle: { remove: () => Promise<void> } | null = null;
    let settled = false;

    App.addListener("appUrlOpen", async ({ url }: { url: string }) => {
      if (!url.startsWith(NATIVE_OAUTH_REDIRECT) || settled) return;
      settled = true;
      let res: AuthResult = { error: null };
      try {
        const code = new URL(url).searchParams.get("code");
        if (code) await supabase.auth.exchangeCodeForSession(code);
      } catch {
        res = { error: "Sign-in failed" };
      }
      await Browser.close().catch(() => {});
      if (handle) await handle.remove().catch(() => {});
      resolve(res);
    }).then((h) => {
      handle = h;
    });

    Browser.open({ url: data.url });
  });
}

type AuthContextValue = {
  loading: boolean;
  demoMode: boolean;
  user: AuthUser | null;
  profile: Profile | null;
  signUp: (email: string, password: string, role: Role, fullName?: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithOAuth: (provider: "google" | "apple") => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo profile used when Supabase isn't configured, so the prototype stays live.
const DEMO_PROFILE: Profile = {
  id: "demo",
  role: "tenant",
  full_name: me.name,
  avatar_initials: me.initials,
  phone: null,
  bio: null,
  trust_score: me.trustScore,
  identity_verified: true,
  created_at: new Date(0).toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const demoMode = !isSupabaseConfigured;
  const [loading, setLoading] = useState(!demoMode);
  const [user, setUser] = useState<AuthUser | null>(demoMode ? { id: "demo", email: "demo@tenanttrust.com" } : null);
  const [profile, setProfile] = useState<Profile | null>(demoMode ? DEMO_PROFILE : null);

  const loadProfile = useCallback(async (userId: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data as Profile);
  }, []);

  useEffect(() => {
    if (demoMode) return;
    const supabase = getSupabase();
    if (!supabase) return;

    // When returning from an OAuth/magic-link redirect the URL carries a `code`
    // that supabase-js exchanges asynchronously. Keep "loading" until that
    // finishes so the guard doesn't bounce us away before the session lands.
    const hasAuthCallback =
      typeof window !== "undefined" &&
      (/[?&](code|error_description)=/.test(window.location.search) ||
        window.location.hash.includes("access_token"));

    const cleanUrl = () => {
      if (typeof window === "undefined") return;
      if (/[?&]code=/.test(window.location.search) || window.location.hash.includes("access_token")) {
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname + url.hash.replace(/access_token.*$/, ""));
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        setUser({ id: u.id, email: u.email ?? null });
        void loadProfile(u.id);
        setLoading(false);
      } else if (!hasAuthCallback) {
        setLoading(false);
      }
      // else: OAuth code present but not exchanged yet → wait for onAuthStateChange
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user;
      if (u) {
        setUser({ id: u.id, email: u.email ?? null });
        void loadProfile(u.id);
        cleanUrl();
        setLoading(false);
      } else {
        setUser(null);
        setProfile(null);
        // Don't stop the loader on the initial null tick while an OAuth code is
        // still being exchanged.
        if (!(event === "INITIAL_SESSION" && hasAuthCallback)) setLoading(false);
      }
    });

    // Safety net: never hang on the loader.
    const t = setTimeout(() => setLoading(false), 6000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, [demoMode, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const signUp = useCallback<AuthContextValue["signUp"]>(
    async (email, password, role, fullName) => {
      const supabase = getSupabase();
      if (!supabase) return { error: null }; // demo mode: pretend success
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, full_name: fullName ?? null },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/home/` : undefined,
        },
      });
      return { error: error?.message ?? null };
    },
    [],
  );

  const signIn = useCallback<AuthContextValue["signIn"]>(async (email, password) => {
    const supabase = getSupabase();
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signInWithOAuth = useCallback<AuthContextValue["signInWithOAuth"]>(async (provider) => {
    const supabase = getSupabase();
    if (!supabase) return { error: null };

    // Native app → deep-link flow that returns into the app.
    if (provider === "google" && isNativeApp()) {
      return signInNativeGoogle(supabase);
    }

    // Web → standard full-page redirect back to /home.
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: typeof window !== "undefined" ? `${window.location.origin}/home/` : undefined },
    });
    return { error: error?.message ?? null };
  }, []);

  const resetPassword = useCallback<AuthContextValue["resetPassword"]>(async (email) => {
    const supabase = getSupabase();
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login/` : undefined,
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    if (typeof window !== "undefined") window.location.assign("/welcome/");
  }, []);

  return (
    <AuthContext.Provider
      value={{ loading, demoMode, user, profile, signUp, signIn, signInWithOAuth, resetPassword, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
