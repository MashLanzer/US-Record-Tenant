/**
 * Database types (kept in sync with supabase/migrations).
 * Regenerate later with: `supabase gen types typescript` once the CLI is linked.
 */

export type Role = "tenant" | "landlord";

export interface Profile {
  id: string; // = auth.users.id
  role: Role;
  full_name: string | null;
  avatar_initials: string | null;
  trust_score: number;
  identity_verified: boolean;
  created_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  address: string;
  city: string;
  rent: number;
  created_at: string;
}

export interface Lease {
  id: string;
  property_id: string;
  landlord_id: string;
  tenant_id: string | null;
  start_date: string;
  end_date: string | null;
  status: "active" | "past";
  verified: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: "onTime" | "late";
  created_at: string;
}

type TableDef<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile, Partial<Profile> & { id: string }>;
      properties: TableDef<Property, Omit<Property, "id" | "created_at"> & { id?: string; created_at?: string }>;
      leases: TableDef<Lease, Omit<Lease, "id" | "created_at"> & { id?: string; created_at?: string }>;
      payments: TableDef<Payment, Omit<Payment, "id" | "created_at"> & { id?: string; created_at?: string }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
