-- ============================================================================
-- Tenant Trust — live in-app notifications. Run after 0001–0011.
-- Adds the notifications table to the Realtime publication so the app receives
-- INSERTs instantly (RLS still restricts each client to its own rows). Safe to
-- re-run: skips if the table is already in the publication.
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end
$$;
