"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button, Field, Input } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";

const copy = {
  en: {
    title: "Reset your password",
    subtitle: "It happens. Enter your email and we'll send you a secure link to set a new password.",
    email: "Email",
    emailPh: "you@email.com",
    send: "Send reset link",
    backToLogin: "Back to login",
    sentTitle: "Check your email",
    sentBody: "If an account matches that email, a reset link is on its way. The link expires in 30 minutes.",
  },
  es: {
    title: "Restablece tu contraseña",
    subtitle: "Pasa. Ingresa tu correo y te enviaremos un enlace seguro para crear una nueva contraseña.",
    email: "Correo electrónico",
    emailPh: "tu@correo.com",
    send: "Enviar enlace",
    backToLogin: "Volver a iniciar sesión",
    sentTitle: "Revisa tu correo",
    sentBody: "Si hay una cuenta con ese correo, el enlace está en camino. El enlace vence en 30 minutos.",
  },
};

export default function ForgotPasswordScreen() {
  const c = useT(copy);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <AuthShell showLogo>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="grid h-20 w-20 place-items-center rounded-full bg-verify-tint text-verify"
          >
            <Check className="h-10 w-10" strokeWidth={2.5} />
          </motion.span>
          <h1 className="mt-6 text-[24px] font-extrabold tracking-tight text-ink">{c.sentTitle}</h1>
          <p className="mx-auto mt-2 max-w-[320px] text-[15px] leading-relaxed text-ink-faint">
            {c.sentBody}
          </p>
          <Button href="/login" variant="ghost" size="lg" full className="mt-8 border-transparent">
            {c.backToLogin}
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell showLogo>
      <div className="mb-7">
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{c.title}</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-faint">{c.subtitle}</p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <Field label={c.email}>
          <Input
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={c.emailPh}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Button type="submit" size="lg" full>
          {c.send}
        </Button>
      </form>

      <a href="/login" className="mt-5 block text-center text-sm font-semibold text-brand">
        {c.backToLogin}
      </a>
    </AuthShell>
  );
}
