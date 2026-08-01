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
  notifications as mockNotifications,
  conversations as mockConversations,
  trustFactors as mockFactors,
  publicProfile as mockPublicProfile,
  accessLog as mockAccessLog,
  me as mockMe,
  type TrustFactor,
} from "@/lib/mock";

export type Rental = {
  id: string;
  propertyId: string | null;
  address: string;
  city: string;
  rent: number;
  status: "active" | "past";
  startDate: string;
  endDate: string | null;
  verified: boolean;
  relation: "landlord" | "tenant";
  tenantId: string | null;
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
      propertyId: p.id,
      address: p.address,
      city: p.city,
      rent: p.rent,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate ?? null,
      verified: p.verified,
      relation: "tenant" as const,
      tenantId: "demo",
    }));
  }

  const { data, error } = await sb
    .from("leases")
    .select("id, property_id, start_date, end_date, status, verified, landlord_id, tenant_id, property:properties(address, city, rent)")
    .or(`landlord_id.eq.${userId},tenant_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((l: Record<string, unknown>) => {
    const prop = (l.property ?? {}) as { address?: string; city?: string; rent?: number };
    return {
      id: l.id as string,
      propertyId: (l.property_id as string) ?? null,
      address: prop.address ?? "—",
      city: prop.city ?? "",
      rent: prop.rent ?? 0,
      status: (l.status as "active" | "past") ?? "active",
      startDate: (l.start_date as string) ?? "",
      endDate: (l.end_date as string) ?? null,
      verified: Boolean(l.verified),
      relation: l.landlord_id === userId ? "landlord" : "tenant",
      tenantId: (l.tenant_id as string) ?? null,
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

  await notify(userId, "contract_added", { address: input.address });
  return lease.id as string;
}

export type RentalUpdate = {
  leaseId: string;
  propertyId: string | null;
  address: string;
  city: string;
  rent: number;
  startDate: string;
  endDate: string | null;
  status: "active" | "past";
};

/** Edit a contract: updates the lease and its property (landlord only, RLS). */
export async function updateRental(input: RentalUpdate): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;

  if (input.propertyId) {
    const { error: e1 } = await db
      .from("properties")
      .update({ address: input.address, city: input.city, rent: input.rent })
      .eq("id", input.propertyId);
    if (e1) throw new Error(e1.message);
  }

  const { error: e2 } = await db
    .from("leases")
    .update({
      start_date: input.startDate,
      end_date: input.status === "past" ? input.endDate : null,
      status: input.status,
    })
    .eq("id", input.leaseId);
  if (e2) throw new Error(e2.message);
}

/**
 * Delete a contract. Deleting the property cascades to its lease, payments,
 * reports, ratings and disputes. Falls back to deleting just the lease if the
 * property id isn't known.
 */
export async function deleteRental(leaseId: string, propertyId: string | null): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  if (propertyId) {
    const { error } = await db.from("properties").delete().eq("id", propertyId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await db.from("leases").delete().eq("id", leaseId);
    if (error) throw new Error(error.message);
  }
}

/** A single rental (lease) by id — for the property detail screen. */
export async function fetchRentalById(userId: string, leaseId: string): Promise<Rental | null> {
  const sb = getSupabase();
  if (!sb) {
    const p = mockProperties.find((x) => x.id === leaseId) ?? mockProperties[0];
    return p
      ? {
          id: p.id,
          propertyId: p.id,
          address: p.address,
          city: p.city,
          rent: p.rent,
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate ?? null,
          verified: p.verified,
          relation: "tenant" as const,
          tenantId: "demo",
        }
      : null;
  }
  const { data, error } = await sb
    .from("leases")
    .select("id, property_id, start_date, end_date, status, verified, landlord_id, tenant_id, property:properties(address, city, rent)")
    .eq("id", leaseId)
    .single();
  if (error || !data) return null;
  const l = data as Record<string, unknown>;
  const prop = (l.property ?? {}) as { address?: string; city?: string; rent?: number };
  return {
    id: l.id as string,
    propertyId: (l.property_id as string) ?? null,
    address: prop.address ?? "—",
    city: prop.city ?? "",
    rent: prop.rent ?? 0,
    status: (l.status as "active" | "past") ?? "active",
    startDate: (l.start_date as string) ?? "",
    endDate: (l.end_date as string) ?? null,
    verified: Boolean(l.verified),
    relation: l.landlord_id === userId ? "landlord" : "tenant",
    tenantId: (l.tenant_id as string) ?? null,
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

  const { data: u } = await typed.auth.getUser();
  if (u.user) await notify(u.user.id, "payment_recorded", { amount: input.amount });
}

/** Edit an existing payment (either lease party, RLS-enforced). */
export async function updatePayment(
  paymentId: string,
  input: { amount: number; dueDate: string; paidDate: string | null; status: "onTime" | "late" },
): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db
    .from("payments")
    .update({
      amount: input.amount,
      due_date: input.dueDate,
      paid_date: input.paidDate,
      status: input.status,
    })
    .eq("id", paymentId);
  if (error) throw new Error(error.message);
}

/** Delete a payment (either lease party, RLS-enforced). */
export async function deletePayment(paymentId: string): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.from("payments").delete().eq("id", paymentId);
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

function shortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

/* --------------------------------------------------------------- notifications */
export type NotificationItem = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read: boolean;
  timeLabel: string;
};

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const sb = getSupabase();
  if (!sb) {
    return mockNotifications.map((n) => ({
      id: n.id,
      type: n.type,
      data: { titleEn: n.titleEn, titleEs: n.titleEs },
      read: !n.unread,
      timeLabel: n.time,
    }));
  }
  const { data, error } = await sb
    .from("notifications")
    .select("id, type, data, read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((n: Record<string, unknown>) => ({
    id: n.id as string,
    type: (n.type as string) ?? "system",
    data: (n.data as Record<string, unknown>) ?? {},
    read: Boolean(n.read),
    timeLabel: shortDate((n.created_at as string) ?? ""),
  }));
}

export async function markNotificationsRead(userId: string): Promise<void> {
  const typed = getSupabase();
  if (!typed) return;
  const db = typed as unknown as SupabaseClient;
  await db.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

/** Best-effort notification insert (self). Never throws. */
async function notify(userId: string, type: string, data: Record<string, unknown> = {}): Promise<void> {
  const typed = getSupabase();
  if (!typed) return;
  try {
    const db = typed as unknown as SupabaseClient;
    await db.from("notifications").insert({ user_id: userId, type, data });
  } catch {
    /* ignore */
  }
}

export function describeNotification(
  item: NotificationItem,
  locale: Locale,
): { title: string; desc: string; tone: "verify" | "brand" | "amber" | "danger" } {
  const es = locale === "es";
  const d = item.data;
  if (d.titleEn || d.titleEs) {
    return { title: (es ? (d.titleEs as string) : (d.titleEn as string)) ?? "", desc: "", tone: "brand" };
  }
  switch (item.type) {
    case "welcome":
      return {
        title: es ? "Bienvenido a Tenant Trust" : "Welcome to Tenant Trust",
        desc: es ? "Verifica tu identidad para subir tu índice de confianza." : "Verify your identity to boost your trust score.",
        tone: "brand",
      };
    case "contract_added":
      return {
        title: es ? "Contrato añadido" : "Contract added",
        desc: (d.address as string) ?? "",
        tone: "verify",
      };
    case "payment_recorded":
      return {
        title: es ? "Pago registrado" : "Payment recorded",
        desc: d.amount ? `$${Number(d.amount).toLocaleString()}` : "",
        tone: "verify",
      };
    case "message":
      return {
        title: es ? "Nuevo mensaje" : "New message",
        desc: (d.from as string) ?? "",
        tone: "brand",
      };
    case "identity_verified":
      return {
        title: es ? "Identidad verificada" : "Identity verified",
        desc: es ? "Tu badge de confianza está activo." : "Your trust badge is now active.",
        tone: "verify",
      };
    case "invitation_accepted":
      return {
        title: es ? "Inquilino confirmó el contrato" : "Tenant confirmed the lease",
        desc: (d.email as string) ?? "",
        tone: "verify",
      };
    case "report_received":
      return {
        title: es ? "Nuevo hecho en tu historial" : "New fact on your record",
        desc: es ? "Puedes verlo y responder." : "You can review and respond.",
        tone: "amber",
      };
    case "rating_received":
      return {
        title: es ? "Recibiste una calificación" : "You received a rating",
        desc: d.overall ? `${d.overall}★` : "",
        tone: "verify",
      };
    case "report_disputed":
      return {
        title: es ? "Un hecho fue disputado" : "A fact was disputed",
        desc: es ? "La otra parte respondió con su versión." : "The other party responded with their side.",
        tone: "amber",
      };
    case "dispute_updated":
      return {
        title: es ? "Nueva respuesta en la disputa" : "New response in the dispute",
        desc: es ? "Se agregó una declaración o evidencia." : "A statement or evidence was added.",
        tone: "amber",
      };
    case "access_requested":
      return {
        title: es ? "Solicitud para ver tu reporte" : "Request to view your report",
        desc: es ? "Alguien pide acceso a tu reporte de confianza." : "Someone asked to see your trust report.",
        tone: "brand",
      };
    case "access_approved":
      return {
        title: es ? "Acceso aprobado" : "Access approved",
        desc: es ? "Ya puedes ver el reporte completo." : "You can now view the full report.",
        tone: "verify",
      };
    case "access_declined":
      return {
        title: es ? "Acceso rechazado" : "Access declined",
        desc: es ? "La solicitud no fue aprobada." : "The request wasn't approved.",
        tone: "amber",
      };
    case "evidence_added":
    case "document_added":
      return {
        title: es ? "Documento subido" : "Document uploaded",
        desc: (d.name as string) ?? "",
        tone: "verify",
      };
    default:
      return { title: item.type, desc: "", tone: "brand" };
  }
}

/* ----------------------------------------------------------------- messaging */
export type ConversationItem = {
  id: string;
  otherName: string;
  otherInitials: string;
  otherVerified: boolean;
  lastBody: string;
  timeLabel: string;
};

export type MessageItem = { id: string; body: string; mine: boolean; timeLabel: string };

export async function fetchConversations(userId: string): Promise<ConversationItem[]> {
  const sb = getSupabase();
  if (!sb) {
    return mockConversations.map((c) => ({
      id: c.id,
      otherName: c.name,
      otherInitials: c.initials,
      otherVerified: c.verified,
      lastBody: c.lastEn,
      timeLabel: c.time,
    }));
  }

  const { data: convs } = await sb
    .from("conversations")
    .select("id, user_a, user_b, created_at")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (!convs || convs.length === 0) return [];

  const convRows = convs as Array<Record<string, unknown>>;
  const otherIds = convRows.map((c) => (c.user_a === userId ? c.user_b : c.user_a) as string);
  const convIds = convRows.map((c) => c.id as string);

  const [{ data: profs }, { data: msgs }] = await Promise.all([
    sb.from("profiles").select("id, full_name, avatar_initials, identity_verified").in("id", otherIds),
    sb.from("messages").select("conversation_id, body, created_at").in("conversation_id", convIds).order("created_at", { ascending: false }),
  ]);

  const profMap = new Map((profs ?? []).map((p: Record<string, unknown>) => [p.id as string, p]));
  const lastByConv = new Map<string, Record<string, unknown>>();
  for (const m of (msgs ?? []) as Array<Record<string, unknown>>) {
    const cid = m.conversation_id as string;
    if (!lastByConv.has(cid)) lastByConv.set(cid, m);
  }

  return convRows.map((c) => {
    const otherId = (c.user_a === userId ? c.user_b : c.user_a) as string;
    const prof = profMap.get(otherId) as Record<string, unknown> | undefined;
    const last = lastByConv.get(c.id as string);
    return {
      id: c.id as string,
      otherName: (prof?.full_name as string) || "—",
      otherInitials: (prof?.avatar_initials as string) || "?",
      otherVerified: Boolean(prof?.identity_verified),
      lastBody: (last?.body as string) ?? "",
      timeLabel: last ? shortDate(last.created_at as string) : shortDate(c.created_at as string),
    };
  });
}

/** Find or create the conversation between the current user and another user. */
export async function fetchOrCreateConversation(userId: string, otherId: string): Promise<string> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const [a, b] = [userId, otherId].sort();

  const { data: existing } = await db
    .from("conversations")
    .select("id")
    .eq("user_a", a)
    .eq("user_b", b)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data: created, error } = await db
    .from("conversations")
    .insert({ user_a: a, user_b: b })
    .select("id")
    .single();
  if (error || !created) throw new Error(error?.message ?? "Could not start conversation");
  return created.id as string;
}

export async function fetchMessages(convId: string, userId: string): Promise<MessageItem[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("messages")
    .select("id, body, sender_id, created_at")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map((m: Record<string, unknown>) => ({
    id: m.id as string,
    body: (m.body as string) ?? "",
    mine: m.sender_id === userId,
    timeLabel: shortDate((m.created_at as string) ?? ""),
  }));
}

export async function sendMessage(convId: string, userId: string, body: string): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.from("messages").insert({ conversation_id: convId, sender_id: userId, body });
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------ documents & storage */
export type DocItem = {
  id: string;
  name: string;
  path: string;
  kind: string;
  timeLabel: string;
};

export async function listDocuments(userId: string, kind?: string): Promise<DocItem[]> {
  const sb = getSupabase();
  if (!sb) {
    return [
      { id: "d1", name: "Lease agreement.pdf", path: "", kind: "lease", timeLabel: "Jan 2023" },
      { id: "d2", name: "Move-in inspection.pdf", path: "", kind: "document", timeLabel: "Jan 2023" },
    ].filter((d) => !kind || d.kind === kind);
  }
  let req = sb
    .from("documents")
    .select("id, name, path, kind, created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (kind) req = req.eq("kind", kind);
  const { data, error } = await req;
  if (error || !data) return [];
  return data.map((d: Record<string, unknown>) => ({
    id: d.id as string,
    name: (d.name as string) ?? "file",
    path: (d.path as string) ?? "",
    kind: (d.kind as string) ?? "document",
    timeLabel: shortDate((d.created_at as string) ?? ""),
  }));
}

export async function uploadDocument(
  userId: string,
  file: File,
  kind: "document" | "evidence" | "lease" | "verification" = "document",
  leaseId?: string,
): Promise<string> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${userId}/${crypto.randomUUID()}-${safeName}`;
  const { error: upErr } = await typed.storage.from("documents").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (upErr) throw new Error(upErr.message);
  const db = typed as unknown as SupabaseClient;
  const { error } = await db
    .from("documents")
    .insert({ owner_id: userId, name: file.name, path, kind, lease_id: leaseId ?? null });
  if (error) throw new Error(error.message);
  await notify(userId, kind === "evidence" ? "evidence_added" : "document_added", { name: file.name });
  return path;
}

