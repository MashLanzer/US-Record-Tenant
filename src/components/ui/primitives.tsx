"use client";

import Link from "next/link";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/* ---------------------------------------------------------------- Button */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const btnBase =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none select-none";
const btnVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-[0_4px_14px_rgba(35,88,201,.35)] hover:bg-brand-700",
  secondary: "bg-surface-3 text-ink hover:brightness-95",
  ghost: "bg-transparent text-brand border border-line-strong hover:bg-surface-3",
  danger: "bg-danger text-white hover:brightness-95",
};
const btnSizes: Record<ButtonSize, string> = {
  sm: "text-sm px-3.5 py-2",
  md: "text-[15px] px-4.5 py-3",
  lg: "text-base px-5 py-3.5",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  href?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  full,
  href,
  icon,
  iconRight,
  className,
  children,
  ...props
}: ButtonProps) {
  const cls = cn(btnBase, btnVariants[variant], btnSizes[size], full && "w-full", className);
  const content = (
    <>
      {icon}
      {children}
      {iconRight}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button className={cls} {...props}>
      {content}
    </button>
  );
}

/* ----------------------------------------------------------------- Chip */
type ChipTone = "verify" | "pending" | "dispute" | "brand" | "neutral" | "premium";
const chipTones: Record<ChipTone, string> = {
  verify: "bg-verify-tint text-verify border-verify/30",
  pending: "bg-amber-tint text-amber border-amber/30",
  dispute: "bg-danger-tint text-danger border-danger/30",
  brand: "bg-brand-tint text-brand border-brand/25",
  neutral: "bg-surface-3 text-ink-soft border-transparent",
  premium: "bg-violet-tint text-violet border-violet/25",
};

export function Chip({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: ChipTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        chipTones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------- Card */
export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-[var(--shadow-1)]",
        onClick && "cursor-pointer transition-all hover:shadow-[var(--shadow-2)] active:scale-[.99]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- Input */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border-[1.5px] border-line-strong bg-surface-2 px-3.5 py-3 text-[15px] text-ink",
          "placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-tint",
          className,
        )}
        {...props}
      />
    );
  },
);

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-semibold text-ink-soft">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

/* ------------------------------------------------------- SegmentedControl */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" className={cn("inline-flex gap-1 rounded-xl bg-surface-3 p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
            value === o.value
              ? "bg-surface text-ink shadow-[var(--shadow-1)]"
              : "text-ink-soft",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Toggle */
export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors",
        checked ? "bg-brand" : "bg-line-strong",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] h-5 w-5 rounded-full bg-white shadow-[var(--shadow-1)] transition-all",
          checked ? "left-[21px]" : "left-[3px]",
        )}
      />
    </button>
  );
}

/* --------------------------------------------------------------- Avatar */
export function Avatar({
  initials,
  size = 40,
  verified,
  className,
}: {
  initials: string;
  size?: number;
  verified?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-[28%] font-bold text-brand",
        "bg-[linear-gradient(135deg,var(--brand-tint-2),var(--violet-tint))]",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
      {verified && (
        <span
          className="absolute -bottom-1 -right-1 grid place-items-center rounded-full border-2 border-surface bg-verify"
          style={{ width: size * 0.42, height: size * 0.42 }}
        >
          <Check className="text-white" strokeWidth={3} style={{ width: size * 0.24, height: size * 0.24 }} />
        </span>
      )}
    </span>
  );
}

/* -------------------------------------------------------------- StatCard */
export function StatCard({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: ReactNode;
  tone?: "ink" | "verify" | "brand" | "danger";
}) {
  const toneCls = {
    ink: "text-ink",
    verify: "text-verify",
    brand: "text-brand",
    danger: "text-danger",
  }[tone];
  return (
    <Card className="flex-1 p-4">
      <div className="text-xs text-ink-faint">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold tnum", toneCls)}>{value}</div>
    </Card>
  );
}

/* -------------------------------------------------------------- ListRow */
export function ListRow({
  icon,
  title,
  subtitle,
  right,
  href,
  onClick,
  tone = "brand",
}: {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  href?: string;
  onClick?: () => void;
  tone?: "brand" | "verify" | "amber" | "danger" | "neutral";
}) {
  const iconTone = {
    brand: "bg-brand-tint text-brand",
    verify: "bg-verify-tint text-verify",
    amber: "bg-amber-tint text-amber",
    danger: "bg-danger-tint text-danger",
    neutral: "bg-surface-3 text-ink-soft",
  }[tone];

  const inner = (
    <div className="flex items-center gap-3 py-1">
      {icon && (
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", iconTone)}>
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold text-ink">{title}</div>
        {subtitle && <div className="truncate text-[13px] text-ink-faint">{subtitle}</div>}
      </div>
      {right}
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  if (onClick)
    return (
      <button onClick={onClick} className="w-full text-left">
        {inner}
      </button>
    );
  return inner;
}

/* -------------------------------------------------------------- Skeleton */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}
