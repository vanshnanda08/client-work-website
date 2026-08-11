@AGENTS.md

# Inkwell — Client Content Dashboard

> The `@AGENTS.md` import above is mandatory and must stay on line 1. `next dev`
> regenerates `AGENTS.md`; do not delete either file.

## What this is

A client-facing dashboard for **Inkwell**, a content-writing agency. The user is
the *client* (a marketing/content lead at a customer company), not the agency and
not the writer. They log in to:

- submit content briefs ("orders") and spend a monthly **word-credit** allowance,
- watch each order move through the production pipeline,
- review delivered drafts, then **approve** or **request revisions**,
- talk to the assigned writer in a per-order comment thread,
- manage their org, team, brand-voice rules, plan, and preferences.

There is no writer-side or agency-side UI, and there is no admin. Anything a
writer or editor "does" is pre-baked into fixtures. Keep new features on the
client side of that line.

## Status: front-end only, no backend

**Every byte of state lives in React context + `localStorage`.** There is no API,
no database, no auth. `lib/fixtures/*` are the seed values; on first client mount
`localStorage` is layered over them. This is the single most important fact about
the codebase — most "why is it like this?" questions resolve to it.

## Stack

| Thing | Version / choice | Notes |
|---|---|---|
| Next.js | **16.3.0**, App Router, Turbopack | See `AGENTS.md`: read `node_modules/next/dist/docs/` before using an unfamiliar Next API. Do not trust memory for this version. |
| React | 19.2.8 | `use(params)` for route params — pages receive `params: Promise<{...}>`. |
| TypeScript | 5.x, strict | `@/*` maps to the repo root (`@/lib/...`, `@/components/...`). |
| Tailwind | **v4** (`@tailwindcss/postcss`) | No `tailwind.config.js`. Theme is CSS variables in `app/globals.css`. |
| Icons | `lucide-react` | |
| Class merging | `clsx` + `tailwind-merge` via `cn()` in `lib/utils.ts` | |

No state library, no data-fetching library, no test framework — all deliberate
given there is no server.

## Commands

```bash
npm run dev     # next dev (Turbopack) on :3000
npm run build   # production build — typechecks as part of the build
npm run start   # serve the production build
npm run lint    # eslint; must stay at 0 errors
npx tsc --noEmit  # typecheck alone, faster than a full build
```

**There is no `npm test`** — no test framework is installed. Verification to date
has been ad-hoc Playwright scripts driving the user's system Chrome
(`/Applications/Google Chrome.app/...` via `executablePath`, since no Playwright
browsers are downloaded). Those scripts lived in a scratch dir and are **not in
the repo**. If you need regression cover, adding Playwright properly is a
reasonable first infra task — but ask before adding a dependency.

Lint currently reports **0 errors, ~53 warnings**. The warnings are pre-existing
cosmetic noise (unused `lucide` imports, `<img>` vs `next/image`). Zero errors is
the bar; don't let a new error land.

## Folder map

```
app/
  layout.tsx              Root. Fonts, <head> pre-paint theme script, body background.
  page.tsx                "/" → redirect("/dashboard")
  globals.css             Tailwind import + light/dark palettes + density rules
  (app)/                  Route group: everything behind the app shell
    layout.tsx            StoreProvider + ThemeController + Sidebar + TopNav + <main>
    dashboard/            Metric cards, active orders, activity feed
    orders/               list · new · [orderId] · [orderId]/edit
    notifications/        Full notification list
    settings/
      layout.tsx          Settings tab bar — SEE "Reachability" BELOW
      page.tsx            redirect → /settings/profile
      profile · organization · team · brand-voice · notifications · plan · appearance

components/
  app-shell/    Sidebar, TopNav, OrgSwitcher, UserMenu, NotificationsBell, ThemeController
  orders/       OrdersTable, OrdersFilterBar, OrdersPagination, OrderStatusBadge
  order-detail/ DeliverablesViewer, CommentsThread, BriefSummaryCard,
                StatusTimelineStepper, ApproveOrderModal, RevisionRequestModal
  dashboard/    RecentActivityFeed (+ 3 unused, see "Dead code")
  ui/           Button, Input, Textarea, Modal (+ 3 unused, see "Dead code")

lib/
  context/StoreContext.tsx   THE store. All app state and every mutation.
  types.ts                   All domain types. One source of truth.
  config.ts                  STATUS_CONFIG, CONTENT_TYPES, PRIORITY_CONFIG, APP_CONFIG
  utils.ts                   cn, date/number formatting, download helpers
  fixtures/                  Seed data (MOCK_*)
```

## The store — read this before touching state

`lib/context/StoreContext.tsx` is the whole state layer. `useStore()` throws
outside the provider. It exposes 11 data slices and 18 actions:

**Slices:** `orders`, `organization`, `activities`, `notifications`,
`commentsMap`, `currentUser`, `memberships`, `invitations`, `brandVoice`,
`notificationPrefs`, `appearance`, plus `isHydrated`.