/** A short-lived signed URL to view/download a private document. */
export async function getDocumentUrl(path: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb || !path) return null;
  const { data } = await sb.storage.from("documents").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

/** Mark the current user's identity as verified (MVP — real KYC provider TBD). */
export async function updateIdentityVerified(userId: string): Promise<void> {
  const typed = getSupabase();
  if (!typed) return;
  const db = typed as unknown as SupabaseClient;
  await db.from("profiles").update({ identity_verified: true }).eq("id", userId);
  await notify(userId, "identity_verified", {});
}

/* ----------------------------------------------------- recorded facts (reports) */
export type ReportType =
  | "late_payment"
  | "good_payment"
  | "damage"
  | "clean"
  | "contract_violation"
  | "good_communication"
  | "other";

export type ReportItem = {
  id: string;
  leaseId: string;
  type: ReportType;
  description: string | null;
  evidencePath: string | null;
  status: "open" | "disputed" | "resolved";
  direction: "about_me" | "by_me";
  timeLabel: string;
};

export const REPORT_TYPES: { key: ReportType; en: string; es: string; positive: boolean }[] = [
  { key: "good_payment", en: "Paid on time", es: "Pagó a tiempo", positive: true },
  { key: "late_payment", en: "Late payment", es: "Pago tardío", positive: false },
  { key: "clean", en: "Left it clean", es: "Entregó limpio", positive: true },
  { key: "damage", en: "Damage", es: "Daño", positive: false },
  { key: "good_communication", en: "Great communication", es: "Buena comunicación", positive: true },
  { key: "contract_violation", en: "Contract violation", es: "Violó el contrato", positive: false },
  { key: "other", en: "Other", es: "Otro", positive: true },
];

