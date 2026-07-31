"use client";

import { useState } from "react";
import { Apple, Check } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button, Field, Input, SegmentedControl } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { common } from "@/lib/i18n/common";
import { cn } from "@/lib/cn";

type Role = "tenant" | "landlord";

const copy = {
  en: {
    title: "Create your account",
    subtitle: "One profile, verified once — trusted everywhere.",
    role: "I am a",
    email: "Email",
    emailPh: "you@email.com",
    password: "Password",
    passwordPh: "Create a password",
    passwordHint: "At least 8 characters.",
    apple: "Continue with Apple",
    google: "Continue with Google",
    or: "or",
    agree: "I agree to the Terms & Privacy Policy.",
    create: "Create account",
  },
  es: {
    title: "Crea tu cuenta",
    subtitle: "Un perfil, verificado una vez: confiable en todas partes.",
    role: "Soy",
    email: "Correo electrónico",
    emailPh: "tu@correo.com",
    password: "Contraseña",
    passwordPh: "Crea una contraseña",
    passwordHint: "Al menos 8 caracteres.",
    apple: "Continuar con Apple",
    google: "Continuar con Google",
    or: "o",
    agree: "Acepto los Términos y la Política de Privacidad.",
    create: "Crear cuenta",
  },
};

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M21.35 11.1H12v3.8h5.35c-.23 1.4-1.6 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95S8.78 7.1 12 7.1c1.83 0 3.06.78 3.76 1.45l2.57-2.48C16.7 4.55 14.55 3.6 12 3.6 6.98 3.6 2.9 7.68 2.9 12.7S6.98 21.8 12 21.8c5.02 0 8.35-3.53 8.35-8.5 0-.57-.06-1.01-.16-1.44l-.84-.76z" />
    </svg>
  );
}

export default function RegisterScreen() {
  const c = useT(copy);
  const g = useT(common);
  const [role, setRole] = useState<Role>("tenant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const roleOptions: { value: Role; label: string }[] = [
    { value: "tenant", label: g.roles.tenant },
    { value: "landlord", label: g.roles.landlord },
  ];

  return (
    <AuthShell showLogo>
      <div className="mb-7">
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{c.title}</h1>
        <p className="mt-1.5 text-[15px] text-ink-faint">{c.subtitle}</p>
      </div>

      <div className="space-y-5">
        <div>
          <span className="mb-1.5 block text-[12.5px] font-semibold text-ink-soft">{c.role}</span>
          <SegmentedControl options={roleOptions} value={role} onChange={setRole} className="w-full" />
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
          <Field label={c.password} hint={c.passwordHint}>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder={c.passwordPh}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </form>
      </div>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">{c.or}</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="space-y-3">
        <Button variant="secondary" size="lg" full icon={<Apple className="h-5 w-5 text-ink" />}>
          {c.apple}
        </Button>
        <Button variant="secondary" size="lg" full icon={<GoogleGlyph />}>
          {c.google}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setAgreed((v) => !v)}
        className="mt-6 flex w-full items-start gap-3 text-left"
        aria-pressed={agreed}
      >
        <span
          className={cn(
            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-[1.5px] transition-colors",
            agreed ? "border-brand bg-brand text-white" : "border-line-strong bg-surface-2 text-transparent",
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        <span className="text-[13px] leading-snug text-ink-soft">{c.agree}</span>
      </button>

      {agreed ? (
        <Button href="/verify-identity" size="lg" full className="mt-6">
          {c.create}
        </Button>
      ) : (
        <Button size="lg" full disabled className="mt-6">
          {c.create}
        </Button>
      )}
    </AuthShell>
  );
}
