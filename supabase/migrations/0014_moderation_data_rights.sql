-- ============================================================================
-- Tenant Trust — moderation, dispute resolution & data rights. After 0001–0013.
--   • content_flags: report a fact as abusive / false for review.
--   • resolve_report: the author formally closes a disputed fact as resolved.
--   • delete_account: wipe the caller's account data (cascades everything they
--     own). Auth user removal still requires an admin/service action.
-- ============================================================================

create table if not exists public.content_flags (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references public.reports (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason      text not null check (reason in ('abuse','false','harassment','other')),
  note        text,
  status      text not null default 'open' check (status in ('open','reviewed','actioned')),
  created_at  timestamptz not null default now(),
  unique (report_id, reporter_id)
);

create index if not exists content_flags_status_idx on public.content_flags (status, created_at desc);

alter table public.content_flags enable row level security;

-- A reporter can see the flags they filed.
create policy "content_flags_select_own"
  on public.content_flags for select to authenticated
  using (reporter_id = auth.uid());

-- Flag a fact for review. Only a party to the fact can flag it.
create or replace function public.flag_content(p_report_id uuid, p_reason text, p_note text)
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
  if rep.author_id <> auth.uid() and rep.subject_id <> auth.uid() then
    raise exception 'You are not part of this fact';
  end if;

  insert into public.content_flags (report_id, reporter_id, reason, note)
  values (p_report_id, auth.uid(), p_reason, nullif(p_note, ''))
  on conflict (report_id, reporter_id) do update
    set reason = excluded.reason, note = excluded.note, status = 'open', created_at = now();
end;
$$;

grant execute on function public.flag_content(uuid, text, text) to authenticated;

-- The author of a fact formally resolves its dispute (closes it as settled).
create or replace function public.resolve_report(p_report_id uuid)
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
  if rep.author_id <> auth.uid() then raise exception 'Only the author can resolve this fact'; end if;

  update public.reports set status = 'resolved' where id = p_report_id;

  insert into public.notifications (user_id, type, data)
  values (rep.subject_id, 'report_resolved', jsonb_build_object('type', rep.type));
end;
$$;

grant execute on function public.resolve_report(uuid) to authenticated;

-- Delete the caller's account data. Cascades to everything referencing their
-- profile (properties→leases→payments/reports/ratings/disputes, messages,
-- notifications, invitations, access requests, flags). Leases where they were
-- the tenant keep existing for the landlord with tenant_id set to null.
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.profiles where id = auth.uid();
end;
$$;

grant execute on function public.delete_account() to authenticated;
