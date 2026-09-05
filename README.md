# Verdict — AdSense Eligibility Checker

A pre-review AdSense audit tool: accounts, three monthly plans, three payment
gateways, an admin panel, a real website analyser, and stored reports, behind
the premium dark homepage at `/`.

## Run it

```bash
npm install
cp .env.example .env.local   # optional — see below
npm run dev                  # http://localhost:3000
```

Nothing needs configuring to start. On first request the app creates
`data/app.db` and, in development only, a random session secret at
`data/.dev-auth-secret`. Sign up, and the Free plan (10 scans a month) is
granted immediately, so the whole journey is walkable before any keys exist.

Also available: `npm run build`, `npm run typecheck`, `npm run verify`.

`npm run verify` is a dependency-free integration suite (353 assertions). It
compiles `lib/` to a temp directory and exercises the real modules against a
throwaway SQLite file: the plan catalogue, scrypt hashing and sessions, the
address filter's accept and refuse lists, monthly cycles and the allowance
reset, checkout and double settlement, forged and short-paid orders, signed
Razorpay webhooks including redelivery and bad signatures, gateway credentials
encrypted at rest and masked on the way out, feature gating in both directions,
the admin audit trail, account deletion with an orphan sweep, and the stale-run
sweep's credit-back. It needs no browser and no network.

Requires Node 22.5 or newer, because persistence uses the built-in
`node:sqlite` module.

## Stack

Next.js 15 (App Router) · React 19 · Tailwind CSS v4 (CSS-first `@theme`) ·
Framer Motion · lucide-react.

Nothing else. No ORM, no auth library, no payment SDK, no test runner:
`node:sqlite` for storage, `node:crypto` for scrypt password hashing, HMAC
signature verification and AES-256-GCM credential encryption, `fetch` for all
three gateway REST APIs, and `window.print()` with an `@media print` stylesheet
for report and invoice PDFs. Fewer dependencies is fewer things to keep
patched.

## Plans

Three plans, all billed monthly. There is no lifetime tier and no one-off
price anywhere in the product.

| Plan  | Price      | Scans / month | Websites | Checks / scan |
| ----- | ---------- | ------------- | -------- | ------------- |
| Free  | ₹0         | 10            | 1        | 13            |
| Basic | ₹399 / mo  | 100           | 3        | 35            |
| Pro   | ₹999 / mo  | 300           | 8        | 44            |

Free adds a basic page check and an HTTPS check. Basic adds the advanced page
check, AI content estimation, originality, duplicate content and the AdSense
policy check. Pro adds the deep per-page AI read, the AI + human-signal
content check, page-by-page scoring, site structure, crawlability, sitemap and
robots analysis, ad density, policy risk detection, prioritised
recommendations, priority support and PDF export.

`lib/plans.ts` holds the shipped defaults; the `plans` table is the live source
of truth and `lib/plan-catalogue.ts` is the only way to read or write it. An
admin can change a price, an allowance or a feature set at `/admin/plans`, and
every surface — pricing page, checkout, dashboard, engine — reads the new
value, because no price or limit is hardcoded anywhere else. Prices are
integers in paise; no float ever touches an amount.

