-- ============================================================================
-- Tenant Trust — Fase 7.1/7.2: age (18+), jurisdiction, and an immutable,
-- versioned consent log. Run after 0001–0014.
--   • profiles gains date_of_birth + jurisdiction (US state).
--   • consents is append-only: users can read and insert their own rows, but
--     there is NO update/delete policy, so a recorded consent can't be altered
--     (immutable audit trail of who accepted which document version, when).
-- ============================================================================

alter table public.profiles add column if not exists date_of_birth date;
alter table public.profiles add column if not exists jurisdiction  text;

create table if not exists public.consents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  document    text not null check (document in ('terms','privacy','fcra')),
  version     text not null,
  accepted_at timestamptz not null default now(),
  user_agent  text
);

create index if not exists consents_user_idx on public.consents (user_id, document, accepted_at desc);

alter table public.consents enable row level security;

-- Read your own consent history.
create policy "consents_select_own"
  on public.consents for select to authenticated
  using (user_id = auth.uid());

-- Record your own consent. No update/delete policy → the row is immutable.
create policy "consents_insert_own"
  on public.consents for insert to authenticated
  with check (user_id = auth.uid());

-- Keep the signup trigger in sync: also copy date_of_birth + jurisdiction from
-- the auth metadata captured at registration.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fname text := nullif(new.raw_user_meta_data ->> 'full_name', '');
  base  text := coalesce(fname, split_part(new.email, '@', 1));
  dob   text := nullif(new.raw_user_meta_data ->> 'date_of_birth', '');
  juris text := nullif(new.raw_user_meta_data ->> 'jurisdiction', '');
begin
  insert into public.profiles (id, role, full_name, avatar_initials, date_of_birth, jurisdiction)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'tenant'),
    fname,
    upper(left(base, 2)),
    case when dob ~ '^\d{4}-\d{2}-\d{2}$' then dob::date else null end,
    juris
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
