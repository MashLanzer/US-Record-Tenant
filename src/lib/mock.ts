/**
 * Mock data for the prototype. No backend — everything here simulates a
 * verified rental trust graph so the UI is fully navigable.
 */

export type TrustFactor = {
  key: string;
  labelEn: string;
  labelEs: string;
  score: number;
  tone: "verify" | "brand" | "amber";
};

export type VerificationState = "verified" | "pending" | "locked";

export type Verification = {
  key: string;
  labelEn: string;
  labelEs: string;
  state: VerificationState;
  dateEn?: string;
  dateEs?: string;
};

export type Property = {
  id: string;
  address: string;
  city: string;
  rent: number;
  status: "active" | "past";
  startDate: string;
  endDate?: string;
  counterparty: string;
  verified: boolean;
};

export type Payment = {
  id: string;
  monthEn: string;
  monthEs: string;
  amount: number;
  status: "onTime" | "late";
  date: string;
};

export type TimelineEvent = {
  id: string;
  type: "lease" | "payment" | "report" | "close" | "verify";
  titleEn: string;
  titleEs: string;
  descEn: string;
  descEs: string;
  date: string;
  tone: "verify" | "brand" | "amber" | "danger";
};

export const me = {
  name: "María R.",
  initials: "MR",
  role: "tenant" as const,
  trustScore: 92,
  ratingLabelEn: "Excellent · top 8%",
  ratingLabelEs: "Excelente · top 8%",
  yearsEn: "3 years of history",
  yearsEs: "3 años de historial",
  memberSince: "2022",
};

export const landlordMe = {
  name: "David C.",
  initials: "DC",
  role: "landlord" as const,
  trustScore: 89,
  ratingLabelEn: "Trusted landlord",
  ratingLabelEs: "Propietario confiable",
  properties: 4,
};

export const trustFactors: TrustFactor[] = [
  { key: "punctuality", labelEn: "Payment punctuality", labelEs: "Puntualidad de pago", score: 96, tone: "verify" },
  { key: "care", labelEn: "Property care", labelEs: "Cuidado de la propiedad", score: 90, tone: "verify" },
  { key: "communication", labelEn: "Communication", labelEs: "Comunicación", score: 88, tone: "brand" },
  { key: "contract", labelEn: "Contract compliance", labelEs: "Cumplimiento del contrato", score: 82, tone: "amber" },
];

export const landlordFactors: TrustFactor[] = [
  { key: "deposit", labelEn: "Deposit returns", labelEs: "Devolución de depósito", score: 94, tone: "verify" },
  { key: "repairs", labelEn: "Repairs & maintenance", labelEs: "Reparaciones", score: 86, tone: "brand" },
  { key: "respect", labelEn: "Contract respect", labelEs: "Respeto al contrato", score: 91, tone: "verify" },
  { key: "comms", labelEn: "Communication", labelEs: "Comunicación", score: 84, tone: "amber" },
];

export const verifications: Verification[] = [
  { key: "identity", labelEn: "Government ID", labelEs: "Identidad oficial", state: "verified", dateEn: "Verified May 2024", dateEs: "Verificado may 2024" },
  { key: "selfie", labelEn: "Liveness selfie", labelEs: "Selfie con prueba de vida", state: "verified", dateEn: "Verified May 2024", dateEs: "Verificado may 2024" },
  { key: "address", labelEn: "Proof of address", labelEs: "Comprobante de domicilio", state: "verified", dateEn: "Verified Jun 2024", dateEs: "Verificado jun 2024" },
  { key: "income", labelEn: "Income (bank-linked)", labelEs: "Ingresos (banco)", state: "pending", dateEn: "In review", dateEs: "En revisión" },
  { key: "background", labelEn: "Background check", labelEs: "Antecedentes", state: "locked" },
];

export const properties: Property[] = [
  { id: "p1", address: "742 Ocean Ave, Apt 4B", city: "Brooklyn, NY", rent: 2400, status: "active", startDate: "2023-01-01", counterparty: "David C.", verified: true },
  { id: "p2", address: "18 Maple Street", city: "Austin, TX", rent: 1850, status: "past", startDate: "2020-06-01", endDate: "2022-11-30", counterparty: "Sunrise Property Mgmt", verified: true },
  { id: "p3", address: "305 Pine Court", city: "Denver, CO", rent: 1600, status: "past", startDate: "2018-09-01", endDate: "2020-05-15", counterparty: "Laura M.", verified: false },
];

export const payments: Payment[] = [
  { id: "pay1", monthEn: "December 2024", monthEs: "Diciembre 2024", amount: 2400, status: "onTime", date: "Dec 1" },
  { id: "pay2", monthEn: "November 2024", monthEs: "Noviembre 2024", amount: 2400, status: "onTime", date: "Nov 1" },
  { id: "pay3", monthEn: "October 2024", monthEs: "Octubre 2024", amount: 2400, status: "onTime", date: "Oct 2" },
  { id: "pay4", monthEn: "September 2024", monthEs: "Septiembre 2024", amount: 2400, status: "late", date: "Sep 6" },
  { id: "pay5", monthEn: "August 2024", monthEs: "Agosto 2024", amount: 2400, status: "onTime", date: "Aug 1" },
  { id: "pay6", monthEn: "July 2024", monthEs: "Julio 2024", amount: 2400, status: "onTime", date: "Jul 1" },
];

