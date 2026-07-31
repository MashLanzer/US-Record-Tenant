import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Supabase browser client.
 *
 * The app ships as a static export (so it can also run natively via Capacitor),
 * so we talk to Supabase directly from the client. Security is enforced by
 * Row Level Security (RLS) policies in the database — never trust the client.
 *
 * If the env vars are not set, the app runs in DEMO MODE (mock data, no real
 * auth) so the prototype stays fully browsable on any deploy.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient<Database>(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }
  return client;
}
