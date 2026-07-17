# Responsive & mobile optimization

**Purpose:** the single reference for how the site behaves from a 320px phone up to the
1440px design width. The handoff was drawn for desktop; this doc defines how that design
degrades gracefully so that on any narrow screen **nothing is cut off, nothing overflows
horizontally, and no decorative chrome crowds the content**. It states the shared layout
frame every section reuses, the fluid type rules, how the chrome collapses, and a testing
checklist.

Related: [design system](design-system.md) · [accessibility](accessibility.md) ·
[animation & motion](animation-and-motion.md) ·
[handoff "Responsive behavior"](handoff/README.md) ·
[ADR-0003 styling](../architecture/decisions/0003-styling.md)

The handoff is authoritative for the desktop visual; this doc is authoritative for how it
adapts below that. If they disagree on adaptation, this doc wins and the handoff note gets
a pointer here.

## Principles

- **Content first, chrome second.** The scroll spine, the live percentage and the hero
  character are desktop flourishes. On small screens they hide or step back before any
  text or interactive control is compromised.
- **Nothing gets clipped.** No fixed pixel width may exceed the viewport. Every full-bleed
  or fixed element must have a mobile fallback; every long string (URLs, terminal output,
  code tokens, project names) must wrap or scroll inside its box, never past it.
- **No horizontal scroll, ever.** A horizontal scrollbar on any breakpoint is a bug. The
  document must fit `100vw` at 320px.
- **Fluid over stepped where it reads better.** Prefer `clamp()` for type and hero spacing
  so sizes flow between breakpoints; use discrete Tailwind breakpoints for layout changes
  (column counts, padding, showing/hiding chrome).
- **One shared frame.** Sections do not each invent their responsiveness. They reuse the
  canonical shell below, so a padding or breakpoint change happens in one place.

## Breakpoints

Tailwind v4 defaults, plus one project-specific query. There is no `tailwind.config`; the
theme lives in `app/globals.css`.

| Name | Min width | Primary use |
|---|---|---|
| (base) | 0 | Mobile-first defaults: single column, tight padding |
| `sm` | 640px | Roomier padding (`px-10`); first two-column grids (`sm:grid-cols-2`) |
| `md` | 768px | Two-column editorial grids (`md:grid-cols-2`), split hero-adjacent layouts |
| `lg` | 1024px | Desktop padding with spine gutter (`lg:pl-26 lg:pr-14`) |
| `min-[1100px]` | 1100px | Scroll spine becomes visible (`ScrollSpine`) |
| `xl` | 1280px | A third card column where a grid has enough items (`xl:grid-cols-3`, e.g. `/projekte`) |
| `2xl` | 1536px | Rarely needed; container caps at 1440px regardless |

