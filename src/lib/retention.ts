/**
 * Data-retention schedule shown to users (/legal/retention). These windows
 * MUST match the purge logic in supabase/migrations/0017_retention.sql.
 * "Legal hold" items are never auto-deleted; they go only when the user
 * deletes their account, or are preserved while a dispute/claim is open.
 */

export type RetentionRow = {
  key: string;
  en: { data: string; keep: string; basis: string };
  es: { data: string; keep: string; basis: string };
};

export const RETENTION: RetentionRow[] = [
  {
    key: "notifications",
    en: { data: "Read notifications", keep: "180 days", basis: "Transient; auto-deleted." },
    es: { data: "Notificaciones leídas", keep: "180 días", basis: "Transitorias; se eliminan solas." },
  },
  {
    key: "profile_views",
    en: { data: "Access log (who viewed you)", keep: "365 days", basis: "Transparency; then auto-deleted." },
    es: { data: "Registro de accesos (quién te vio)", keep: "365 días", basis: "Transparencia; luego se elimina." },
  },
  {
    key: "access_requests",
    en: { data: "Declined access requests", keep: "90 days", basis: "Then cleared; pending expire at 60 days." },
    es: { data: "Solicitudes de acceso rechazadas", keep: "90 días", basis: "Luego se borran; pendientes expiran a 60 días." },
  },
  {
    key: "facts",
    en: { data: "Facts on record & disputes", keep: "Until account deletion", basis: "Durable record; disputed items on legal hold." },
    es: { data: "Hechos e historial de disputas", keep: "Hasta eliminar la cuenta", basis: "Registro duradero; los disputados en retención legal." },
  },
  {
    key: "adverse_actions",
    en: { data: "Adverse action notices", keep: "Until account deletion", basis: "FCRA-relevant record." },
    es: { data: "Avisos de acción adversa", keep: "Hasta eliminar la cuenta", basis: "Registro relevante para FCRA." },
  },
  {
    key: "consents",
    en: { data: "Consent records", keep: "Immutable, until account deletion", basis: "Legal proof of agreement." },
    es: { data: "Registros de consentimiento", keep: "Inmutables, hasta eliminar la cuenta", basis: "Prueba legal del acuerdo." },
  },
  {
    key: "account",
    en: { data: "Your account & profile", keep: "Until you delete it", basis: "Deleting erases everything you own." },
    es: { data: "Tu cuenta y perfil", keep: "Hasta que la elimines", basis: "Eliminar borra todo lo tuyo." },
  },
];
