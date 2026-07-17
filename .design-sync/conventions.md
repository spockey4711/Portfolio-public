# Portfolio Design System — "Sand & Pine + Serif"

A small set of React primitives from a personal portfolio site. Calm warm-sand
surfaces, a pine-green primary accent, and a serif/mono editorial voice.

## Setup — no provider needed

Import a component and render it. There is **no** context provider or theme
wrapper: the tokens, brand fonts, and component styles all ship in the bound
`styles.css` (which `@import`s `_ds_bundle.css` and the fonts). Nothing to
configure — a bare render is already fully styled.

```jsx
import { Button, Card, MonoLabel, Pill } from "<bundle>";

<Card className="flex flex-col gap-4">
  <MonoLabel tone="pine">01 / Projekt</MonoLabel>
  <h3 className="font-serif text-ink">Portfolio</h3>
  <p className="font-sans text-ink-soft">Gebaut mit Next.js.</p>
  <Button variant="ghost" href="#projekt">Ansehen</Button>
</Card>
```

Site copy is German (`de-DE`) — match it when writing example content.

## Styling idiom: Tailwind v4 utilities with a token vocabulary

Style with **Tailwind utility classes**. Layout is plain Tailwind (`flex`,
`gap-4`, `items-center`, …); colour, type, and radius speak this system's own
token names. Do not invent colour values — use these classes (each maps to a
`var(--token)`):

| Concern | Classes |
|---|---|
| Background | `bg-bg` (page sand), `bg-surface` (cards/pills), `bg-pine` (primary), `bg-signal` (interaction/glow) |
| Text | `text-ink` (headlines), `text-ink-soft` (body), `text-muted` (captions/meta), `text-pine` (accent), `text-signal` (active/links) |
| Border | `border-line` (dividers), `border-line-strong` (control borders) |
| Font | `font-serif` (Instrument Serif — headlines), `font-sans` (Hanken Grotesk — body/UI), `font-mono` (IBM Plex Mono — labels, kickers, buttons) |
| Radius | `rounded-button` (9px), `rounded-card` (12px), `rounded-pill` (999px) |

Hover moves use standard Tailwind variants (e.g. `hover:bg-signal`,
`hover:text-signal`). The raw tokens are also available as `var(--pine)`,
`var(--surface)`, `var(--ink-soft)`, etc. for hand-written CSS.

**Core rule:** `pine` carries calm static surfaces; `signal` green is only for
interaction, hover, and glowing elements — never large fills.

## Where the truth lives

- `styles.css` and its `@import` closure (`_ds_bundle.css`, fonts) — the styled
  truth every design receives.
- `guidelines/` — the design handoff and specs (tokens, type scale, spacing,
  accessibility, motion). Read `design-system.md` before styling.
- Per component, `<Name>.prompt.md` — its props and idiomatic usage.

## The components

`Button` (variants `primary` / `secondary` / `ghost`; renders an anchor when
`href` is set), `Card` (raised surface), `Pill` (status pill; `dot` adds the
pulsing signal dot), `MonoLabel` (uppercase mono micro-text; `tone` =
`pine` / `muted` / `ink`), `SectionHeader` (`index` + `title` eyebrow with a
full-width divider), `Divider` (1px `line` rule).
