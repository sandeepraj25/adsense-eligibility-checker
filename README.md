# Verdict — AdSense Eligibility Checker

Premium dark homepage for a pre-review AdSense audit tool. Frontend only —
no backend, no API calls. All report data is static and lives in
`lib/checks.ts`.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Also available: `npm run build`, `npm run typecheck`.

## Stack

Next.js 15 (App Router) · React 19 · Tailwind CSS v4 (CSS-first `@theme`) ·
Framer Motion · lucide-react.

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
  layout.tsx          fonts + metadata
  page.tsx            section composition
  globals.css         design tokens, primitives, keyframes
components/
  ScanContext.tsx     shared domain + run counter (no network)
  ui/                 Container, Button, GlassCard, SectionHeader, Eyebrow,
                      Reveal, CountUp, Status, ScoreArc, UrlForm
  illustrations/      Logomark, Aurora, GridPlane, StepGlyphs,
                      PlatformGlyphs, AuditCard
  sections/           Navbar, Hero, TrustBar, Stats, Process, Features,
                      ReportPreview, FinalCta, Footer
lib/
  checks.ts           report data and stats
  domain.ts           input normalisation
  cn.ts               class joiner
```

## Interaction notes

Submitting a URL in either form validates the host, then arms the report
preview and scrolls to it — the entered domain is echoed in the report
header. The report's category rail, expandable findings, and re-run button
are all real interface behaviour.

`prefers-reduced-motion` is honoured throughout: the sweep is removed and
every reveal, count-up, and arc animation resolves instantly. Keyboard focus
is visible on every control.

## Illustrations

All SVG is hand-drawn in `components/illustrations/`. The platform glyphs in
the trust row are original geometric marks, not reproductions of anyone's
trademark — the wordmark beside each does the naming.
