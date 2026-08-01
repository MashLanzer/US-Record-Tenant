"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";

/**
 * Client-side gate for the authenticated app group.
 *  - No session → /welcome
 *  - Signed in but identity not verified → /verify-identity (nobody skips it,
 *    including Google sign-ins that land straight on /home)
 * Data itself is protected server-side by Supabase RLS; this is for navigation.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, user, profile, demoMode } = useAuth();
  const router = useRouter();

  const needsVerify = !demoMode && !!user && !!profile && !profile.identity_verified;
  const ready = demoMode || (!!user && !!profile && profile.identity_verified);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/welcome");
      return;
    }
    if (needsVerify) router.replace("/verify-identity");
  }, [loading, user, needsVerify, router]);

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas">
        <span className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--brand-500),var(--brand-700))]">
          <Shield className="h-7 w-7 text-white" strokeWidth={2} />
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
