-- ============================================================================
-- Tenant Trust — Fase 7.6: data retention. Run after 0001–0016.
--   • purge_expired_data(): deletes transient data past its retention window.
--     It deliberately NEVER touches records under legal hold or that form the
--     durable trust/legal record: facts (reports), dispute threads, consents,
--     adverse-action notices, ratings, payments or leases. Those are removed
--     only when the user deletes their account (right to erasure).
--   • Scheduled daily via pg_cron when available (best-effort).
-- Retention windows here MUST match /legal/retention shown to users.
-- ============================================================================

create or replace function public.purge_expired_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Read notifications: 180 days.
  delete from public.notifications
   where read = true and created_at < now() - interval '180 days';

  -- Access-log (profile views): 365 days.
  delete from public.profile_views
   where created_at < now() - interval '365 days';

  -- Stale pending access requests auto-expire to 'declined' after 60 days.
  update public.access_requests
     set status = 'declined', responded_at = now()
   where status = 'pending' and created_at < now() - interval '60 days';

  -- Declined access requests are cleared 90 days after they were answered,
  -- freeing the (requester, subject) slot for a fresh future request.
  delete from public.access_requests
   where status = 'declined'
     and coalesce(responded_at, created_at) < now() - interval '90 days';
end;
$$;

-- Not granted to end users: this is a maintenance routine run by the scheduler
-- (pg_cron runs as the table owner) or manually from the SQL editor.
revoke all on function public.purge_expired_data() from public;

-- Best-effort daily schedule at 03:00 UTC via pg_cron. If the extension isn't
-- enabled on this project, the migration still succeeds — enable pg_cron in the
-- Supabase dashboard (Database → Extensions) and re-run this block, or call
-- purge_expired_data() from your own scheduler.
do $$
begin
  perform cron.schedule('tt-purge-expired', '0 3 * * *', 'select public.purge_expired_data()');
exception when others then
  raise notice 'pg_cron not scheduled (enable the extension to automate): %', sqlerrm;
end
$$;
