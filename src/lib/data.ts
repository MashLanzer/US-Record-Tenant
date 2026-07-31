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

  await notify(userId, "contract_added", { address: input.address });
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

  const { data: u } = await typed.auth.getUser();
  if (u.user) await notify(u.user.id, "payment_recorded", { amount: input.amount });
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
  kind: "document" | "evidence" | "lease" = "document",
  leaseId?: string,
): Promise<void> {
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
