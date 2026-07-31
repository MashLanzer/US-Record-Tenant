-- ============================================================================
-- Tenant Trust — messaging + notifications
-- Run this in the Supabase SQL editor after 0001 and 0002.
-- ============================================================================

-- ------------------------------------------------------------ notifications
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       text not null,               -- e.g. welcome, contract_added, payment_recorded, message
  data       jsonb not null default '{}', -- structured details; the client localizes
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "notifications_insert_own"
  on public.notifications for insert to authenticated with check (auth.uid() = user_id);
create policy "notifications_update_own"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------ conversations
-- The pair is normalized (user_a < user_b) so there is only ever one row per pair.
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references public.profiles (id) on delete cascade,
  user_b     uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a <> user_b)
);

alter table public.conversations enable row level security;

create policy "conversations_select_party"
  on public.conversations for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);
create policy "conversations_insert_party"
  on public.conversations for insert to authenticated
  with check (auth.uid() = user_a or auth.uid() = user_b);

-- ----------------------------------------------------------------- messages
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 4000),
  created_at      timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages_select_party"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );
create policy "messages_insert_party"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- ------------------------------------ create a welcome notification on signup
-- Replaces the 0001 function to also seed a first notification.
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

  insert into public.notifications (user_id, type)
  values (new.id, 'welcome');

  return new;
end;
$$;
