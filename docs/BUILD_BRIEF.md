# Tenant Trust — Screen Build Brief (READ FULLY BEFORE CODING)

You are building screens for **Tenant Trust**, a bilateral rental-trust app.
The foundation (design system, i18n, theme, components) already exists and
**must not be modified**. You only create the page files assigned to you.

## Non-negotiable rules
1. **Every page file starts with `"use client";`** (they use hooks / motion).
2. Each page **default-exports** a React component.
3. **Only create the exact files you are assigned.** Never edit shared files
   (`src/components/**`, `src/lib/**`, `globals.css`). If you need extra sample
   data, define it locally inside your page file.
4. **Static export**: no server code, no `generateStaticParams`, no dynamic
   `[param]` route segments. Use only the static routes assigned.
5. **Bilingual everywhere.** Never hardcode user-visible English or Spanish.
   Use the i18n pattern below for 100% of visible strings.
6. **Never hardcode colors** (no `#hex`, no `text-white` except on the brand
   gradient / dark hero cards). Use the semantic token classes below so light
   and dark mode both work automatically.
7. Mobile-first. Generous whitespace, rounded corners, calm hierarchy.
   Aesthetic target: Apple / Linear / Stripe — minimal, trustworthy, premium.

## Design token classes (Tailwind v4, already wired to light/dark)
- Surfaces: `bg-canvas` `bg-surface` `bg-surface-2` `bg-surface-3`
- Text: `text-ink` `text-ink-soft` `text-ink-faint` `text-ink-ghost`
- Borders: `border-line` `border-line-strong`
- Brand (Trust Blue): `text-brand` `bg-brand-600` `bg-brand-700` `bg-brand-tint` `bg-brand-tint-2`
- Semantic: verify=`text-verify`/`bg-verify-tint`, pending/amber=`text-amber`/`bg-amber-tint`,
  dispute/danger=`text-danger`/`bg-danger-tint`, premium=`text-violet`/`bg-violet-tint`
- Shadows: `shadow-[var(--shadow-1)]` `shadow-[var(--shadow-2)]` `shadow-[var(--shadow-3)]`
- Rounding: `rounded-xl` (12px) `rounded-2xl` (16–22px). Numbers: add class `tnum`.
- Brand gradient (hero cards): `bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))]`
  (on it, use `text-white` and `text-white/80`).

## i18n pattern (MANDATORY for all copy)
```tsx
"use client";
import { useT, useLocale } from "@/lib/i18n";
import { common } from "@/lib/i18n/common"; // shared strings (tabs, actions, status, roles)

const copy = {
  en: { title: "Payment history", empty: "No payments yet" },
  es: { title: "Historial de pagos", empty: "Aún no hay pagos" },
};

export default function Page() {
  const c = useT(copy);         // current-locale slice of your local dictionary
  const g = useT(common);       // shared strings, e.g. g.actions.continue, g.status.verified
  const { locale } = useLocale(); // for mock fields that come as fooEn / fooEs
  // ...
}
```
`common` provides: `appName`, `tagline`, `tabs.{home,search,records,messages,profile}`,
`actions.{continue,cancel,back,save,next,done,seeAll,viewDetails,retry,getStarted}`,
`status.{verified,pending,inDispute,premium}`, `roles.{tenant,landlord}`.

## Component API (import exactly as shown)

From `@/components/ui/primitives`:
- `Button({ variant?: "primary"|"secondary"|"ghost"|"danger", size?: "sm"|"md"|"lg", full?, href?, icon?, iconRight?, onClick?, disabled?, children })` — if `href` it renders a link.
- `Chip({ tone?: "verify"|"pending"|"dispute"|"brand"|"neutral"|"premium", icon?, children })`
- `Card({ children, className?, onClick? })` — rounded surface card with border+shadow.
- `Input` — standard `<input>` props (styled).
- `Field({ label, hint?, children })` — label wrapper; put an `<Input/>` inside.
- `SegmentedControl({ options: {value,label}[], value, onChange, className? })` — needs `useState`.
- `Toggle({ checked, onChange })` — needs `useState`.
- `Avatar({ initials, size?, verified?, className? })` — shows a green verified seal when `verified`.
- `StatCard({ label, value, tone?: "ink"|"verify"|"brand"|"danger" })`
- `ListRow({ icon?, title, subtitle?, right?, href?, onClick?, tone?: "brand"|"verify"|"amber"|"danger"|"neutral" })`
- `Skeleton({ className })` — shimmer placeholder.

