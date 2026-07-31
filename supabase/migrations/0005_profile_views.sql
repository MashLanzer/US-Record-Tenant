-- ============================================================================
-- Tenant Trust — profile view log (the "who accessed your file" transparency)
-- Run in the Supabase SQL editor after 0001–0004.
-- ============================================================================

create table if not exists public.profile_views (
  id         uuid primary key default gen_random_uuid(),
  viewer_id  uuid not null references public.profiles (id) on delete cascade,
  viewed_id  uuid not null references public.profiles (id) on delete cascade,
  reason     text not null default 'profile_view',
  created_at timestamptz not null default now(),
  check (viewer_id <> viewed_id)
);

create index if not exists profile_views_viewed_idx on public.profile_views (viewed_id, created_at desc);

alter table public.profile_views enable row level security;

-- The viewed person can see who looked at their file (transparency).
create policy "profile_views_select_viewed"
  on public.profile_views for select to authenticated
  using (auth.uid() = viewed_id);

-- A viewer records their own view.
create policy "profile_views_insert_viewer"
  on public.profile_views for insert to authenticated
  with check (auth.uid() = viewer_id);
