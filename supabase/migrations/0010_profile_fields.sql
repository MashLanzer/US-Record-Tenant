-- ============================================================================
-- Tenant Trust — extra editable profile fields. Run after 0001–0009.
-- phone + bio let users complete their profile from the Edit Profile screen.
-- Updates are already covered by the existing profiles_update_own RLS policy.
-- ============================================================================

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists bio   text;
