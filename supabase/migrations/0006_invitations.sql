-- ============================================================================
-- Tenant Trust — bilateral relationship: lease invitations
-- Run in the Supabase SQL editor after 0001–0005.
-- A landlord invites the tenant (by email). When the tenant accepts, the lease
-- becomes bilateral (tenant_id set) and verified.
-- ============================================================================

create table if not exists public.invitations (
  id            uuid primary key default gen_random_uuid(),
  lease_id      uuid not null references public.leases (id) on delete cascade,
  inviter_id    uuid not null references public.profiles (id) on delete cascade,
  invitee_email text not null,
  status        text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at    timestamptz not null default now()
);

create index if not exists invitations_email_idx
  on public.invitations (lower(invitee_email), status);

alter table public.invitations enable row level security;

-- The sender sees their invites; the invitee (matched by email) sees theirs.
create policy "invitations_select"
  on public.invitations for select to authenticated
  using (
    inviter_id = auth.uid()
    or lower(invitee_email) = lower(auth.jwt() ->> 'email')
  );

-- Only a lease's landlord can invite to it.
create policy "invitations_insert"
  on public.invitations for insert to authenticated
  with check (
    inviter_id = auth.uid()
    and exists (
      select 1 from public.leases l
      where l.id = lease_id and l.landlord_id = auth.uid()
    )
  );

-- Accept: sets the tenant on the lease + marks it verified (SECURITY DEFINER so
-- the tenant can join a lease they don't yet own a row-policy for).
create or replace function public.accept_invitation(inv_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.invitations;
begin
  select * into inv from public.invitations where id = inv_id;
  if inv.id is null then raise exception 'Invitation not found'; end if;
  if inv.status <> 'pending' then raise exception 'Invitation is not pending'; end if;
  if lower(inv.invitee_email) <> lower(auth.jwt() ->> 'email') then
    raise exception 'This invitation is not for you';
  end if;

  update public.leases
     set tenant_id = auth.uid(), verified = true
   where id = inv.lease_id;

  update public.invitations set status = 'accepted' where id = inv_id;

  insert into public.notifications (user_id, type, data)
  values (inv.inviter_id, 'invitation_accepted',
          jsonb_build_object('email', auth.jwt() ->> 'email'));
end;
$$;

create or replace function public.decline_invitation(inv_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.invitations;
begin
  select * into inv from public.invitations where id = inv_id;
  if inv.id is null then raise exception 'Invitation not found'; end if;
  if lower(inv.invitee_email) <> lower(auth.jwt() ->> 'email') then
    raise exception 'This invitation is not for you';
  end if;
  update public.invitations set status = 'declined' where id = inv_id;
end;
$$;

grant execute on function public.accept_invitation(uuid) to authenticated;
grant execute on function public.decline_invitation(uuid) to authenticated;
