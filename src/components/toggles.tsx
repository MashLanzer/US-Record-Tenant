"use client";

import { Moon, Sun, Languages } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        "grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:text-ink",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

export function LangToggle({ className }: { className?: string }) {
  const { locale, toggle } = useLocale();
  return (
    <button
      onClick={toggle}
      aria-label="Switch language"
      className={cn(
        "flex h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-[13px] font-semibold text-ink-soft transition-colors hover:text-ink",
        className,
      )}
    >
      <Languages className="h-[16px] w-[16px]" />
      {locale.toUpperCase()}
    </button>
  );
}
