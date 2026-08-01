"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanFace } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button, Field, Input } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

const copy = {
  en: {
    title: "Welcome back",
    subtitle: "Log in to your Tenant Trust account.",
    faceId: "Log in with Face ID",
    email: "Email",
    emailPh: "you@email.com",
    password: "Password",
    passwordPh: "Your password",
    logIn: "Log in",
    loggingIn: "Logging in…",
    genericErr: "Could not log in. Check your details and try again.",
    forgot: "Forgot password?",
    or: "or",
    google: "Continue with Google",
  },
  es: {
    title: "Bienvenido de nuevo",
    subtitle: "Inicia sesión en tu cuenta de Tenant Trust.",
    faceId: "Entrar con Face ID",
    email: "Correo electrónico",
    emailPh: "tu@correo.com",
    password: "Contraseña",
    passwordPh: "Tu contraseña",
    logIn: "Iniciar sesión",
    loggingIn: "Entrando…",
    genericErr: "No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.",
    forgot: "¿Olvidaste tu contraseña?",
    or: "o",
    google: "Continuar con Google",
  },
};

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M21.35 11.1H12v3.8h5.35c-.23 1.4-1.6 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95S8.78 7.1 12 7.1c1.83 0 3.06.78 3.76 1.45l2.57-2.48C16.7 4.55 14.55 3.6 12 3.6 6.98 3.6 2.9 7.68 2.9 12.7S6.98 21.8 12 21.8c5.02 0 8.35-3.53 8.35-8.5 0-.57-.06-1.01-.16-1.44l-.84-.76z" />
    </svg>
  );
}

export default function LoginScreen() {
  const c = useT(copy);
  const router = useRouter();
  const { signIn, signInWithOAuth, demoMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setSubmitting(false);
      return;
    }
    router.push("/home");
  }

  async function handleOAuth(provider: "google" | "apple") {
    if (demoMode) {
      router.push("/home");
      return;
    }
    const { error } = await signInWithOAuth(provider);
    if (error) {
      setError(error);
      return;
    }
    // On web this line isn't reached (full-page redirect); on native it is.
    router.push("/home");
  }

  return (
    <AuthShell showLogo>
      <div className="mb-7">
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{c.title}</h1>
        <p className="mt-1.5 text-[15px] text-ink-faint">{c.subtitle}</p>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        full
        icon={<ScanFace className="h-5 w-5 text-brand" />}
        onClick={() => router.push("/home")}
      >
        {c.faceId}
      </Button>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
        <Field label={c.password}>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder={c.passwordPh}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error && <p className="text-[13px] font-medium text-danger">{error}</p>}

        <Button type="submit" size="lg" full disabled={submitting}>
          {submitting ? c.loggingIn : c.logIn}
        </Button>
      </form>

      <a href="/forgot-password" className="mt-4 block text-center text-sm font-semibold text-brand">
        {c.forgot}
      </a>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">{c.or}</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        full
        icon={<GoogleGlyph />}
        onClick={() => handleOAuth("google")}
      >
        {c.google}
      </Button>
    </AuthShell>
  );
}