From `@/components/ui/trust`:
- `TrustRing({ score, size?, tone?: "verify"|"brand"|"white", onDark?, label? })` — animated score dial. Use `tone="white" onDark` on brand-gradient cards.
- `FactorBars({ factors, labelKey?: "en"|"es" })` — pass a `TrustFactor[]`; set `labelKey={locale}`.

From `@/components/ui/empty`: `EmptyState({ icon, title, description?, action? })`.
From `@/components/app-header`:
- `AppHeader({ title?, subtitle?, back?, backHref?, right? })` — sticky top bar with back button. Use on detail/pushed screens.
- `SectionTitle({ children, action? })` — small uppercase section label.
From `@/components/app-shell`: `Screen({ children, className? })` — horizontal padding container for in-app content.
From `@/components/auth-shell`: `AuthShell({ children, showLogo?, className? })` — centered column for onboarding/auth (no tab bar).
From `@/components/motion`: `PageFade`, `Stagger`, `StaggerItem` (each `{children, className?}`). Wrap page content in `<PageFade>`.

Icons: `import { IconName } from "lucide-react"` (e.g. `Shield`, `Check`, `ChevronRight`, `Home`,
`CreditCard`, `Flag`, `Upload`, `Scale`, `Bell`, `Search`, `Lock`, `Eye`, `FileText`, `Star`, `Clock`,
`ShieldCheck`, `TrendingUp`, `MessageSquare`, `Settings`, `CircleHelp`, `Sparkles`). Size with `className="h-5 w-5"`.

## Shell rules
- **In-app screens** (routes under `src/app/(app)/…`): the tab bar + sidebar are
  provided automatically by the group layout. Do **NOT** wrap in AuthShell/AppShell.
  - Tab-root screens (no back): start with `<PageFade><Screen> … </Screen></PageFade>`
    and put an `<h1>`/greeting inside.
  - Detail/pushed screens (with back): `<><AppHeader title={c.title} /><PageFade><Screen> … </Screen></PageFade></>`.
- **Onboarding/auth screens** (top-level routes like `src/app/login/…`): wrap in
  `<AuthShell showLogo> … </AuthShell>` (AuthShell already includes PageFade + theme/lang toggles).

## Mock data — `import { … } from "@/lib/mock"`
Exports: `me` (name, initials, trustScore, ratingLabelEn/Es, yearsEn/Es), `landlordMe`,
`trustFactors` & `landlordFactors` (`TrustFactor[]` → {key,labelEn,labelEs,score,tone}),
`verifications` (`Verification[]` → {key,labelEn,labelEs,state:"verified"|"pending"|"locked",dateEn?,dateEs?}),
`properties` (`Property[]` → {id,address,city,rent,status:"active"|"past",startDate,endDate?,counterparty,verified}),
`payments` (`Payment[]` → {id,monthEn,monthEs,amount,status:"onTime"|"late",date}),
`timeline` (`TimelineEvent[]` → {id,type,titleEn,titleEs,descEn,descEs,date,tone}),
`publicProfile`, `conversations` (`Conversation[]`), `notifications` (`Notification[]`),
`searchResults` (`SearchResult[]`), `accessLog`. Types are exported too.
Use `$` + `toLocaleString()` for money (with `tnum`).

## Tone / ethics baked into UI
- Never punitive language. Frame facts + evidence, not accusations.
- The report/appeal flows must feel fair: show the "the other party is notified
  and can respond" reassurance; require evidence before enabling submit.
- Verification is celebrated (green, checkmarks). Both parties are treated equally.
