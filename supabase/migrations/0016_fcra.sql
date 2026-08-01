-- ============================================================================
-- Tenant Trust — Fase 7.3: FCRA workflows. Run after 0001–0015.
--   (a) Permissible-purpose attestation on access requests.
--   (b) Adverse action notices issued by a party who used a report to decide.
--   (c) A 30-day reinvestigation deadline stamped when a fact is disputed
--       (FCRA §611-style process), tracked on the report.
-- NOTE: The legal text shown to users is drafted for attorney review; this
-- migration only stores the structured data behind those flows.
-- ============================================================================

-- (a) Permissible purpose ---------------------------------------------------
alter table public.access_requests
  add column if not exists purpose text
  check (purpose is null or purpose in ('tenant_screening','existing_tenant','applicant_consent','other'));

-- request_access gains a purpose. Drop the old 2-arg version first.
drop function if exists public.request_access(uuid, text);

create or replace function public.request_access(p_subject uuid, p_purpose text, p_message text)
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
  if p_purpose is null or p_purpose not in ('tenant_screening','existing_tenant','applicant_consent','other') then
    raise exception 'A permissible purpose is required';
  end if;

  insert into public.access_requests (requester_id, subject_id, purpose, message, status, responded_at)
  values (auth.uid(), p_subject, p_purpose, nullif(p_message, ''), 'pending', null)
  on conflict (requester_id, subject_id) do update
    set status = 'pending', purpose = excluded.purpose, message = excluded.message,
        created_at = now(), responded_at = null;

  insert into public.notifications (user_id, type, data)
  values (p_subject, 'access_requested', jsonb_build_object('purpose', p_purpose));
end;
$$;

grant execute on function public.request_access(uuid, text, text) to authenticated;

-- (b) Adverse action notices ------------------------------------------------
create table if not exists public.adverse_actions (
  id         uuid primary key default gen_random_uuid(),
  issuer_id  uuid not null references public.profiles (id) on delete cascade,
  subject_id uuid not null references public.profiles (id) on delete cascade,
  decision   text not null check (decision in ('denied','conditional','deposit_increase','cosigner_required','other')),
  reasons    text[] not null default '{}',
  note       text,
  created_at timestamptz not null default now(),
  check (issuer_id <> subject_id)
);

create index if not exists adverse_actions_subject_idx on public.adverse_actions (subject_id, created_at desc);

alter table public.adverse_actions enable row level security;

-- Both the issuer and the subject can read the notice.
create policy "adverse_actions_select"
  on public.adverse_actions for select to authenticated
  using (issuer_id = auth.uid() or subject_id = auth.uid());

-- Issue an adverse action notice. The issuer must have had report access
-- (i.e. a permissible purpose) toward the subject.
create or replace function public.issue_adverse_action(
  p_subject uuid,
  p_decision text,
  p_reasons text[],
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_subject = auth.uid() then raise exception 'Cannot issue a notice to yourself'; end if;
  if not public.has_report_access(p_subject) then
    raise exception 'You must have report access (a permissible purpose) to issue a notice';
  end if;

  insert into public.adverse_actions (issuer_id, subject_id, decision, reasons, note)
  values (auth.uid(), p_subject, p_decision, coalesce(p_reasons, '{}'), nullif(p_note, ''))
  returning id into v_id;

  insert into public.notifications (user_id, type, data)
  values (p_subject, 'adverse_action', jsonb_build_object('decision', p_decision));

  return v_id;
end;
$$;

grant execute on function public.issue_adverse_action(uuid, text, text[], text) to authenticated;

-- (c) Reinvestigation deadline ----------------------------------------------
alter table public.reports add column if not exists reinvestigation_due timestamptz;

-- Re-create dispute_report so opening a dispute also stamps a 30-day
-- reinvestigation deadline (FCRA §611 timeframe).
create or replace function public.dispute_report(
  p_report_id uuid,
  p_statement text,
  p_evidence_path text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rep public.reports;
begin
  select * into rep from public.reports where id = p_report_id;
  if rep.id is null then raise exception 'Report not found'; end if;
  if rep.subject_id <> auth.uid() then
    raise exception 'Only the subject of a fact can dispute it';
  end if;

  update public.reports
    set status = 'disputed',
        reinvestigation_due = coalesce(reinvestigation_due, now() + interval '30 days')
  where id = p_report_id and status <> 'resolved';

  insert into public.dispute_entries (report_id, author_id, statement, evidence_path)
  values (p_report_id, auth.uid(), nullif(p_statement, ''), nullif(p_evidence_path, ''));

  insert into public.notifications (user_id, type, data)
  values (rep.author_id, 'report_disputed', jsonb_build_object('type', rep.type));
end;
$$;

grant execute on function public.dispute_report(uuid, text, text) to authenticated;
