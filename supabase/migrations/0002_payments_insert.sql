-- ============================================================================
-- Tenant Trust — allow parties to record payments on their own leases.
-- Run this in the Supabase SQL editor after 0001_init.sql.
-- ============================================================================

create policy "payments_insert_lease_party"
  on public.payments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.leases l
      where l.id = payments.lease_id
        and (l.landlord_id = auth.uid() or l.tenant_id = auth.uid())
    )
  );
