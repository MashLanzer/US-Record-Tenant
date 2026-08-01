-- ============================================================================
-- Tenant Trust — consent-based screening. Run after 0001–0012.
-- A user requests access to another user's full trust report; the subject
-- approves or declines. Only with an approval (or a shared lease) can the
-- requester pull the aggregated report. Facts stay owned by their subject.
-- ============================================================================

create table if not exists public.access_requests (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  subject_id   uuid not null references public.profiles (id) on delete cascade,
  message      text,
  status       text not null default 'pending' check (status in ('pending','approved','declined')),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> subject_id),
  unique (requester_id, subject_id)
);

create index if not exists access_requests_subject_idx
  on public.access_requests (subject_id, status, created_at desc);

alter table public.access_requests enable row level security;

-- Both parties of a request can read it.
create policy "access_requests_select"
  on public.access_requests for select to authenticated
  using (requester_id = auth.uid() or subject_id = auth.uid());

-- Request (or re-request) access to someone's report.
create or replace function public.request_access(p_subject uuid, p_message text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_subject = auth.uid() then raise exception 'Cannot request your own report'; end if;
  if not exists (select 1 from public.profiles where id = p_subject) then
    raise exception 'Profile not found';
  end if;

  insert into public.access_requests (requester_id, subject_id, message, status, responded_at)
  values (auth.uid(), p_subject, nullif(p_message, ''), 'pending', null)
  on conflict (requester_id, subject_id) do update
    set status = 'pending', message = excluded.message, created_at = now(), responded_at = null;

  insert into public.notifications (user_id, type, data)
  values (p_subject, 'access_requested', '{}'::jsonb);
end;
$$;

grant execute on function public.request_access(uuid, text) to authenticated;

-- Subject approves or declines a pending request.
create or replace function public.respond_access(p_request uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.access_requests;
begin
  select * into r from public.access_requests where id = p_request;
  if r.id is null then raise exception 'Request not found'; end if;
  if r.subject_id <> auth.uid() then raise exception 'Not your request to answer'; end if;

  update public.access_requests
    set status = case when p_approve then 'approved' else 'declined' end,
        responded_at = now()
  where id = p_request;

  insert into public.notifications (user_id, type, data)
  values (r.requester_id, case when p_approve then 'access_approved' else 'access_declined' end, '{}'::jsonb);
end;
$$;

grant execute on function public.respond_access(uuid, boolean) to authenticated;

-- Whether the caller may see a subject's report: self, an approved request,
-- or a shared lease (they are already counterparties).
create or replace function public.has_report_access(p_subject uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    p_subject = auth.uid()
    or exists (
      select 1 from public.access_requests ar
      where ar.requester_id = auth.uid() and ar.subject_id = p_subject and ar.status = 'approved'
    )
    or exists (
      select 1 from public.leases l
      where (l.landlord_id = auth.uid() and l.tenant_id = p_subject)
         or (l.tenant_id = auth.uid() and l.landlord_id = p_subject)
    );
$$;

grant execute on function public.has_report_access(uuid) to authenticated;

-- Aggregated, privacy-preserving trust report. Raw facts are never returned —
-- only counts and rates. Access-gated by has_report_access().
create or replace function public.get_trust_report(p_subject uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_leases        int;
  v_verified      int;
  v_pay_total     int;
  v_pay_ontime    int;
  v_rating_count  int;
  v_rating_avg    numeric;
  v_facts         int;
  v_disputes      int;
begin
  if not public.has_report_access(p_subject) then
    raise exception 'No access to this report';
  end if;

  select count(*),
         count(*) filter (where verified)
    into v_leases, v_verified
  from public.leases
  where landlord_id = p_subject or tenant_id = p_subject;

  select count(*),
         count(*) filter (where p.status = 'onTime')
    into v_pay_total, v_pay_ontime
  from public.payments p
  join public.leases l on l.id = p.lease_id
  where l.landlord_id = p_subject or l.tenant_id = p_subject;

  select count(*), coalesce(avg(overall), 0)
    into v_rating_count, v_rating_avg
  from public.ratings where ratee_id = p_subject;

  select count(*), count(*) filter (where status = 'disputed')
    into v_facts, v_disputes
  from public.reports where subject_id = p_subject;

  return jsonb_build_object(
    'leases', v_leases,
    'verified_leases', v_verified,
    'payments', v_pay_total,
    'on_time_rate', case when v_pay_total > 0 then round(100.0 * v_pay_ontime / v_pay_total) else null end,
    'rating_count', v_rating_count,
    'rating_avg', round(v_rating_avg, 2),
    'facts', v_facts,
    'disputes', v_disputes
  );
end;
$$;

grant execute on function public.get_trust_report(uuid) to authenticated;