export const timeline: TimelineEvent[] = [
  { id: "t1", type: "verify", titleEn: "Identity verified", titleEs: "Identidad verificada", descEn: "Government ID + liveness confirmed", descEs: "ID oficial + prueba de vida confirmada", date: "May 2024", tone: "verify" },
  { id: "t2", type: "lease", titleEn: "Lease signed", titleEs: "Contrato firmado", descEn: "742 Ocean Ave · $2,400/mo", descEs: "742 Ocean Ave · $2,400/mes", date: "Jan 2023", tone: "brand" },
  { id: "t3", type: "payment", titleEn: "24 on-time payments", titleEs: "24 pagos puntuales", descEn: "Bank-verified rent ledger", descEs: "Ledger de renta verificado por banco", date: "2023–2024", tone: "verify" },
  { id: "t4", type: "report", titleEn: "Late payment noted", titleEs: "Pago tardío registrado", descEn: "Sep 2024 · with evidence · acknowledged", descEs: "Sep 2024 · con evidencia · reconocido", date: "Sep 2024", tone: "amber" },
];

export const publicProfile = {
  name: "James D.",
  initials: "JD",
  trustScore: 88,
  descEn: "Reliable tenant · 3 years of history",
  descEs: "Inquilino confiable · 3 años de historial",
  highlightsEn: ["Always paid on time", "Left property clean", "No incidents", "Excellent communication"],
  highlightsEs: ["Siempre pagó a tiempo", "Entregó la propiedad limpia", "Sin incidencias", "Excelente comunicación"],
};

export type Conversation = {
  id: string;
  name: string;
  initials: string;
  verified: boolean;
  lastEn: string;
  lastEs: string;
  time: string;
  unread: number;
};

export const conversations: Conversation[] = [
  { id: "c1", name: "David C.", initials: "DC", verified: true, lastEn: "The lease renewal is ready to sign.", lastEs: "La renovación del contrato está lista para firmar.", time: "2m", unread: 2 },
  { id: "c2", name: "Sunrise Property Mgmt", initials: "SP", verified: true, lastEn: "Your deposit was refunded in full.", lastEs: "Tu depósito fue devuelto completo.", time: "1d", unread: 0 },
  { id: "c3", name: "Laura M.", initials: "LM", verified: false, lastEn: "Thanks for the great two years!", lastEs: "¡Gracias por estos dos años!", time: "3d", unread: 0 },
];

export type Notification = {
  id: string;
  type: "verify" | "dispute" | "payment" | "message";
  titleEn: string;
  titleEs: string;
  time: string;
  unread: boolean;
};

export const notifications: Notification[] = [
  { id: "n1", type: "verify", titleEn: "Your contract was verified", titleEs: "Tu contrato fue verificado", time: "2h", unread: true },
  { id: "n2", type: "dispute", titleEn: "New dispute needs your response", titleEs: "Una disputa necesita tu respuesta", time: "5h", unread: true },
  { id: "n3", type: "payment", titleEn: "December rent recorded on time", titleEs: "Renta de diciembre registrada a tiempo", time: "1d", unread: false },
  { id: "n4", type: "message", titleEn: "David C. sent you a message", titleEs: "David C. te envió un mensaje", time: "1d", unread: false },
];

export type SearchResult = {
  id: string;
  name: string;
  initials: string;
  role: "tenant" | "landlord";
  score: number;
  location: string;
  verified: boolean;
};

export const searchResults: SearchResult[] = [
  { id: "s1", name: "James D.", initials: "JD", role: "tenant", score: 88, location: "Brooklyn, NY", verified: true },
  { id: "s2", name: "Ana P.", initials: "AP", role: "tenant", score: 95, location: "Queens, NY", verified: true },
  { id: "s3", name: "Robert K.", initials: "RK", role: "tenant", score: 74, location: "Bronx, NY", verified: false },
  { id: "s4", name: "Maple Ridge Homes", initials: "MR", role: "landlord", score: 91, location: "Manhattan, NY", verified: true },
];

/** Access log for the "Your dossier" transparency screen. */
export const accessLog = [
  { id: "a1", who: "David C.", whenEn: "Today, 9:12 AM", whenEs: "Hoy, 9:12", reasonEn: "Rental application review", reasonEs: "Revisión de solicitud de alquiler" },
  { id: "a2", who: "Sunrise Property Mgmt", whenEn: "Jun 3, 2024", whenEs: "3 jun 2024", reasonEn: "Tenant screening", reasonEs: "Evaluación de inquilino" },
];
