-- ============================================================================
-- Tenant Trust — bilateral ratings. Each party rates the other on a lease.
-- Ratings feed the counterparty's trust score. Run after 0001–0007.
-- ============================================================================

create table if not exists public.ratings (
  id            uuid primary key default gen_random_uuid(),
  lease_id      uuid not null references public.leases (id) on delete cascade,
  rater_id      uuid not null references public.profiles (id) on delete cascade,
  ratee_id      uuid not null references public.profiles (id) on delete cascade,
  overall       int not null check (overall between 1 and 5),
  communication int check (communication between 1 and 5),
  reliability   int check (reliability between 1 and 5),
  care          int check (care between 1 and 5),
  comment       text,
  created_at    timestamptz not null default now(),
  unique (lease_id, rater_id)
);

create index if not exists ratings_ratee_idx on public.ratings (ratee_id);

alter table public.ratings enable row level security;

create policy "ratings_select"
  on public.ratings for select to authenticated
  using (rater_id = auth.uid() or ratee_id = auth.uid());

-- Submit / update a rating for the lease counterparty (one per rater per lease).
create or replace function public.submit_rating(
  p_lease_id uuid,
  p_overall int,
  p_communication int,
  p_reliability int,
  p_care int,
  p_comment text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  l       public.leases;
  v_ratee uuid;
begin
  select * into l from public.leases where id = p_lease_id;
  if l.id is null then raise exception 'Lease not found'; end if;

  if l.landlord_id = auth.uid() then
    v_ratee := l.tenant_id;
  elsif l.tenant_id = auth.uid() then
    v_ratee := l.landlord_id;
  else
    raise exception 'You are not part of this lease';
  end if;
  if v_ratee is null then raise exception 'This lease has no counterparty yet'; end if;

  insert into public.ratings (lease_id, rater_id, ratee_id, overall, communication, reliability, care, comment)
  values (p_lease_id, auth.uid(), v_ratee, p_overall, p_communication, p_reliability, p_care, nullif(p_comment, ''))
  on conflict (lease_id, rater_id) do update
    set overall = excluded.overall,
        communication = excluded.communication,
        reliability = excluded.reliability,
        care = excluded.care,
        comment = excluded.comment,
        created_at = now();

  insert into public.notifications (user_id, type, data)
  values (v_ratee, 'rating_received', jsonb_build_object('overall', p_overall));
end;
$$;

grant execute on function public.submit_rating(uuid, int, int, int, int, text) to authenticated;
