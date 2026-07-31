"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Shield, Lock } from "lucide-react";
import { useT } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { ThemeToggle, LangToggle } from "@/components/toggles";

export default function SplashScreen() {
  const router = useRouter();
  const t = useT(common);

  useEffect(() => {
    const id = setTimeout(() => router.push("/welcome"), 1900);
    return () => clearTimeout(id);
  }, [router]);

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center px-6"
      style={{ background: "radial-gradient(120% 80% at 50% 20%, var(--brand-tint), var(--canvas))" }}
    >
      <div className="safe-top absolute right-4 top-4 flex items-center gap-2">
        <ThemeToggle />
        <LangToggle />
      </div>

      <motion.button
        onClick={() => router.push("/welcome")}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: [0.98, 1, 0.98], opacity: 1 }}
        transition={{ scale: { repeat: Infinity, duration: 2.4, ease: "easeInOut" }, opacity: { duration: 0.5 } }}
        className="grid h-[84px] w-[84px] place-items-center rounded-[26px] bg-[linear-gradient(135deg,var(--brand-500),var(--brand-700))] shadow-[0_16px_40px_rgba(35,88,201,.45)]"
        aria-label="Continue"
      >
        <Shield className="h-11 w-11 text-white" strokeWidth={2} />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mt-6 text-center"
      >
        <div className="text-[24px] font-extrabold tracking-tight text-ink">{t.appName}</div>
        <div className="mt-1 text-[13px] text-ink-faint">{t.tagline}</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="safe-bottom absolute bottom-10 flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-[11px] font-semibold text-verify"
      >
        <Lock className="h-3.5 w-3.5" />
        {useT({ en: "End-to-end encrypted", es: "Cifrado de extremo a extremo" })}
      </motion.div>
    </div>
  );
}
