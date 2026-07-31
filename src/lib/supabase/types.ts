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

type Row<T> = T;
type Insert<T> = Partial<T>;
type Update<T> = Partial<T>;

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Row<Profile>; Insert: Insert<Profile>; Update: Update<Profile> };
      properties: { Row: Row<Property>; Insert: Insert<Property>; Update: Update<Property> };
      leases: { Row: Row<Lease>; Insert: Insert<Lease>; Update: Update<Lease> };
      payments: { Row: Row<Payment>; Insert: Insert<Payment>; Update: Update<Payment> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
