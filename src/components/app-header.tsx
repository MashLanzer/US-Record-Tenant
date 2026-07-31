"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Top bar for detail / pushed screens. Sticky, blurred, with a back affordance.
 */
export function AppHeader({
  title,
  subtitle,
  back = true,
  backHref,
  right,
  className,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
  backHref?: string;
  right?: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "safe-top sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-canvas/80 px-4 py-3 backdrop-blur-xl backdrop-saturate-150",
        className,
      )}
    >
      {back &&
        (backHref ? (
          <Link
            href={backHref}
            aria-label="Back"
            className="-ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : (
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="-ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ))}
      <div className="min-w-0 flex-1">
        {title && <h1 className="truncate text-[17px] font-bold tracking-tight text-ink">{title}</h1>}
        {subtitle && <p className="truncate text-xs text-ink-faint">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

/** A small labelled section heading used inside screens. */
export function SectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-2.5 mt-6 flex items-baseline justify-between", className)}>
      <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-faint">{children}</h2>
      {action}
    </div>
  );
}
