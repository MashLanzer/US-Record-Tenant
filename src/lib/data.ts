/**
 * Data-access layer. Talks to Supabase when configured (auth + RLS), and falls
 * back to mock data in demo mode so previews keep working without a backend.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";
import { properties as mockProperties } from "@/lib/mock";

export type Rental = {
  id: string;
  address: string;
  city: string;
  rent: number;
  status: "active" | "past";
  startDate: string;
  endDate: string | null;
  verified: boolean;
  relation: "landlord" | "tenant";
};

export type NewRentalInput = {
  address: string;
  city: string;
  rent: number;
  startDate: string; // yyyy-mm-dd
  endDate?: string | null;
  status: "active" | "past";
};

/** Rentals the current user is a party to (owned properties + leases). */
export async function fetchMyRentals(userId: string): Promise<Rental[]> {
  const sb = getSupabase();
  if (!sb) {
    // demo mode → adapt the mock properties into the Rental shape
    return mockProperties.map((p) => ({
      id: p.id,
      address: p.address,
      city: p.city,
      rent: p.rent,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate ?? null,
      verified: p.verified,
      relation: "tenant",
    }));
  }

  const { data, error } = await sb
    .from("leases")
    .select("id, start_date, end_date, status, verified, landlord_id, property:properties(address, city, rent)")
    .or(`landlord_id.eq.${userId},tenant_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((l: Record<string, unknown>) => {
    const prop = (l.property ?? {}) as { address?: string; city?: string; rent?: number };
    return {
      id: l.id as string,
      address: prop.address ?? "—",
      city: prop.city ?? "",
      rent: prop.rent ?? 0,
      status: (l.status as "active" | "past") ?? "active",
      startDate: (l.start_date as string) ?? "",
      endDate: (l.end_date as string) ?? null,
      verified: Boolean(l.verified),
      relation: l.landlord_id === userId ? "landlord" : "tenant",
    };
  });
}

/** Create a property + its lease (current user is the landlord). Returns lease id. */
export async function createRental(userId: string, input: NewRentalInput): Promise<string> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  // Use an untyped view for writes (RLS still enforces access server-side).
  const db = typed as unknown as SupabaseClient;

  const { data: prop, error: e1 } = await db
    .from("properties")
    .insert({ owner_id: userId, address: input.address, city: input.city, rent: input.rent })
    .select("id")
    .single();
  if (e1 || !prop) throw new Error(e1?.message ?? "Could not create property");

  const { data: lease, error: e2 } = await db
    .from("leases")
    .insert({
      property_id: prop.id,
      landlord_id: userId,
      start_date: input.startDate,
      end_date: input.endDate ?? null,
      status: input.status,
    })
    .select("id")
    .single();
  if (e2 || !lease) throw new Error(e2?.message ?? "Could not create lease");

  return lease.id as string;
}

/** A human trust-tier label derived from a score. */
export function trustLabel(score: number, locale: Locale): string {
  if (locale === "es") {
    if (score >= 90) return "Excelente";
    if (score >= 75) return "Confiable";
    if (score >= 60) return "En construcción";
    return "Nuevo";
  }
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Trusted";
  if (score >= 60) return "Building";
  return "New";
}

/** Format a yyyy-mm-dd string as "Mon YYYY" in the given locale. */
export function formatMonthYear(date: string | null, locale: Locale): string {
  if (!date) return locale === "es" ? "Actual" : "Present";
  const [y, m] = date.split("-").map(Number);
  if (!y || !m) return date;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { month: "short", year: "numeric" });
}
