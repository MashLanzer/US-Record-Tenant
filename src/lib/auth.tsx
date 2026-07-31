"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Profile, Role } from "@/lib/supabase/types";
import { me } from "@/lib/mock";

type AuthUser = { id: string; email: string | null };

type AuthResult = { error: string | null };

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
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo profile used when Supabase isn't configured, so the prototype stays live.
const DEMO_PROFILE: Profile = {
  id: "demo",
  role: "tenant",
  full_name: me.name,
  avatar_initials: me.initials,
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

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        setUser({ id: u.id, email: u.email ?? null });
        void loadProfile(u.id);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) {
        setUser({ id: u.id, email: u.email ?? null });
        void loadProfile(u.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [demoMode, loadProfile]);

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
      value={{ loading, demoMode, user, profile, signUp, signIn, signInWithOAuth, resetPassword, signOut }}
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