Allowances are monthly, not lifetime. Each subscription carries a cycle window
and a `scans_used` counter; the cycle rolls on read (there is no scheduler in a
Next.js app, and a cron job nobody installed is indistinguishable from a bug
where nobody's quota ever refills), resetting usage and re-reading the plan's
current limit. A changed limit therefore lands at renewal, which is when the
terms are up for renegotiation anyway.

Every plan feature is enforced server-side. The pricing page renders what the
catalogue says, the engine runs only the checks the account's feature set
includes, and the API routes re-check entitlement on every call — calling
`/api/analysis` by hand does not get anyone a Pro check or an eleventh free
scan. The scan claim is a single `UPDATE … WHERE scans_used < scan_limit`, so
two concurrent requests cannot both take the last one.

## Money

A purchase is: create an order server-side at the price the catalogue says
(never a price from the request body) → hand off to the gateway → the gateway
returns → verify the signature server-side → re-fetch the payment from the
gateway and confirm the amount and currency match the order → grant the plan
and issue an invoice, all in one transaction.

A browser claiming success proves nothing; only that server-side chain grants
anything. `lib/billing/fulfil.ts` is the only code that can grant a plan, and
fulfilment is keyed on the order, so a duplicate callback — a retried webhook,
a double-clicked redirect, both racing at once — returns the subscription that
already exists instead of creating a second one. Webhook deliveries are keyed
on the gateway's event id for the same reason. Anything that cannot be
verified is refused and recorded for the admin panel rather than acted on.

Three gateways sit behind one `Gateway` contract in `lib/payments/`:
**Razorpay** (INR, HMAC-SHA256 webhook signatures), **Cashfree** (INR, base64
HMAC over timestamp + raw body) and **PayPal** (settles in a convertible
currency at a rate the admin maintains, deliveries verified by calling
PayPal's own verify-webhook-signature endpoint). Checkout offers only the
gateways an admin has configured and enabled; if all three are off, checkout
refuses with a plain message instead of opening a dead form.

Credentials live in the `payment_gateways` table. Secrets are encrypted at
rest with AES-256-GCM under a key from `CREDENTIALS_SECRET`, are never
returned by any API, and come back to the admin panel masked to their last
four characters (`••••••••••••1234`). Saving a field empty keeps the stored
secret rather than clearing it, and a gateway cannot be switched on until it
is completely configured — the refusal names the missing fields.

## Admin

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`, restart, and that account is raised to
admin on database open; sign in normally and go to `/admin`. If the account
already exists only its role changes, so a redeploy never resets a password an
admin changed. Remove the variables once the account exists.

`/admin` covers revenue and usage stats, users (`/admin/users` — block,
unblock, delete, change plan, set expiry, adjust limits), plans
(`/admin/plans` — price, allowances, feature sets, reset to shipped defaults),
subscriptions and payment history (`/admin/subscriptions`), gateway
configuration (`/admin/payment-gateways`) and the audit log (`/admin/logs`).

Authorisation is checked in the page, in the API route, and in the database
read — not by hiding a link. A normal user who types `/admin` or posts to
`/api/admin/users/:id` gets the same refusal. Every consequential change
(block, unblock, delete, plan change, subscription change, price change,
gateway enable or disable, credentials updated) is written to the audit log
with the admin who made it and what changed; log entries deliberately outlive
the accounts they describe. Deleting a user removes their sessions,
subscriptions, payments, invoices, websites, reports and findings in one
transaction, so nothing is orphaned.

Blocking an account deletes its sessions, refuses its logins, stops new scans
and paid features, and replaces the dashboard body with the reason in plain
language. Nothing is deleted — reports and billing history are intact when the
suspension is lifted.

## Analysis

`lib/analysis/` fetches the site, follows a small number of internal links,
and runs up to 44 checks across six categories: Content Quality, SEO,
Navigation, Mobile Experience, Privacy & Legal, and Technical Health. Findings
are weighted into a 0–100 score and a Ready / Needs Improvement / Not Ready
verdict, then persisted with the individual issues so an old report reads
exactly as it did the day it ran. Only the categories that actually ran are
scored, and their weights are rebased to sum to 100 — a Free report is a real
report over fewer dimensions, not a Pro report with holes in it.

A check outside the account's feature set is not run at all: not run and shown
as locked, not run and shown as failing. The report simply does not contain
it, and names the features that would have added more. Computing a Pro-only
signal for a Free account and then hiding the answer would be both a waste and
a lie of omission about what the tier includes.

Outbound requests resolve the host first and refuse private, loopback,
link-local, carrier-grade NAT and cloud-metadata address space, in IPv4 and
IPv6 including mapped, NAT64 and 6to4 forms — that is what keeps the analyser
from being used as an SSRF proxy. Public domains, bare domains, `www.` forms
and both schemes all work; a refusal is reported as a refusal and a dead
domain as a dead domain. Neither costs the customer a scan: the address filter
and the reachability probe both run before the allowance is claimed, and a run
that dies mid-flight is closed by a sweep that credits the scan back.

On honesty: AI detection is reported as an estimate with a confidence band and
is never presented as a verdict; originality is a signal computed from the
site's own pages, not a plagiarism-database result, and says so; nothing in
the product claims Google will approve a site. A report produced from seeded
data (when a site cannot be reached) is labelled demo data everywhere it
appears. Claiming a mock result was a real approval check would make the whole
product worthless.

## Routes

Public: `/`, `/pricing`, `/login`, `/signup`, `/start`.

Authenticated: `/dashboard`, `/dashboard/checker`, `/dashboard/reports`,
`/dashboard/reports/[id]`, `/dashboard/billing`, `/dashboard/billing/return`,
`/dashboard/billing/invoices/[id]`, `/dashboard/settings`.

Admin: `/admin`, `/admin/users`, `/admin/users/[id]`, `/admin/plans`,
`/admin/subscriptions`, `/admin/payment-gateways`, `/admin/logs`.

Webhooks: `/api/webhooks/[gateway]` for all three, plus
`/api/webhooks/razorpay` kept as a one-line delegation so deployments that
already registered that URL do not have to re-register it.

`/start` is the handoff for a URL typed on the homepage by someone not signed
in: it holds the domain through signup and plan selection so the URL survives
the detour. Middleware bounces unauthenticated requests off `/dashboard/*` and
`/admin/*` with a `next` parameter; each page also checks the session itself,
since middleware alone is not an authorisation boundary.

## Environment

`.env.example` documents every variable with its default. In short:
`AUTH_SECRET` is required in production and optional in development;
`CREDENTIALS_SECRET` encrypts stored gateway secrets and falls back to a key
derived from `AUTH_SECRET` under a separate HKDF label; `NEXT_PUBLIC_APP_URL`
builds callback URLs and invoice hosts; `ADMIN_EMAIL` and `ADMIN_PASSWORD`
bootstrap the first admin; the `RAZORPAY_*`, `CASHFREE_*` and `PAYPAL_*`
variables seed the gateway table for an env-only deployment;
`PAYMENTS_MODE=mock` simulates a purchase end to end with no gateway account
and is refused in production; `DATA_DIR` relocates the database; and the
`ANALYSIS_*` variables plus `ALLOW_PRIVATE_ANALYSIS_HOSTS` tune the crawler.

Every read of `process.env` in the codebase lives in `lib/env.ts` and nowhere
else, so what reaches the browser is auditable in one file. Razorpay's
`KEY_ID` is sent to the client on purpose — Checkout needs it. Every secret and
webhook secret is server-only and is never returned by any route.

## Design system

Tokens live in `app/globals.css`. Nothing is hard-coded in components — if a
colour or type treatment needs to change, it changes there.

**Colour.** `ink-950 → ink-700` for surfaces (deep blue-black, never pure
black). Brand gradient runs `azure-500 → iris-500 → orchid-500`. Semantic
colour is reserved strictly for verdicts: `mint-400` pass, `amber-400` fix,
`rose-400` blocker. Keeping the brand gradient off status states is what
makes a verdict readable at a glance.

**Type.** Bricolage Grotesque for display (tight tracking, large sizes),
Inter Tight for body, JetBrains Mono for data — URLs, scores, and category
codes are technical artifacts, so they get the utility face. Helpers:
`.t-display`, `.t-h1/.t-h2/.t-h3`, `.t-eyebrow`, `.t-body`, `.t-data`.

**Layering.** Custom classes are wrapped in `@layer components` so plain
utilities (`hover:border-*`, `text-*`) still override them. Unlayered CSS
beats every Tailwind layer, which silently kills hover states — worth
preserving if you add classes.

## Signature element

The hero card is the product's own output running itself: a sweep crosses the
panel, checks land one at a time, and the dial settles on **72** with three
blockers. Showing an imperfect score is deliberate — the interesting question
for a visitor is what their own number would be, and a flawless green
dashboard doesn't provoke it.

The same gesture returns in the report preview when you hit **Re-run**.

## Structure

```
app/
  page.tsx            the homepage — finalized, do not redesign
  globals.css         design tokens, primitives, keyframes
  pricing/ login/ signup/ start/
  dashboard/          overview, checker, reports, billing, settings
  admin/              stats, users, plans, subscriptions, gateways, logs
  api/                auth, checkout, webhooks, analysis, reports,
                      account, admin
components/
  ui/                 Container, Button, GlassCard, ScoreArc, UrlForm, Toast,
                      Field, Skeleton, Badge, EmptyState, ProgressStages
  illustrations/      Logomark, Aurora, GridPlane, AuditCard, glyphs
  sections/           Navbar, Hero, TrustBar, Stats, Process, Features,
                      ReportPreview, FinalCta, Footer
  auth/ pricing/ dashboard/ report/ billing/ account/ admin/
lib/
  plans.ts            shipped plan defaults and the feature catalogue
  plan-catalogue.ts   the live plans table — the source of truth
  entitlement.ts      what an account may do, and why not
  secrets.ts          AES-256-GCM for stored gateway credentials
  env.ts              every process.env read in the codebase
  db/                 schema, migrations, repositories, admin log
  auth/               scrypt, session cookies, route guards
  payments/           the Gateway contract, Razorpay, Cashfree, PayPal
  billing/fulfil.ts   the only code that grants a plan
  analysis/           fetcher, HTML reader, 44 checks, scoring
  audit-service.ts    validate → authorise → consume → run → store
scripts/verify.mjs    npm run verify
middleware.ts         edge-safe dashboard and admin gate
```

## Interaction notes

`prefers-reduced-motion` is honoured throughout: the sweep is removed and
every reveal, count-up, and arc animation resolves instantly. Keyboard focus
is visible on every control. Forms validate on submit with inline messages,
lists have skeleton and empty states, and every failure the flow can produce —
invalid URL, refused address, DNS failure, dead site, scan failure, no plan,
expired plan, monthly limit reached, site limit reached, locked feature,
payment failure, unverifiable webhook, unauthorized access, suspended account,
disabled gateway, server error — has its own worded message rather than a
generic one. Server errors are logged server-side and answered with a generic
message; no stack trace or database detail reaches the browser.

## Illustrations

All SVG is hand-drawn in `components/illustrations/`. The platform glyphs in
the trust row are original geometric marks, not reproductions of anyone's
trademark — the wordmark beside each does the naming.