export function reportTypeLabel(type: ReportType, locale: Locale): string {
  const t = REPORT_TYPES.find((x) => x.key === type);
  return t ? (locale === "es" ? t.es : t.en) : type;
}

/** Record a fact about the lease counterparty (subject is derived server-side). */
export async function submitReport(
  leaseId: string,
  type: ReportType,
  description: string,
  evidencePath: string | null,
): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.rpc("submit_report", {
    p_lease_id: leaseId,
    p_type: type,
    p_description: description,
    p_evidence_path: evidencePath,
  });
  if (error) throw new Error(error.message);
}

/** Retract a fact you recorded (author only, RLS-enforced). */
export async function deleteReport(reportId: string): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.from("reports").delete().eq("id", reportId);
  if (error) throw new Error(error.message);
}

/** All facts recorded on a lease (both parties can see them). */
export async function fetchReportsForLease(leaseId: string, userId: string): Promise<ReportItem[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("reports")
    .select("id, lease_id, type, description, evidence_path, status, author_id, created_at")
    .eq("lease_id", leaseId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    leaseId: r.lease_id as string,
    type: r.type as ReportType,
    description: (r.description as string) ?? null,
    evidencePath: (r.evidence_path as string) ?? null,
    status: (r.status as ReportItem["status"]) ?? "open",
    direction: r.author_id === userId ? "by_me" : "about_me",
    timeLabel: shortDate((r.created_at as string) ?? ""),
  }));
}