**Actions:** `createOrder`, `updateOrder`, `submitDraft`, `deleteOrder`,
`updateOrderStatus`, `addComment`, `markNotificationsAsRead`,
`markNotificationAsRead`, `updateCurrentUser`, `updateOrganization`,
`updateBrandVoice`, `updateNotificationPrefs`, `updateAppearance`,
`inviteMember`, `revokeInvitation`, `updateMemberRole`, `removeMember`,
`signOut`.

### Rules that are load-bearing, not style

**1. Every mutation must use a functional updater.**

```ts
setOrders(prev => prev.map(...))   // correct
setOrders(orders.map(...))         // WRONG — reintroduces a fixed bug
```

This is not a preference. Approving an order calls `updateOrderStatus` *then*
`addComment`; both write `orders`. When they read `orders` from the render
closure, the second overwrites the first and **the approval silently vanishes**
from both state and `localStorage`. That was a real shipped bug. Same class broke
revision requests, which write two comments in a row.

**2. Never call one setter inside another setter's updater.** React StrictMode
double-invokes updaters, so a nested `setX` fires twice — duplicate
notifications, double-refunded credits. To read current state inside a stable
callback, use a ref (see `notificationPrefsRef`) or add the value to the
`useCallback` deps.

**3. Persistence is automatic.** One `useEffect` writes all slices to
`localStorage` whenever any change. **Do not add manual `localStorage.setItem`
calls inside actions** — an earlier version did that and the hand-written copies
drifted from state. Because every action uses functional updates, the sync effect
always sees final state.

**4. Use `uid(prefix)` for new record ids**, never bare `Date.now()`. Two records
created in the same millisecond (revision requests do exactly this) would collide
and produce duplicate React keys.

**5. Hydration.** State initialises from fixtures so SSR and first client render
match; `localStorage` is layered on in an effect that flips `isHydrated`. The
`react-hooks/set-state-in-effect` rule is disabled **for that one effect only**,
with a comment explaining why. Don't widen that suppression.

**localStorage keys** are `inkwell_*_v2` (see `STORAGE_KEYS`). Changing a key
orphans existing user data. Bump to `_v3` deliberately if a shape change requires it.

## Conventions

**State.** Global/shared → the store. Ephemeral UI (open modal, active tab,
search text) → local `useState`. Settings forms keep a local *draft* copy and
commit to the store on Save.

**Seeding a form from the store.** Do **not** write a `useEffect` that copies
store values into local state — the lint rule rejects it and it clobbers in-flight
edits. Use the remount-by-key pattern already used by all four settings forms:

```tsx
export default function XSettingsPage() {
  const { isHydrated } = useStore();
  return <XForm key={isHydrated ? "stored" : "seed"} />;   // remount re-seeds useState
}
function XForm() { const { x, updateX } = useStore(); const [draft, setDraft] = useState(x.field); }
```

**Naming.** Components `PascalCase.tsx`, named exports (`export const Foo`), not
default — except `app/**/page.tsx` and `layout.tsx`, which Next requires to be
default. Domain fields are `snake_case` (`word_count_target`, `created_at`) because
they mirror an eventual API payload; local variables and props are `camelCase`.
Fixtures are `MOCK_*`.

**Types.** Everything domain-shaped goes in `lib/types.ts`. Don't redeclare an
order/profile shape inline in a component. `any` is banned by lint.

**Styling.** Tailwind utilities inline; `cn()` when merging conditional classes.
The visual language is already consistent — match it rather than inventing:
`rounded-2xl` cards, `border-neutral-200/80`, `shadow-2xs`, `text-xs` body copy,
`font-bold`/`font-extrabold` headings. Status and content-type colours come from
`STATUS_CONFIG` / `CONTENT_TYPES` in `lib/config.ts` — never hardcode a status
colour at a call site.

**Buttons.** `variant`: `primary | secondary | outline | ghost | danger | success`.
`size`: `sm | md | lg | icon`. Supports `isLoading`, `leftIcon`, `rightIcon`.

## Theming — how it works, and how to not break it

Dark mode does **not** use Tailwind's `dark:` variant. Tailwind v4 compiles
`bg-white` / `text-neutral-900` to `var(--color-white)` / `var(--color-neutral-900)`,
so `globals.css` **redefines the whole neutral ramp under `[data-theme="dark"]`**,
with the scale inverted (900 becomes the lightest value). ~7,000 lines of existing
markup re-theme with no component edits.

Consequences you must respect:

- **Never hardcode the page background.** Use `bg-[var(--background)]`. A literal
  `bg-[#F8F9FA]` won't respond to the theme.
- **The sidebar is dark in both themes** and styles itself with light-mode
  semantics (`bg-neutral-800` = a raised chip on near-black). Its three root
  elements carry `.palette-base`, which restates the stock ramp to opt their
  subtree out of the inversion. Keep that class if you restructure the sidebar.
