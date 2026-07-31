"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";

/**
 * Client-side route guard for the authenticated app group. Redirects to
 * /welcome when there is no session. (Data itself is protected server-side by
 * Supabase RLS; this guard is for UX/navigation.) In demo mode it's a no-op.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/welcome");
  }, [loading, user, router]);

  if (loading || !user) {
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