/** Facts recorded ABOUT the current user (for the dossier / appeals). */
export async function fetchReportsAboutMe(userId: string): Promise<ReportItem[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("reports")
    .select("id, lease_id, type, description, evidence_path, status, author_id, created_at")
    .eq("subject_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    leaseId: r.lease_id as string,
    type: r.type as ReportType,
    description: (r.description as string) ?? null,
    evidencePath: (r.evidence_path as string) ?? null,
    status: (r.status as ReportItem["status"]) ?? "open",
    direction: "about_me" as const,
    timeLabel: shortDate((r.created_at as string) ?? ""),
  }));
}

/* --------------------------------------------------------- disputes / appeals */
export type DisputeEntry = {
  id: string;
  mine: boolean;
  statement: string | null;
  evidencePath: string | null;
  timeLabel: string;
};

export type DisputeCase = {
  reportId: string;
  leaseId: string;
  type: ReportType;
  description: string | null;
  status: "open" | "disputed" | "resolved";
  direction: "about_me" | "by_me";
  address: string;
  timeLabel: string;
  entries: DisputeEntry[];
};

/** Every fact the user is part of (either side), with its dispute thread. */
export async function fetchDisputeCases(userId: string): Promise<DisputeCase[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("reports")
    .select("id, lease_id, type, description, status, author_id, subject_id, created_at, leases(address)")
    .or(`author_id.eq.${userId},subject_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  const reportIds = data.map((r: Record<string, unknown>) => r.id as string);
  const entriesByReport = new Map<string, DisputeEntry[]>();
  if (reportIds.length > 0) {
    const { data: ents } = await sb
      .from("dispute_entries")
      .select("id, report_id, author_id, statement, evidence_path, created_at")
      .in("report_id", reportIds)
      .order("created_at", { ascending: true });
    for (const e of (ents ?? []) as Record<string, unknown>[]) {
      const key = e.report_id as string;
      const arr = entriesByReport.get(key) ?? [];
      arr.push({
        id: e.id as string,
        mine: e.author_id === userId,
        statement: (e.statement as string) ?? null,
        evidencePath: (e.evidence_path as string) ?? null,
        timeLabel: shortDate((e.created_at as string) ?? ""),
      });
      entriesByReport.set(key, arr);
    }
  }

  return data.map((r: Record<string, unknown>) => {
    const lease = r.leases as { address?: string } | { address?: string }[] | null;
    const address = Array.isArray(lease) ? lease[0]?.address ?? "" : lease?.address ?? "";
    return {
      reportId: r.id as string,
      leaseId: r.lease_id as string,
      type: r.type as ReportType,
      description: (r.description as string) ?? null,
      status: (r.status as DisputeCase["status"]) ?? "open",
      direction: r.author_id === userId ? "by_me" : "about_me",
      address,
      timeLabel: shortDate((r.created_at as string) ?? ""),
      entries: entriesByReport.get(r.id as string) ?? [],
    };
  });
}

/** The subject opens a dispute on a fact recorded about them. */
export async function disputeReport(
  reportId: string,
  statement: string,
  evidencePath: string | null,
): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.rpc("dispute_report", {
    p_report_id: reportId,
    p_statement: statement,
    p_evidence_path: evidencePath,
  });
  if (error) throw new Error(error.message);
}

/** Either party adds a statement / evidence to an existing dispute. */
export async function addDisputeEntry(
  reportId: string,
  statement: string,
  evidencePath: string | null,
): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.rpc("add_dispute_entry", {
    p_report_id: reportId,
    p_statement: statement,
    p_evidence_path: evidencePath,
  });
  if (error) throw new Error(error.message);
}

/* --------------------------------------------------------- bilateral ratings */
export type RatingInput = {
  overall: number;
  communication: number;
  reliability: number;
  care: number;
  comment: string;
};

export type MyRating = {
  overall: number;
  communication: number | null;
  reliability: number | null;
  care: number | null;
  comment: string | null;
} | null;

export async function submitRating(leaseId: string, input: RatingInput): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.rpc("submit_rating", {
    p_lease_id: leaseId,
    p_overall: input.overall,
    p_communication: input.communication,
    p_reliability: input.reliability,
    p_care: input.care,
    p_comment: input.comment,
  });
  if (error) throw new Error(error.message);
}

/** The rating the current user has already given on this lease (to edit). */
export async function fetchMyRatingForLease(leaseId: string, userId: string): Promise<MyRating> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("ratings")
    .select("overall, communication, reliability, care, comment")
    .eq("lease_id", leaseId)
    .eq("rater_id", userId)
    .maybeSingle();
  if (!data) return null;
  const r = data as Record<string, unknown>;
  return {
    overall: (r.overall as number) ?? 0,
    communication: (r.communication as number) ?? null,
    reliability: (r.reliability as number) ?? null,
    care: (r.care as number) ?? null,
    comment: (r.comment as string) ?? null,
  };
}

/** Aggregate of ratings received by a user. */
export async function fetchRatingSummary(userId: string): Promise<{ count: number; avg: number }> {
  const sb = getSupabase();
  if (!sb) return { count: 0, avg: 0 };
  const { data } = await sb.from("ratings").select("overall").eq("ratee_id", userId);
  const rows = (data ?? []) as { overall: number }[];
  if (rows.length === 0) return { count: 0, avg: 0 };
  const avg = rows.reduce((s, r) => s + (r.overall ?? 0), 0) / rows.length;
  return { count: rows.length, avg };
}

/* ------------------------------------------------ lease invitations (bilateral) */
export type Invitation = {
  id: string;
  leaseId: string;
  address: string;
  city: string;
  inviterName: string;
  inviteeEmail: string;
  status: "pending" | "accepted" | "declined";
};

/** Landlord invites a tenant (by email) to a lease they own. */
export async function inviteToLease(userId: string, leaseId: string, email: string): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.from("invitations").insert({
    lease_id: leaseId,
    inviter_id: userId,
    invitee_email: email.trim().toLowerCase(),
  });
  if (error) throw new Error(error.message);
}

/** Invitations the landlord has sent for a given lease. */
export async function fetchLeaseInvites(leaseId: string): Promise<Invitation[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("invitations")
    .select("id, invitee_email, status, lease_id")
    .eq("lease_id", leaseId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((v: Record<string, unknown>) => ({
    id: v.id as string,
    leaseId: v.lease_id as string,
    address: "",
    city: "",
    inviterName: "",
    inviteeEmail: v.invitee_email as string,
    status: (v.status as Invitation["status"]) ?? "pending",
  }));
}

/** Pending invitations addressed to the current user's email. */
export async function fetchIncomingInvitations(email: string): Promise<Invitation[]> {
  const sb = getSupabase();
  if (!sb || !email) return [];
  const { data, error } = await sb
    .from("invitations")
    .select(
      "id, invitee_email, status, lease:leases(id, property:properties(address, city)), inviter:profiles!invitations_inviter_id_fkey(full_name)",
    )
    .eq("invitee_email", email.toLowerCase())
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((v: Record<string, unknown>) => {
    const lease = (v.lease ?? {}) as { id?: string; property?: { address?: string; city?: string } };
    const prop = lease.property ?? {};
    const inviter = (v.inviter ?? {}) as { full_name?: string };
    return {
      id: v.id as string,
      leaseId: lease.id ?? "",
      address: prop.address ?? "—",
      city: prop.city ?? "",
      inviterName: inviter.full_name || "A landlord",
      inviteeEmail: v.invitee_email as string,
      status: "pending" as const,
    };
  });
}

export async function acceptInvitation(invId: string): Promise<void> {
  const typed = getSupabase();
  if (!typed) return;
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.rpc("accept_invitation", { inv_id: invId });
  if (error) throw new Error(error.message);
}

export async function declineInvitation(invId: string): Promise<void> {
  const typed = getSupabase();
  if (!typed) return;
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.rpc("decline_invitation", { inv_id: invId });
  if (error) throw new Error(error.message);
}

/* --------------------------------------------------- trust score (computed) */
export type TrustBreakdown = { score: number; factors: TrustFactor[] };

function factorTone(v: number): "verify" | "brand" | "amber" {
  return v >= 85 ? "verify" : v >= 70 ? "brand" : "amber";
}

/** Compute the trust score + factor breakdown from real activity and sync it. */
export async function computeAndSyncTrust(userId: string): Promise<TrustBreakdown> {
  const sb = getSupabase();
  if (!sb) return { score: mockMe.trustScore, factors: mockFactors };

  const [rentals, payments, profRes, ratings] = await Promise.all([
    fetchMyRentals(userId),
    fetchMyPayments(userId),
    sb.from("profiles").select("identity_verified").eq("id", userId).single(),
    fetchRatingSummary(userId),
  ]);
  const idVerified = Boolean((profRes.data as Record<string, unknown> | null)?.identity_verified);

  const payTotal = payments.length;
  const payOnTime = payments.filter((p) => p.status === "onTime").length;
  const punctuality = payTotal > 0 ? Math.round((payOnTime / payTotal) * 100) : 70;
  const verification = idVerified ? 100 : 40;
  const history = Math.min(100, 40 + rentals.length * 25 + (payTotal >= 6 ? 15 : 0));
  const peer = ratings.count > 0 ? Math.round(ratings.avg * 20) : 70;

  const factors: TrustFactor[] = [
    { key: "punctuality", labelEn: "Payment punctuality", labelEs: "Puntualidad de pago", score: punctuality, tone: factorTone(punctuality) },
    { key: "peer", labelEn: "Peer ratings", labelEs: "Calificaciones", score: peer, tone: factorTone(peer) },
    { key: "verification", labelEn: "Verification", labelEs: "Verificación", score: verification, tone: factorTone(verification) },
    { key: "history", labelEn: "History depth", labelEs: "Historial", score: history, tone: factorTone(history) },
  ];

  const score = Math.max(
    40,
    Math.min(100, Math.round(punctuality * 0.3 + peer * 0.25 + verification * 0.25 + history * 0.2)),
  );

  const db = sb as unknown as SupabaseClient;
  await db.from("profiles").update({ trust_score: score }).eq("id", userId);

  return { score, factors };
}

/* ------------------------------------------------------------------- stats */
export type StatsData = {
  score: number;
  rentals: number;
  onTimeRate: number;
  totalPaid: number;
  monthly: { label: string; amount: number }[];
};

export async function fetchStats(userId: string, locale: Locale): Promise<StatsData> {
  const sb = getSupabase();
  if (!sb) {
    const total = mockPayments.reduce((s, p) => s + p.amount, 0);
    return {
      score: mockMe.trustScore,
      rentals: mockProperties.length,
      onTimeRate: 100,
      totalPaid: total,
      monthly: mockPayments.slice(0, 6).reverse().map((p) => ({
        label: (locale === "es" ? p.monthEs : p.monthEn).split(" ")[0].slice(0, 3),
        amount: p.amount,
      })),
    };
  }

  const [rentals, payments, profRes] = await Promise.all([
    fetchMyRentals(userId),
    fetchMyPayments(userId),
    sb.from("profiles").select("trust_score").eq("id", userId).single(),
  ]);
  const total = payments.reduce((s, p) => s + p.amount, 0);
  const onTime = payments.filter((p) => p.status === "onTime").length;

  // Last 6 payments as a simple monthly series (oldest → newest).
  const monthly = [...payments]
    .reverse()
    .slice(-6)
    .map((p) => ({
      label: p.dueDate ? formatMonthYear(p.dueDate, locale).split(" ")[0] : "—",
      amount: p.amount,
    }));

  return {
    score: ((profRes.data as Record<string, unknown> | null)?.trust_score as number) ?? 70,
    rentals: rentals.length,
    onTimeRate: payments.length > 0 ? Math.round((onTime / payments.length) * 100) : 0,
    totalPaid: total,
    monthly,
  };
}

/* --------------------------------------------------- public trust profile */
export type PublicProfileData = {
  id: string;
  name: string;
  initials: string;
  score: number;
  verified: boolean;
  role: "tenant" | "landlord";
  memberYear: string;
};

export async function fetchPublicProfile(id: string): Promise<PublicProfileData | null> {
  const sb = getSupabase();
  if (!sb || !id) {
    return {
      id: "demo",
      name: mockPublicProfile.name,
      initials: mockPublicProfile.initials,
      score: mockPublicProfile.trustScore,
      verified: true,
      role: "tenant",
      memberYear: "2021",
    };
  }
  const { data, error } = await sb
    .from("profiles")
    .select("id, full_name, avatar_initials, trust_score, identity_verified, role, created_at")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  const p = data as Record<string, unknown>;
  return {
    id: p.id as string,
    name: (p.full_name as string) || "—",
    initials: (p.avatar_initials as string) || "?",
    score: (p.trust_score as number) ?? 70,
    verified: Boolean(p.identity_verified),
    role: (p.role as "tenant" | "landlord") ?? "tenant",
    memberYear: p.created_at ? new Date(p.created_at as string).getFullYear().toString() : "—",
  };
}

/** Record that the current user viewed someone's profile (transparency log). */
export async function recordProfileView(viewerId: string, viewedId: string): Promise<void> {
  const typed = getSupabase();
  if (!typed || viewerId === viewedId) return;
  try {
    const db = typed as unknown as SupabaseClient;
    await db.from("profile_views").insert({ viewer_id: viewerId, viewed_id: viewedId });
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------- access log */
export type AccessLogItem = { id: string; who: string; whenLabel: string; reason: string };

export async function fetchAccessLog(userId: string, locale: Locale): Promise<AccessLogItem[]> {
  const sb = getSupabase();
  if (!sb) {
    return mockAccessLog.map((a) => ({
      id: a.id,
      who: a.who,
      whenLabel: locale === "es" ? a.whenEs : a.whenEn,
      reason: locale === "es" ? a.reasonEs : a.reasonEn,
    }));
  }
  const { data, error } = await sb
    .from("profile_views")
    .select("id, reason, created_at, viewer:profiles!profile_views_viewer_id_fkey(full_name)")
    .eq("viewed_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error || !data) return [];
  return data.map((v: Record<string, unknown>) => {
    const viewer = (v.viewer ?? {}) as { full_name?: string };
    return {
      id: v.id as string,
      who: viewer.full_name || (locale === "es" ? "Alguien" : "Someone"),
      whenLabel: shortDate((v.created_at as string) ?? ""),
      reason: locale === "es" ? "Vio tu perfil de confianza" : "Viewed your trust profile",
    };
  });
}

/* ------------------------------------------------ consent-based screening */
export type AccessStatus = "self" | "none" | "pending" | "approved" | "declined";

/** The current user's access status toward a subject's full trust report. */
export async function fetchAccessStatus(userId: string, subjectId: string): Promise<AccessStatus> {
  if (userId === subjectId) return "self";
  const sb = getSupabase();
  if (!sb) return "none";
  const { data } = await sb
    .from("access_requests")
    .select("status")
    .eq("requester_id", userId)
    .eq("subject_id", subjectId)
    .maybeSingle();
  const status = (data as { status?: string } | null)?.status;
  if (status === "pending" || status === "approved" || status === "declined") return status;
  return "none";
}

/** Ask a subject for access to their full trust report. */
export async function requestAccess(subjectId: string, message: string): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.rpc("request_access", { p_subject: subjectId, p_message: message });
  if (error) throw new Error(error.message);
}

export type TrustReport = {
  leases: number;
  verifiedLeases: number;
  payments: number;
  onTimeRate: number | null;
  ratingCount: number;
  ratingAvg: number;
  facts: number;
  disputes: number;
};

/** Pull a subject's aggregated report. Returns null when access is not granted. */
export async function fetchTrustReport(subjectId: string): Promise<TrustReport | null> {
  const typed = getSupabase();
  if (!typed) return null;
  const db = typed as unknown as SupabaseClient;
  const { data, error } = await db.rpc("get_trust_report", { p_subject: subjectId });
  if (error || !data) return null;
  const r = data as Record<string, unknown>;
  return {
    leases: (r.leases as number) ?? 0,
    verifiedLeases: (r.verified_leases as number) ?? 0,
    payments: (r.payments as number) ?? 0,
    onTimeRate: (r.on_time_rate as number) ?? null,
    ratingCount: (r.rating_count as number) ?? 0,
    ratingAvg: Number(r.rating_avg ?? 0),
    facts: (r.facts as number) ?? 0,
    disputes: (r.disputes as number) ?? 0,
  };
}

export type AccessRequestItem = {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterInitials: string;
  message: string | null;
  timeLabel: string;
};

/** Pending access requests addressed to the current user (for the home feed). */
export async function fetchIncomingAccessRequests(userId: string): Promise<AccessRequestItem[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("access_requests")
    .select("id, requester_id, message, created_at, requester:profiles!access_requests_requester_id_fkey(full_name, avatar_initials)")
    .eq("subject_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((a: Record<string, unknown>) => {
    const req = (a.requester ?? {}) as { full_name?: string; avatar_initials?: string };
    return {
      id: a.id as string,
      requesterId: a.requester_id as string,
      requesterName: req.full_name || "—",
      requesterInitials: req.avatar_initials || "?",
      message: (a.message as string) ?? null,
      timeLabel: shortDate((a.created_at as string) ?? ""),
    };
  });
}

/** Approve or decline an access request addressed to the current user. */
export async function respondAccessRequest(requestId: string, approve: boolean): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db.rpc("respond_access", { p_request: requestId, p_approve: approve });
  if (error) throw new Error(error.message);
}

/* --------------------------------------------------------------- profile edit */
export type ProfileUpdate = {
  full_name: string;
  phone: string;
  bio: string;
  avatar_initials: string;
};

/** Update the signed-in user's own profile (RLS: profiles_update_own). */
export async function updateProfile(userId: string, patch: ProfileUpdate): Promise<void> {
  const typed = getSupabase();
  if (!typed) throw new Error("demo-mode");
  const db = typed as unknown as SupabaseClient;
  const { error } = await db
    .from("profiles")
    .update({
      full_name: patch.full_name.trim() || null,
      phone: patch.phone.trim() || null,
      bio: patch.bio.trim() || null,
      avatar_initials: patch.avatar_initials.trim().slice(0, 2).toUpperCase() || null,
    })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

/** Change the signed-in user's password (requires a live session). */
export async function updatePassword(newPassword: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error("demo-mode");
  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
