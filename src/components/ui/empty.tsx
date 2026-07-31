"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Friendly empty state that invites the first action instead of dead-ending. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      <div className="grid h-[74px] w-[74px] place-items-center rounded-[22px] bg-[linear-gradient(135deg,var(--brand-500),var(--brand-700))] shadow-[0_12px_30px_rgba(35,88,201,.4)]">
        <span className="text-white [&>svg]:h-9 [&>svg]:w-9">{icon}</span>
      </div>
      <h2 className="mt-5 text-[17px] font-bold text-ink">{title}</h2>
      {description && (
        <p className="mt-1.5 max-w-[34ch] text-[14px] text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
