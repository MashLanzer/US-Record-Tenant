-- ============================================================================
-- Tenant Trust — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Security model: the app talks to Supabase directly from the client, so ALL
-- access control lives here in Row Level Security (RLS). Never disable it.
-- ============================================================================

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  role              text not null default 'tenant' check (role in ('tenant','landlord')),
  full_name         text,
  avatar_initials   text,
  trust_score       int  not null default 70 check (trust_score between 0 and 100),
  identity_verified boolean not null default false,
  created_at        timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Trust profiles are meant to be viewable by other verified users.
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- --------------------------------------------------------------- properties
create table if not exists public.properties (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  address    text not null,
  city       text not null,
  rent       int  not null check (rent >= 0),
  created_at timestamptz not null default now()
);

alter table public.properties enable row level security;

create policy "properties_select_authenticated"
  on public.properties for select to authenticated using (true);

create policy "properties_write_own"
  on public.properties for all to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ------------------------------------------------------------------- leases
create table if not exists public.leases (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  landlord_id uuid not null references public.profiles (id) on delete cascade,
  tenant_id   uuid references public.profiles (id) on delete set null,
  start_date  date not null,
  end_date    date,
  status      text not null default 'active' check (status in ('active','past')),
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.leases enable row level security;

-- Only the two parties to a lease can see it.
create policy "leases_select_parties"
  on public.leases for select to authenticated
  using (auth.uid() = landlord_id or auth.uid() = tenant_id);

create policy "leases_insert_landlord"
  on public.leases for insert to authenticated
  with check (auth.uid() = landlord_id);

create policy "leases_update_landlord"
  on public.leases for update to authenticated
  using (auth.uid() = landlord_id)
  with check (auth.uid() = landlord_id);

-- ----------------------------------------------------------------- payments
create table if not exists public.payments (
  id         uuid primary key default gen_random_uuid(),
  lease_id   uuid not null references public.leases (id) on delete cascade,
  amount     int  not null check (amount >= 0),
  due_date   date not null,
  paid_date  date,
  status     text not null default 'onTime' check (status in ('onTime','late')),
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

-- Visible to whoever is a party to the parent lease.
create policy "payments_select_parties"
  on public.payments for select to authenticated
  using (
    exists (
      select 1 from public.leases l
      where l.id = payments.lease_id
        and (l.landlord_id = auth.uid() or l.tenant_id = auth.uid())
    )
  );

-- ---------------------------------------------------- auto-create a profile
-- When a new auth user signs up, mirror their metadata into public.profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fname text := nullif(new.raw_user_meta_data ->> 'full_name', '');
  base  text := coalesce(fname, split_part(new.email, '@', 1));
begin
  insert into public.profiles (id, role, full_name, avatar_initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'tenant'),
    fname,
    upper(left(base, 2))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
