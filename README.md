# Tenant Trust

A bilateral rental-trust platform for the U.S. market. Landlords and tenants
build a **verifiable reputation based on facts — not opinions**, with identity
verification, evidence-backed records, mutual ratings, and a fair
appeal/dispute process baked in. It is deliberately **not** a blacklist.

> This repository is the **MVP front-end prototype**: a fully navigable,
> bilingual (EN/ES), light/dark, mobile-first app with mock data. No backend
> yet — every screen simulates the verified trust graph so the product can be
> demoed to users and investors.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with a token-based design system (light + dark)
- **Capacitor 6** to package the same codebase as native **iOS / Android** apps
- **lucide-react** (consistent iconography) · **motion** (smooth animations)
- Bilingual **i18n** (English default, Spanish) via colocated per-screen dictionaries

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Build a static export (also what Capacitor wraps):

```bash
pnpm build        # outputs ./out
```

### Native apps (Capacitor)

```bash
pnpm build
npx cap add ios       # or: npx cap add android   (first time)
npx cap sync
npx cap open ios      # opens Xcode / Android Studio
```

## Project structure

```
src/
  app/
    layout.tsx            # root: theme + locale providers, metadata
    globals.css           # design tokens (light/dark) + Tailwind v4 theme
    page.tsx              # Splash
    welcome, login, register, forgot-password,
    verify-identity, consent, confirm            # onboarding flows (AuthShell)
    not-found.tsx                                # error screen
    (app)/                                       # authenticated app (tab bar + sidebar)
      layout.tsx          # AppShell
      loading.tsx         # skeleton loading
      home, profile, trust, reputation, stats,
      rentals, property, payments, timeline, documents,
      report, evidence, appeals, messages, notifications,
      search, settings, premium, help, dossier, …
  components/
    ui/primitives.tsx     # Button, Chip, Card, Input, Field, Avatar, Toggle, …
    ui/trust.tsx          # TrustRing (signature score dial) + FactorBars
    ui/empty.tsx          # EmptyState
    app-shell.tsx         # sidebar (desktop) + bottom tab bar (mobile)
    app-header.tsx        # sticky detail header + SectionTitle
    auth-shell.tsx        # centered onboarding column
    motion.tsx            # PageFade / Stagger transitions
    toggles.tsx           # theme + language toggles
  lib/
    theme.tsx             # light/dark provider (no-flash init script)
    i18n/                 # LocaleProvider, useT, shared strings
    mock.ts               # mock trust graph (properties, payments, scores…)
    cn.ts                 # class merge helper
docs/
  BUILD_BRIEF.md          # component/i18n contract used to build the screens
```

## Design system

The visual language (Trust-Blue primary, semantic verify/pending/dispute colors,
neutral scale, typography, radii, elevation) lives as CSS variables in
`globals.css` and is exposed to Tailwind as semantic classes (`bg-surface`,
`text-ink`, `text-verify`, …) that respond to light/dark automatically. Toggle
theme and language from the top bar (onboarding) or the sidebar (app).

## Status & roadmap

- [x] Design system, theming, i18n scaffolding
- [x] All core screens (onboarding, dashboard, profiles, records, trust actions,
      search, account, system states)
- [ ] Backend & real verification (KYC, Plaid, county records, document AI)
- [ ] FCRA-compliant reporting pipeline (see strategy docs)
- [ ] Native builds published to App Store / Play Store

**Legal note:** a production version that informs rental decisions is likely a
Consumer Reporting Agency under the FCRA. This prototype is for product/design
validation only; obtain specialized legal counsel before launch.
