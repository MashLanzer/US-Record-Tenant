"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ScrollText, MessageSquare, User, Shield, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { ThemeToggle, LangToggle } from "@/components/toggles";
import { OfflineBanner } from "@/components/offline-banner";

type NavKey = "home" | "search" | "records" | "messages" | "profile";
const NAV: { key: NavKey; href: string; icon: LucideIcon }[] = [
  { key: "home", href: "/home", icon: Home },
  { key: "search", href: "/search", icon: Search },
  { key: "records", href: "/rentals", icon: ScrollText },
  { key: "messages", href: "/messages", icon: MessageSquare },
  { key: "profile", href: "/profile", icon: User },
];

function isActive(pathname: string, href: string) {
  if (href === "/home") return pathname === "/home";
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useT(common);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1180px]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-line px-4 py-6 lg:flex">
        <Link href="/home" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[linear-gradient(135deg,var(--brand-500),var(--brand-700))] shadow-[var(--shadow-1)]">
            <Shield className="h-[17px] w-[17px] text-white" strokeWidth={2.2} />
          </span>
          <span className="text-[16px] font-bold tracking-tight">{t.appName}</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ key, href, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                  active
                    ? "bg-brand-tint text-brand"
                    : "text-ink-soft hover:bg-surface-3 hover:text-ink",
                )}
              >
                <Icon className="h-[20px] w-[20px]" />
                {t.tabs[key]}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center gap-2 px-1">
          <ThemeToggle />
          <LangToggle />
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        <OfflineBanner />
        <div className="mx-auto w-full max-w-[640px] pb-28 lg:pb-12">{children}</div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-surface/90 px-2 pt-2 backdrop-blur-xl lg:hidden">
        {NAV.map(({ key, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold transition-colors",
                active ? "text-brand" : "text-ink-faint",
              )}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.3 : 1.8} />
              {t.tabs[key]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** Padded screen container used by app screens (inside AppShell). */
export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-4 pt-4", className)}>{children}</div>;
}
