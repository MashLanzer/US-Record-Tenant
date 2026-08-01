-- ============================================================================
-- Tenant Trust — recorded facts (reports) between the two parties of a lease.
-- Run in the Supabase SQL editor after 0001–0006.
-- A party records a fact about the OTHER party (with optional evidence). The
-- subject is notified and can dispute it later.
-- ============================================================================

create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  lease_id      uuid not null references public.leases (id) on delete cascade,
  author_id     uuid not null references public.profiles (id) on delete cascade,
  subject_id    uuid not null references public.profiles (id) on delete cascade,
  type          text not null,
  description   text,
  evidence_path text,
  status        text not null default 'open' check (status in ('open','disputed','resolved')),
  created_at    timestamptz not null default now()
);

create index if not exists reports_subject_idx on public.reports (subject_id, created_at desc);
create index if not exists reports_lease_idx on public.reports (lease_id, created_at desc);

alter table public.reports enable row level security;

-- Both parties to a report can read it.
create policy "reports_select"
  on public.reports for select to authenticated
  using (author_id = auth.uid() or subject_id = auth.uid());

-- Insert happens via submit_report() so the subject can be validated and
-- notified in one transaction.
create or replace function public.submit_report(
  p_lease_id uuid,
  p_type text,
  p_description text,
  p_evidence_path text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  l         public.leases;
  v_subject uuid;
  v_report  uuid;
begin
  select * into l from public.leases where id = p_lease_id;
  if l.id is null then raise exception 'Lease not found'; end if;

  if l.landlord_id = auth.uid() then
    v_subject := l.tenant_id;
  elsif l.tenant_id = auth.uid() then
    v_subject := l.landlord_id;
  else
    raise exception 'You are not part of this lease';
  end if;

  if v_subject is null then
    raise exception 'This lease has no counterparty yet';
  end if;

  insert into public.reports (lease_id, author_id, subject_id, type, description, evidence_path)
  values (p_lease_id, auth.uid(), v_subject, p_type, nullif(p_description, ''), nullif(p_evidence_path, ''))
  returning id into v_report;

  insert into public.notifications (user_id, type, data)
  values (v_subject, 'report_received', jsonb_build_object('type', p_type));

  return v_report;
end;
$$;

grant execute on function public.submit_report(uuid, text, text, text) to authenticated;
