"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Users, Check, type LucideIcon } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth";

const copy = {
  en: {
    slides: [
      { title: "Verified trust, not opinions", body: "Every claim is checked against evidence — no anonymous ratings, no guesswork." },
      { title: "Fair for both sides", body: "Tenants and landlords are treated equally. Both parties can respond before anything is recorded." },
      { title: "Facts backed by evidence", body: "Payments, leases and references — documented, encrypted and yours to share." },
    ],
    create: "Create account",
    haveAccount: "I already have an account",
  },
  es: {
    slides: [
      { title: "Confianza verificada, no opiniones", body: "Cada afirmación se comprueba con evidencia: sin calificaciones anónimas ni suposiciones." },
      { title: "Justo para ambas partes", body: "Inquilinos y propietarios reciben el mismo trato. Ambos pueden responder antes de registrar algo." },
      { title: "Hechos respaldados por evidencia", body: "Pagos, contratos y referencias: documentados, cifrados y tuyos para compartir." },
    ],
    create: "Crear cuenta",
    haveAccount: "Ya tengo una cuenta",
  },
};

const icons: LucideIcon[] = [Shield, Users, Check];

export default function WelcomeScreen() {
  const c = useT(copy);
  const router = useRouter();
  const { user, demoMode } = useAuth();
  const [index, setIndex] = useState(0);

  // If a real session lands here (e.g. after an OAuth redirect), move into the app.
  useEffect(() => {
    if (!demoMode && user) router.replace("/home");
  }, [user, demoMode, router]);
  const last = c.slides.length - 1;
  const slide = c.slides[index];
  const Icon = icons[index];

  const advance = () => setIndex((i) => (i >= last ? 0 : i + 1));

  return (
    <AuthShell showLogo className="justify-between">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <button
          onClick={advance}
          aria-label="Next"
          className="grid h-[128px] w-[128px] place-items-center rounded-[36px] bg-[linear-gradient(135deg,var(--brand-500),var(--brand-700))] shadow-[0_20px_50px_rgba(35,88,201,.4)]"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Icon className="h-16 w-16 text-white" strokeWidth={2} />
            </motion.span>
          </AnimatePresence>
        </button>

        <div className="mt-10 min-h-[140px] px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">
                {slide.title}
              </h1>
              <p className="mx-auto mt-3 max-w-[320px] text-[15px] leading-relaxed text-ink-faint">
                {slide.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center gap-2" role="tablist" aria-label="Slides">
          {c.slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-brand" : "w-2 bg-line-strong",
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <Button href="/register" size="lg" full>
          {c.create}
        </Button>
        <Button href="/login" variant="ghost" size="lg" full className="border-transparent">
          {c.haveAccount}
        </Button>
      </div>
    </AuthShell>
  );
}
