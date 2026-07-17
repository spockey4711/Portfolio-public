# Accessibility

**Purpose:** the accessibility bar. The site is animation-heavy and interactive, so this
is not optional polish — it is part of the definition of done and of the Lighthouse ≥ 95
target.

Related: [animation & motion](animation-and-motion.md) ·
[quality & testing](../engineering/quality-and-testing.md)

## Non-negotiables

### Reduced motion
Respect `prefers-reduced-motion: reduce`:

- Skip the boot overlay entirely (or show the six lines instantly, no stagger, no fade).
- Replace `riseUp` reveals with an instant appearance (no translate).
- Stop looping animations: `glowPulse`, `cueDot`, the terminal cursor `blink`, the
  equalizer bars — render their static end/rest state.
- The scroll spine still tracks progress (it is informational), but without smooth
  scroll-restoration jumps.
- Implement with a CSS media query and a matching JS check
  (`window.matchMedia('(prefers-reduced-motion: reduce)')`) for JS-driven animations.

### Keyboard
- Every interactive element (nav links, buttons, terminal input, project links) is
  reachable and operable by keyboard, in a logical tab order.
- A skip-to-content link is the first tab stop (`app/layout.tsx`): off-screen until
  focused, it jumps past the fixed nav to `<main id="main" tabIndex={-1}>`.
- Visible focus states everywhere — a clear focus ring (do not remove outlines without a
  replacement). Implemented as a single global `:focus-visible` rule in `app/globals.css`:
  a 2px `signal` outline with a 2px offset, so every tab stop shows the same on-brand ring.
- The terminal (Phase 2) must not trap focus; `Escape` and normal tabbing work.
- The command palette (S2-6, `components/widgets/command-palette`) opens on `⌘K`/`Ctrl-K`
  (and a nav `⌘K` chip). As a modal it contains `Tab` so focus never lands behind the
  overlay, but it is never a dead-end: `Escape` always closes it and focus returns to the
  element that opened it. It follows the ARIA combobox/listbox pattern (focus stays on the
  input; ArrowUp/Down move the highlight via `aria-activedescendant`).

### Semantics
- One `<h1>` (hero). Sections use `<h2>`; the numbered mono label (`01 / …`) is
  decorative, not the heading.
- Use landmarks: `<header>` (nav), `<main>`, `<footer>`, `<section>` with accessible
  names.
- `<html lang="de">`. Legal pages included.
- Links are `<a>`, buttons are `<button>` — never a `div` with an onClick.

### Color & contrast
- Body/heading text on background must meet WCAG AA (≥ 4.5:1 for normal text). The
  palette is designed for this; verify `ink`/`ink-soft`/`muted` on `bg`/`surface` and any
  text on `pine`. Muted micro-text must not drop below AA for its size. The `muted`
  (`#646659`) and `signal` (`#157A45`) tokens were darkened from their original handoff
  values in P1-15 so they clear AA as caption/status text (see
  [design-system](design-system.md)).
- The automated axe scan (S6-3) later caught two tokens that missed AA on the darkest
  background they render on: `signal` status-label text clears 4.5:1 on `--surface` but
  not on `--bg`, so resting status text (the project status badge) now uses the slightly
  darker `--signal-ink` (`#136F3F`); and the terminal faint tier `--term-text-faint` was
  lifted `#6B7D70` → `#7C907F` to clear AA on `--term-bg`. `signal` itself is unchanged as
  the interaction/glow accent.
- The dark theme (S4-2, ADR-0007) is held to the same bar: every text token
  (`ink`/`ink-soft`/`muted`/`pine`/`signal`/`moss`) clears AA (≥ 4.5:1) on both the dark
  `bg` and `surface`, with `muted` micro-text the tightest at ~6:1. The dark palette table
  lives in [design-system](design-system.md); re-run the contrast check on both themes when
  any token changes.
- Never rely on color alone to convey meaning (e.g. project status also has a text
  label, not just a colored dot).

### Live widgets
- Announce meaningful updates politely where relevant (`aria-live="polite"`), but do not
  spam screen readers with per-second time ticks — keep those visual-only or update
  coarsely.
- Decorative/live-only elements that carry no information (equalizer bars, spine fill)
  are `aria-hidden`.

### Media
- The hero video / mini-character (Phase 3) must not autoplay with sound; provide a
  reduced-motion still and respect autoplay preferences. Provide a text alternative for
  what it conveys.
- Any informative image has meaningful `alt`; decorative images have empty `alt`.

## How we check it

- Automated: a Lighthouse budget check runs in CI (a11y ≥ 95, `@lhci/cli` +
  `lighthouserc.json`); `eslint-plugin-jsx-a11y` on; the skip link and focus ring are
  covered by `tests/e2e/a11y.spec.ts`.
- Manual, before each release: tab through the whole page; toggle reduced motion; check
  focus visibility; run a contrast check on new colors.

See [quality & testing](../engineering/quality-and-testing.md) for how these gates run.
