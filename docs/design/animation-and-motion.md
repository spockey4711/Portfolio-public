# Animation and motion

**Purpose:** the motion spec — what animates, with which timings, and how it is built so
it stays smooth and accessible. Timings below are from the design handoff and are
binding.

Related: [design system](design-system.md) · [accessibility](accessibility.md) ·
[rendering & data](../architecture/rendering-and-data.md)

## Principle

Motion supports orientation and storytelling; it never performs for itself. Everything
here must be smooth (60fps), must not cause layout shift, and must have a reduced-motion
fallback (see [accessibility](accessibility.md)).

## The signature elements

A once-per-session terminal boot overlay used to precede the hero reveal; it was removed
because a multi-second splash hurts first-visit acquisition. The hero now reveals
immediately.

### Hero reveal
- Hero elements rise in from first paint (`riseUp`: opacity 0→1 + translateY
  16px→0, ~0.8s ease forwards).
- The text column rises top-to-bottom (name, positioning, availability line, CTAs)
  staggered 0-0.36s. The hero holds nothing but the words - no imagery (PORT-47, design
  audit 2026-09) - so this stagger is the whole sequence. Under reduced motion every element is
  settled from first paint (it rests hidden only under `motion-safe`).

### Scroll spine (the signature)
- Fixed vertical line at `left: 71px`, full height, width 2px, track color `--line`,
  z-index 5.
- **Fill:** a child, width 2px, background `--pine`, whose `height` equals scroll
  progress in %.
- **Node:** an 8px `--signal` dot whose `top` equals scroll progress in %, with a
  bg-colored halo ring; it rides the fill's end.
- **Nav percentage** shows the same value (`NN%`).
- Progress = `clamp(scrollY / (scrollHeight - innerHeight), 0, 1)`, snapped to a
  clean `0`/`1` within a ~2px tolerance of either end. The browser rests `scrollY`
  a hair short of `scrollable` (sub-pixel on Retina, a few pixels after a momentum
  scroll); that gap is invisible on a tall page but a visible slice of the bar on a
  short one, so without the snap the fill stalls just under 100% on pages like
  `/jetzt` or `/impressum`.

**Performance (critical):** do not drive the spine via React state per frame. Update on
`scroll` (passive) and `resize`, batched in a `requestAnimationFrame`, by writing a CSS
variable (e.g. `--progress`) or a `transform` directly on the elements via refs. React
renders the structure once; the animation mutates the DOM/CSS var only. Read layout
values once and cache them; recompute `scrollHeight`/`innerHeight` on resize and on
document-height changes (via a `ResizeObserver`), not on scroll. The observer is what
keeps progress exact at the very bottom: the page grows and shrinks after mount without
firing `resize` (fonts settling, images loading, expanding content), and a stale height
would leave the fill short of - or past - 100% at the end. Observe `document.body`, not
`document.documentElement`: the root carries `overflow-x: clip` (globals.css), which makes
it a scroll container whose own box is pinned to the viewport height and never reports
document growth, so an observer on it would silently never fire and the bar would hit 100%
before the true bottom (R-1).

### Scroll cue
- Centered under the hero: mono "scroll" (uppercase, letter-spaced, muted) + a mouse
  glyph (16×26 rounded rect, border) with a pine dot running down via `cueDot`
  (translateY 0→22px, opacity 0→1→0, 1.6s ease-in-out infinite).

## Keyframes (binding)

| Name | Purpose | Definition |
|---|---|---|
| `blink` | Cursor | 0–49% opacity 1, 50–100% opacity 0; `1.6s step-end infinite` |
| `riseUp` | Hero reveal | opacity 0→1 + translateY 16px→0; ~0.8s ease forwards; staggered |
| `cueDot` | Scroll cue | translateY 0→22px, opacity 0→1→0; 1.6s ease-in-out infinite |
| `glowPulse` | Status/kicker dot | box-shadow ring 0→5px in signal green; 2.4s ease infinite |

