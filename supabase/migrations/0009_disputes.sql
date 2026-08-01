-- ============================================================================
-- Tenant Trust — disputes / appeals on recorded facts. Run after 0001–0008.
-- The SUBJECT of a fact can dispute it with their own statement + evidence.
-- Both parties can then add statements to the thread. A dispute flips the
-- report to status='disputed' so it shows as contested on the record.
-- ============================================================================

create table if not exists public.dispute_entries (
  id            uuid primary key default gen_random_uuid(),
  report_id     uuid not null references public.reports (id) on delete cascade,
  author_id     uuid not null references public.profiles (id) on delete cascade,
  statement     text,
  evidence_path text,
  created_at    timestamptz not null default now()
);

create index if not exists dispute_entries_report_idx
  on public.dispute_entries (report_id, created_at asc);

alter table public.dispute_entries enable row level security;

-- Both parties of the parent report can read the dispute thread.
create policy "dispute_entries_select"
  on public.dispute_entries for select to authenticated
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_id
        and (r.author_id = auth.uid() or r.subject_id = auth.uid())
    )
  );

-- The subject opens a dispute: flips the report to 'disputed', records their
-- first statement, and notifies the author.
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

  update public.reports set status = 'disputed'
  where id = p_report_id and status <> 'resolved';

  insert into public.dispute_entries (report_id, author_id, statement, evidence_path)
  values (p_report_id, auth.uid(), nullif(p_statement, ''), nullif(p_evidence_path, ''));

  insert into public.notifications (user_id, type, data)
  values (rep.author_id, 'report_disputed', jsonb_build_object('type', rep.type));
end;
$$;

grant execute on function public.dispute_report(uuid, text, text) to authenticated;

-- Either party adds a statement / evidence to an existing dispute thread and
-- notifies the counterparty.
create or replace function public.add_dispute_entry(
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
  rep    public.reports;
  v_other uuid;
begin
  select * into rep from public.reports where id = p_report_id;
  if rep.id is null then raise exception 'Report not found'; end if;

  if rep.author_id = auth.uid() then
    v_other := rep.subject_id;
  elsif rep.subject_id = auth.uid() then
    v_other := rep.author_id;
  else
    raise exception 'You are not part of this fact';
  end if;

  insert into public.dispute_entries (report_id, author_id, statement, evidence_path)
  values (p_report_id, auth.uid(), nullif(p_statement, ''), nullif(p_evidence_path, ''));

  insert into public.notifications (user_id, type, data)
  values (v_other, 'dispute_updated', jsonb_build_object('type', rep.type));
end;
$$;

grant execute on function public.add_dispute_entry(uuid, text, text) to authenticated;
