# Backend setup — Supabase + Vercel

This connects the app to a real backend: **Supabase** (Postgres database, auth,
storage) with the frontend deployed on **Vercel**. They work together — Supabase
is the backend, Vercel is the hosting.

Until you add the two Supabase keys, the app runs in **demo mode** (mock data,
no real login) so previews keep working.

---

## 1. Create the Supabase project (~3 min)

1. Go to <https://supabase.com> → **New project**. Pick a name, a strong database
   password, and the region closest to your users (US for this product).
2. Wait for it to finish provisioning.

## 2. Create the database schema

1. In the Supabase dashboard: **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).
3. Click **Run**. This creates the `profiles`, `properties`, `leases`, `payments`
   tables, the Row Level Security policies, and a trigger that auto-creates a
   profile whenever someone signs up.

## 3. Configure auth

1. **Authentication → Providers → Email**: keep **Email** enabled. For fastest
   testing you can turn **Confirm email** off (turn it back on before launch).
2. **Authentication → URL Configuration**: add your site URL(s) to
   **Redirect URLs**, e.g. `http://localhost:3000/**` and your Vercel URL
   `https://your-app.vercel.app/**`.
3. (Optional) To enable the Google / Apple buttons, configure those providers
   here later — email/password works out of the box.

## 4. Get your keys

**Project Settings → API**, copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Both are safe in the browser — security is enforced by RLS. Never use the
> `service_role` key in this app.

## 5. Run locally

```bash
cp .env.example .env.local
# paste your two values into .env.local
pnpm dev
```

Create an account at `/register` — you should see a new row in **Table Editor →
profiles** in Supabase. That confirms the full loop works.

---

## 6. Deploy to Vercel

1. Push this repo to GitHub (already on your branch).
2. Go to <https://vercel.com> → **Add New → Project** → import the repo.
3. Framework preset: **Next.js** (auto-detected). Build command and output are
   already correct (`next build`, static export to `out`).
4. **Environment Variables**: add the same two `NEXT_PUBLIC_SUPABASE_*` values.
5. **Deploy.** Every push to the branch redeploys automatically.

After deploying, add the Vercel URL to Supabase **Redirect URLs** (step 3.2).

---

## What's wired vs. what's next

**Wired now**

- Email/password sign-up, log in, password reset, sign out
- Session persistence + client route protection (`AuthGuard`)
- Auto-created profile per user (role + name from sign-up)
- Full RLS-secured schema for profiles, properties, leases, payments

**Next iteration**

- Move the remaining screens (rentals, payments, timeline, dossier…) from mock
  data onto live Supabase queries
- Supabase Storage for evidence/documents + signed URLs
- Real identity verification (Persona / Stripe Identity) and bank-linked
  payments (Plaid)
- The FCRA-compliant reporting pipeline (see the strategy doc)