## Hover and focus micro-interactions (S4-6)

All links/buttons transition color/border to `signal` or `pine` over ~0.2s. On the
signature surfaces these are choreographed so hover and keyboard focus stay in step and
every move has a reduced-motion path:

- **Arrow affordance.** A trailing arrow on a CTA or link nudges a couple of pixels in its
  travel direction on hover **and** `:focus-visible` - forward links (`→`) slide right,
  external links (`↗`) lift up-right. One shared `ArrowAffordance`
  (`components/ui/ArrowAffordance.tsx`) owns it; the enclosing control carries `group` (every
  `Button` does) so pointer and keyboard trigger the same move. `motion-safe` only, so
  reduced motion shows the static glyph.
- **Project cards.** The whole linked card shifts its border to `pine`, lifts with the widget
  shadow and rises `-translate-y-1`, and its cover image zooms `scale-[1.03]` (clipped by the
  frame). Colour/border/shadow apply always; the `translate`/`scale` are `motion-safe` only.
  The move is bound to both `group-hover` and `group-focus-visible`, so tabbing to a card
  gives the same feedback as hovering it, on top of the global focus ring.
- **Command palette.** The row highlight transitions colour over 0.15s so it glides between
  entries during ArrowUp/Down navigation instead of snapping (colour-only, no motion guard).

Keyboard focus is never removed: the global `:focus-visible` ring (see
[accessibility](accessibility.md)) stays on top of these hover-parity cues, and the terminal
strip shows a `focus-within` ring when its input is focused.

## Scroll position persistence

Throttle `scrollY` (rAF) into `localStorage['pf_scroll_v1']`; on load, restore after the
first frame with `window.scrollTo`. Skip restoration if reduced motion would make a jump
jarring — restore instantly without smooth behavior.

## What drives what (state)

- `scrollRatio` (0..1) — drives spine fill, node position and nav percentage. **Never**
  a per-frame React state; a ref/CSS variable.
- terminal state (P2-1) — command log, input value and entered-command history; plain
  React state (per keypress, not per frame), local to `components/widgets/terminal`.
- (later) live data — time/weather/location, GitHub activity, now-playing.

## Route view transitions (S2-7)

Route changes between the onepager, the `/projekte` index and the project detail pages
cross-fade with the browser's native [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API).
It is strict progressive enhancement, never a hard dependency:

- **Where it runs.** Only when `document.startViewTransition` exists **and** reduced motion
  is not requested (`lib/motion/view-transitions.ts#shouldAnimateViewTransition`). Otherwise
  the plain, instant client navigation runs unchanged - the required fallback for older
  browsers and reduced motion.
- **How it is wired.** A transition-aware `Link` (`components/chrome/view-transitions`) wraps
  `next/link`; it reuses `next/link`'s prefetch and click semantics (`onNavigate` fires only
  for genuine client navigations) and takes over just those. Stable React has no
  `<ViewTransition>` component yet, so a `ViewTransitionProvider` mounted in the root layout
  drives `document.startViewTransition` manually: it hands the API a promise and resolves it
  once the new route commits (an effect that runs after the navigation's render). A safety
  timeout (`MAX_TRANSITION_MS`) guarantees a stalled navigation can never block interaction.
- **Timing.** The root cross-fade is tuned to ~0.28s ease in `app/globals.css` to match the
  site's motion language. A `prefers-reduced-motion` rule there also force-disables the
  `::view-transition-*` animations as a belt-and-suspenders fallback.
- **No layout shift.** Only in-app route links are swapped; external links
  (`ProjectCard` live/demo/repo) keep their plain `<a target="_blank">`. The cross-fade is a
  compositor-only opacity animation, so it adds no CLS.

## Framer Motion vs. hand-rolled

- Use **Framer Motion** for orchestration and reveal/stagger (hero rise,
  section reveals via `whileInView`).
- Use **hand-rolled rAF + CSS variables** for the continuous scroll-driven spine, because
  it runs every frame and must stay off the React render path.
