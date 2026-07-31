-- ============================================================================
-- Tenant Trust — documents & evidence storage
-- Run in the Supabase SQL editor after 0001–0003.
-- ============================================================================

-- Metadata table for uploaded files.
create table if not exists public.documents (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  lease_id   uuid references public.leases (id) on delete set null,
  name       text not null,
  path       text not null,               -- object path in the 'documents' bucket
  kind       text not null default 'document', -- document | evidence | lease
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "documents_select_own"
  on public.documents for select to authenticated using (auth.uid() = owner_id);
create policy "documents_insert_own"
  on public.documents for insert to authenticated with check (auth.uid() = owner_id);
create policy "documents_delete_own"
  on public.documents for delete to authenticated using (auth.uid() = owner_id);

-- Private storage bucket for the files themselves.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage object policies: a user can only touch files under a folder named
-- with their own user id (path = "<uid>/<file>").
create policy "documents_objects_select_own"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "documents_objects_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "documents_objects_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