- `data-theme` / `data-density` are set on `<html>` by
  `components/app-shell/ThemeController.tsx`, and *also* by an inline script in
  `app/layout.tsx` that runs before paint to prevent a white flash. **If you
  change the appearance storage key or shape, update that inline script too** —
  it parses `inkwell_appearance_v2` by hand.
- `theme: "system"` subscribes to `prefers-color-scheme` and follows OS changes live.
- Compact density is CSS-only, scoped to `main` (see the `[data-density="compact"]`
  rules at the bottom of `globals.css`).

## Reachability — the recurring failure mode here

This codebase has repeatedly grown fully-working UI that **no user could reach**.
Fixed instances: `OrgSwitcher` (built, mounted nowhere), the Appearance /
Organization / Notifications settings pages (no nav tab — URL-only),
`RecentActivityFeed` (the sole consumer of `activities`, never imported).

So, when adding anything:

- **Add a settings page → add its tab** in `app/(app)/settings/layout.tsx`. Every
  page under `/settings` must appear there.
- **Build a component → mount it**, or don't build it.
- **Write to a store slice → render it somewhere.**
- Sanity check: `grep -rl ComponentName app components` should return more than
  the file itself.

Testing that a feature *works* is not the same as testing a user can *get to it*.
Navigate by clicking, not by typing URLs.

## What is real vs. mocked

**Fully working** (verified end-to-end in a browser): order list search / status
tabs / type + priority filters / sort / pagination; create order; save, edit,
submit, and delete drafts; approve; request revisions; comments; word-credit
debit on submit and refund on delete; notifications (bell, page, per-item and
bulk read, prefs actually gating new in-app alerts); all 7 settings pages
persisting; avatar upload; theme + density; activity feed; sign out; mobile
drawer.

**Mocked or deliberately absent:**

| Area | Reality |
|---|---|
| Persistence | `localStorage` only — per browser, per device. Clearing site data resets to fixtures. |
| Auth | None. "Sign Out" clears storage and reseeds; `/` just redirects to `/dashboard`. |
| Downloads | Generated client-side from `body_md` as real `.md` files. **Not `.docx`** — that would need a zip dependency. |
| Email notifications | Preferences are stored but nothing is ever sent. The *in-app* toggles genuinely gate the bell. |
| Plan changes | `mailto:` links to `APP_CONFIG.supportEmail`. No billing. |
| Writer activity | Deliverables, writer comments, and pipeline history are fixture data. Nothing advances an order past `submitted` on its own. |
| Order ids | `ord-####`, derived from the highest existing number. |

Seed data: 9 orders spanning every status (1 draft, 1 approved, 2 delivered, …),
4 writers, 6 activity events, 4 notifications, 3 team members, 2 pending invites.
The spread is intentional — it exercises every status branch. Keep at least one
order in each status if you edit `lib/fixtures/orders.ts`.

## Dead code (unused, intentionally left)

Zero importers. Their functionality is duplicated by inline implementations on
the dashboard, so nothing is broken — but don't assume they're wired up:

- `components/dashboard/` — `StatusSummaryCards`, `WordUsageWidget`, `NeedsAttentionList`
- `components/ui/` — `Tabs`, `Card`, `Badge`

Either mount them or delete them; don't leave the ambiguity growing. Also unused:
`Order.outline_required`, `plagiarism_check`, `meta_description_required` are set
`true` on every order and never displayed.

## Gotchas

- **Never fall back to `orders[0]`** when a lookup misses. `/orders/[orderId]`
  used to do `find(...) || orders[0]`, so a deleted or mistyped id silently
  rendered a *different* order. Render the not-found branch instead.
- **Guard numeric JSX conditionals.** `{count && <Badge/>}` renders a literal `0`.
  Use `{!!count && count > 0 && ...}`.
- `formatDate` expects an ISO string or `Date`. `Order.due_date` is a bare
  `YYYY-MM-DD` string and is displayed raw in several places — don't assume it's
  been formatted.
- `DeliverablesViewer` contains a hand-rolled markdown renderer that splits on
  `\n\n` and uses `dangerouslySetInnerHTML` for bold/italic. Content is fixture
  data, so it's contained today — **if deliverables ever become user- or
  API-supplied, this needs sanitising or a real markdown library.**
- `next.config.ts` sets `allowedDevOrigins` for `127.0.2.2`; leave it unless dev
  origin warnings say otherwise.
- `next dev` prints a harmless warning about `package-lock.json` outside the repo
  and suggests setting `turbopack.root`. Ignore it, or fix deliberately.

## Do not change without a reason

1. The `@AGENTS.md` import on line 1 of this file.
2. Functional updaters in the store (rule 1 above).
3. `.palette-base` on the sidebar roots.
4. The inline pre-paint theme script in `app/layout.tsx`.
5. The narrow `react-hooks/set-state-in-effect` suppression in `StoreContext.tsx`.
6. `localStorage` key names, unless you intend to orphan user data.
