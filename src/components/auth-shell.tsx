"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ThemeToggle, LangToggle } from "@/components/toggles";
import { PageFade } from "@/components/motion";

/**
 * Centered column used by onboarding / auth screens (no tab bar).
 * Mobile-first; on desktop it stays a comfortable, app-like column.
 */
export function AuthShell({
  children,
  showLogo = false,
  className,
}: {
  children: ReactNode;
  showLogo?: boolean;
  className?: string;
}) {
  return (
    <div className="relative min-h-dvh w-full">
      {/* soft brand bloom at the top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[320px]"
        style={{
          background:
            "radial-gradient(70% 100% at 50% 0%, var(--brand-tint) 0%, transparent 70%)",
        }}
      />
      <div className="safe-top absolute right-4 top-4 z-10 flex items-center gap-2">
        <ThemeToggle />
        <LangToggle />
      </div>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-20">
        {showLogo && (
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[linear-gradient(135deg,var(--brand-500),var(--brand-700))] shadow-[var(--shadow-1)]">
              <Shield className="h-[18px] w-[18px] text-white" strokeWidth={2.2} />
            </span>
            <span className="text-[17px] font-bold tracking-tight">Tenant Trust</span>
          </Link>
        )}
        <PageFade className={cn("flex flex-1 flex-col", className)}>{children}</PageFade>
      </div>
    </div>
  );
}
