import type { Profile } from "@/lib/supabase/types";
import type { Locale } from "@/lib/i18n";

/** Display name for the signed-in user — never falls back to demo data. */
export function displayName(
  profile: Profile | null,
  email: string | null | undefined,
  locale: Locale,
): string {
  if (profile?.full_name) return profile.full_name;
  if (email) return email.split("@")[0];
  return locale === "es" ? "Tú" : "You";
}

/** Two-letter avatar initials derived from the real profile / email. */
export function displayInitials(profile: Profile | null, email: string | null | undefined): string {
  if (profile?.avatar_initials) return profile.avatar_initials;
  const base = profile?.full_name || (email ? email.split("@")[0] : "");
  return base ? base.slice(0, 2).toUpperCase() : "?";
}
