/**
 * Data-access layer. Talks to Supabase when configured (auth + RLS), and falls
 * back to mock data in demo mode so previews keep working without a backend.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";
import {
  properties as mockProperties,
  payments as mockPayments,
  searchResults as mockSearchResults,
  timeline as mockTimeline,
} from "@/lib/mock";

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

/** A single rental (lease) by id — for the property detail screen. */
export async function fetchRentalById(userId: string, leaseId: string): Promise<Rental | null> {
  const sb = getSupabase();
  if (!sb) {
    const p = mockProperties.find((x) => x.id === leaseId) ?? mockProperties[0];
    return p
      ? {
          id: p.id,
          address: p.address,
          city: p.city,
          rent: p.rent,
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate ?? null,
          verified: p.verified,
          relation: "tenant",
        }
      : null;
  }
  const { data, error } = await sb
    .from("leases")
    .select("id, start_date, end_date, status, verified, landlord_id, property:properties(address, city, rent)")
    .eq("id", leaseId)
    .single();
  if (error || !data) return null;
  const l = data as Record<string, unknown>;
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
}

export type PaymentItem = {
  id: string;
  amount: number;
  status: "onTime" | "late";
  dueDate: string | null;
  monthEn?: string;
  monthEs?: string;
};

function demoPayments(): PaymentItem[] {
  return mockPayments.map((p) => ({
    id: p.id,
    amount: p.amount,
    status: p.status,
    dueDate: null,
    monthEn: p.monthEn,
    monthEs: p.monthEs,
  }));
}

/** Payments for one lease. */
export async function fetchPayments(leaseId: string): Promise<PaymentItem[]> {
  const sb = getSupabase();
  if (!sb) return demoPayments();
  const { data, error } = await sb
    .from("payments")
    .select("id, amount, status, due_date")
    .eq("lease_id", leaseId)
    .order("due_date", { ascending: false });
  if (error || !data) return [];
  return data.map((p: Record<string, unknown>) => ({
    id: p.id as string,
    amount: (p.amount as number) ?? 0,
    status: (p.status as "onTime" | "late") ?? "onTime",
    dueDate: (p.due_date as string) ?? null,
  }));
}

/** Every payment across all of the user's leases (for the Payments screen). */
export async function fetchMyPayments(userId: string): Promise<PaymentItem[]> {
  const sb = getSupabase();
  if (!sb) return demoPayments();
  const { data: leases } = await sb
    .from("leases")
    .select("id")
    .or(`landlord_id.eq.${userId},tenant_id.eq.${userId}`);
  const ids = (leases ?? []).map((l: Record<string, unknown>) => l.id as string);
  if (ids.length === 0) return [];
  const { data, error } = await sb
    .from("payments")
    .select("id, amount, status, due_date")
    .in("lease_id", ids)
    .order("due_date", { ascending: false });
  if (error || !data) return [];
  return data.map((p: Record<string, unknown>) => ({
    id: p.id as string,
    amount: (p.amount as number) ?? 0,
    status: (p.status as "onTime" | "late") ?? "onTime",
    dueDate: (p.due_date as string) ?? null,
  }));
}

/** Record a rent payment against a lease. */
export async function createPayment(
  leaseId: string,
  input: { amount: number; dueDate: string; paidDate: string | null; status: "onTime" | "late" },
): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.from("payments").insert({
    lease_id: leaseId,
    amount: input.amount,
    due_date: input.dueDate,
    paid_date: input.paidDate,
    status: input.status,
  });
  if (error) throw new Error(error.message);
}

export type SearchItem = {
  id: string;
  name: string;
  initials: string;
  role: "tenant" | "landlord";
  score: number;
  verified: boolean;
  location?: string;
};

/** Search verified profiles by name. */
export async function searchProfiles(query: string): Promise<SearchItem[]> {
  const sb = getSupabase();
  if (!sb) {
    const q = query.trim().toLowerCase();
    return mockSearchResults
      .filter((r) => !q || r.name.toLowerCase().includes(q))
      .map((r) => ({
        id: r.id,
        name: r.name,
        initials: r.initials,
        role: r.role,
        score: r.score,
        verified: r.verified,
        location: r.location,
      }));
  }
  let req = sb
    .from("profiles")
    .select("id, full_name, avatar_initials, role, trust_score, identity_verified")
    .order("trust_score", { ascending: false })
    .limit(25);
  const q = query.trim();
  if (q) req = req.ilike("full_name", `%${q}%`);
  const { data, error } = await req;
  if (error || !data) return [];
  return data.map((p: Record<string, unknown>) => ({
    id: p.id as string,
    name: (p.full_name as string) || "—",
    initials: (p.avatar_initials as string) || "?",
    role: (p.role as "tenant" | "landlord") ?? "tenant",
    score: (p.trust_score as number) ?? 70,
    verified: Boolean(p.identity_verified),
  }));
}

export type TimelineItem = {
  id: string;
  kind: "lease" | "payment";
  titleEn: string;
  titleEs: string;
  descEn: string;
  descEs: string;
  date: string;
  tone: "verify" | "brand" | "amber" | "danger";
};

/** A derived activity timeline from the user's leases + payments. */
export async function fetchMyTimeline(userId: string): Promise<TimelineItem[]> {
  const sb = getSupabase();
  if (!sb) {
    return mockTimeline.map((t) => ({
      id: t.id,
      kind: t.type === "payment" ? "payment" : "lease",
      titleEn: t.titleEn,
      titleEs: t.titleEs,
      descEn: t.descEn,
      descEs: t.descEs,
      date: t.date,
      tone: t.tone,
    }));
  }

  const rentals = await fetchMyRentals(userId);
  const items: TimelineItem[] = [];

  for (const r of rentals) {
    items.push({
      id: `lease-${r.id}`,
      kind: "lease",
      titleEn: "Lease started",
      titleEs: "Contrato iniciado",
      descEn: `${r.address} · $${r.rent.toLocaleString()}/mo`,
      descEs: `${r.address} · $${r.rent.toLocaleString()}/mes`,
      date: r.startDate,
      tone: r.verified ? "verify" : "brand",
    });
    const pays = await fetchPayments(r.id);
    for (const p of pays) {
      items.push({
        id: `pay-${p.id}`,
        kind: "payment",
        titleEn: p.status === "late" ? "Late payment" : "Payment recorded",
        titleEs: p.status === "late" ? "Pago tardío" : "Pago registrado",
        descEn: `$${p.amount.toLocaleString()}${p.dueDate ? " · due " + p.dueDate : ""}`,
        descEs: `$${p.amount.toLocaleString()}${p.dueDate ? " · vence " + p.dueDate : ""}`,
        date: p.dueDate ?? r.startDate,
        tone: p.status === "late" ? "amber" : "verify",
      });
    }
  }

  items.sort((a, b) => (a.date < b.date ? 1 : -1));
  return items;
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
