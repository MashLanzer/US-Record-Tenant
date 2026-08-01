-- ============================================================================
-- Tenant Trust — edit/delete (CRUD) policies. Run after 0001–0010.
-- Adds the missing UPDATE/DELETE row-level policies so users can correct or
-- remove their own records. Properties already have a `for all` own-row policy;
-- deleting a property cascades to its lease, payments, reports, ratings and
-- disputes, so "delete contract" removes the whole thread cleanly.
-- ============================================================================

-- Landlord can delete their own lease.
create policy "leases_delete_landlord"
  on public.leases for delete to authenticated
  using (auth.uid() = landlord_id);

-- Either party of the parent lease can edit a payment they can see.
create policy "payments_update_lease_party"
  on public.payments for update to authenticated
  using (
    exists (
      select 1 from public.leases l
      where l.id = payments.lease_id
        and (l.landlord_id = auth.uid() or l.tenant_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.leases l
      where l.id = payments.lease_id
        and (l.landlord_id = auth.uid() or l.tenant_id = auth.uid())
    )
  );

-- Either party of the parent lease can delete a payment.
create policy "payments_delete_lease_party"
  on public.payments for delete to authenticated
  using (
    exists (
      select 1 from public.leases l
      where l.id = payments.lease_id
        and (l.landlord_id = auth.uid() or l.tenant_id = auth.uid())
    )
  );

-- The author of a fact can retract (delete) it.
create policy "reports_delete_author"
  on public.reports for delete to authenticated
  using (auth.uid() = author_id);