Rule of thumb: **collapse dense editorial two-column blocks at `md`; collapse simple card
grids at `sm`, and add a third column at `xl` only where the grid has enough items to fill
it** (the onepager teaser stays two-up; Skills' four groups stay two-up). Match the existing
sections rather than picking a new breakpoint.

## The canonical section shell

Every top-level section and page `main` uses the same frame. Copy it; do not re-derive it:

```
mx-auto w-full max-w-(--container-max) px-6 sm:px-10 lg:pr-14 lg:pl-26
```

- `mx-auto max-w-(--container-max)` — centered content, capped at the design width. The cap
  is the single `--container-max` token (`app/globals.css`, currently 1440px); never
  hardcode the pixel value in a shell.
- `px-6` (24px) — base mobile side padding.
- `sm:px-10` (40px) — comfortable padding once there is room.
- `lg:pl-26` (104px) / `lg:pr-14` (56px) — the asymmetric desktop padding from the
  handoff. The large **left** padding only appears at `lg` because it exists to clear the
  scroll spine; below that the spine is hidden, so the content reclaims the space instead
  of wasting a 104px gutter on a phone.

Narrow pages (`/projekte`, project detail, legal) use the same `px-6 sm:px-10` progression
with a narrower `max-w` and may drop the `lg:pl-26` spine gutter where no spine renders.

## Fluid typography

Headlines never use a fixed px size that could overflow a phone. They use `clamp(min, vw,
max)` so they shrink with the viewport and stop growing at the design size. The clamps in
use:

| Role | Clamp | Where |
|---|---|---|
| Hero display | `clamp(2.5rem, 9vw, 4.5rem)` | `Hero` (40 → 72px) |
| Section headline | `clamp(2rem, 5vw, 2.875rem)` | About, project/legal/list `h1` |
| Contact lead | `clamp(1.75rem, 4vw, 2.5rem)` | `Contact` |

Rules:

- Any new display/headline text uses a `clamp()` in this family, not a bare px size.
- Constrain line length with `max-w-[NNch]` (e.g. hero `max-w-[14ch]`, body `~46ch`) so
  measure stays readable and text wraps early instead of running to the edge.
- Body and UI text stay at their fixed sizes (16-18px); they already wrap. Do not shrink
  body copy below 16px on mobile.

## Layout: how blocks collapse

- **Grids collapse to one column on mobile.** The base is `grid-cols-1`; two columns
  appear at `sm` for card grids (`Projects`, `Skills`, `/projekte`) or at `md` for
  editorial splits (`About`, `Contact`, `Experience`, `FeaturedProject`). Stacked order
  must read sensibly top-to-bottom.
- **Gaps scale down implicitly** by collapsing columns; keep vertical rhythm (`gap-y-*`)
  generous enough that stacked blocks do not merge visually.
- **The hero is full-bleed** (S2-2): it spans the viewport rather than the shared
  `--container-max`, reading as a wide overture above the container-capped sections below.
  Its left gutter still matches the site (`lg:pl-26`) so the left edge and scroll spine stay
  aligned; only the right side opens to the viewport edge. On `lg`+ a text column sits beside
  the live-status module; below `lg` they stack, text over module, copy fully visible at
  every width. Above `--container-max` the hero content reads intentionally wider than the
  sections below.
- **The project detail page is a two-column case study at `lg`+** (`ProjectDetail`): a
  story column at readable measure plus a sticky rail (`lg:sticky`) holding the actions,
  tech stack and headline numbers. Below `lg` the rail drops below the story, so the
  narrative comes first and the reference facts follow. The rail renders only what a
  project has and the grid is skipped entirely when there is nothing to put in it.

## Chrome on small screens

Decorative and navigational chrome must never overrun a narrow viewport.

- **Scroll spine** (`ScrollSpine`) — fixed at `left-[71px]`, `hidden` until
  `min-[1100px]:block`. It is `aria-hidden`, purely informational, and simply does not
  exist below 1100px, which is also why the section left padding only grows at `lg`.
- **Hero character** (`HeroCharacter`) — a decorative one-shot walk-in video. It is
  suppressed under `prefers-reduced-motion` (renders nothing) and, by the same rule, below
  `lg` (`min-width: 1024px`): at narrow / mobile widths a `45vh` full-width figure crowds
  the single-column hero and adds a video download for no benefit. Both gates are read
  client-side, so the `<video>` is only added to the tree once the viewport is confirmed to
  allow motion and be wide enough - which means small screens get the hero copy only, no
  character, and never fetch the clip.
- **Nav** (`Nav`) — fixed header with a logo, the section links, a "Mehr" menu and a live
  scroll percentage. It uses the canonical shell padding (`px-6 sm:px-10 lg:pr-14 lg:pl-26`)
  rather than the fixed desktop `pl-26 pr-14`, and respects `env(safe-area-inset-*)` so its
  content clears a notch or home indicator. The inline links, the "Mehr" menu and the
  percentage show from `md` up; below `md` they collapse behind a single ~44px menu affordance
  so the header degrades to logo + menu button and the link row can never overflow a phone.
  The "Mehr" menu is a desktop disclosure that groups the page links (blog, uses, now), the
  command palette trigger and the language toggle behind one button, keeping the inline row a
  scroll-only map of the sections (ADR-0005); the phone menu holds those same destinations
  inline. Both disclosures close on Escape (returning focus to the trigger) and on a press
  outside, and neither traps focus.

## Viewport, safe areas and touch

- **Full-height sections** prefer dynamic viewport units (`dvh`) over `100vh`. The hero uses
  `min-h-dvh`, which tracks the visible viewport, rather than `100vh`, which mobile browsers
  measure against the tallest layout so it jumps and shows a blank strip as the address bar
  shows/hides.
- **Notched devices:** respect the safe-area insets for any element pinned to a screen
  edge (fixed nav, footer, full-bleed media) via `env(safe-area-inset-*)` so content is
  not tucked under a notch or home indicator.
- **Touch targets:** interactive controls (nav links, buttons, the menu affordance) keep a
  comfortable hit area on touch - aim for ~44px - and enough spacing that neighbouring
  targets are not mis-tapped. Do not rely on hover-only affordances for meaning on touch.
- **Media:** videos and images use `object-contain`/`object-cover` with fluid sizing, no
  fixed pixel dimensions wider than the viewport. Overflowing widgets (terminal, GitHub
  heatmap) scroll or wrap inside their card, never past it.

## Testing checklist

Before calling a change mobile-ready, verify at these widths (browser devtools plus a real
device via the dev subdomain, `portfolio.yannikwuenker.de`):

- **320px** (smallest supported), **360 / 390px** (typical phones), **768px** (tablet /
  `md`), **1024px** (`lg`), **1100px** (spine appears), **1320px** (design width).
- No horizontal scrollbar and no clipped text at any of them.
- Headlines shrink via `clamp` and never overflow their column.
- The scroll spine, hero character and nav percentage are absent/collapsed on phones; the
  nav links do not overflow.
- Full-height hero shows no blank strip / clipped content as the mobile address bar
  toggles.
- `prefers-reduced-motion` still renders a static, complete layout.

## Current gaps

Documented so the doc stays honest; these are the known deltas between this policy and the
code, tracked in the [backlog](../project/backlog.md#responsive--mobile-hardening):

- None currently.
