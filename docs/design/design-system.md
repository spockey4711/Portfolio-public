# Design system

> **Redesign note (2026-07): "Pressroom" supersedes "Sand & Pine + Serif".**
> The landing redesign replaced the token values, the type pairing (Big Shoulders
> display + IBM Plex Sans body + IBM Plex Mono) and the landing page's structure
> (bento grid, slab nav, colophon footer). `app/globals.css` is the current source
> of truth for all token values; the token *names* and the architecture described
> below (ADR-0003 variable mapping, dark mode as a variable swap, a11y rules) are
> unchanged. The handoff in [`handoff/README.md`](handoff/README.md) and the value
> tables below describe the previous direction and are pending a full refresh.
>
> **Band rhythm (2026-07).** The landing page is no longer one wall-to-wall bento
> grid. `Onepager.tsx` is a vertical stack of **bands** in two registers that
> alternate so the page breathes: *open editorial bands* (about, experience,
> skills) render as plain prose straight on the paper background, set off by
> whitespace and a hairline rule; *framed instrument clusters* (projects poster +
> teasers, GitHub heatmap) keep the print-slab `Tile`, because for a real-UI
> widget the frame is the metaphor. The rule of thumb: **a box must earn its
> border** - reproduce a real interface (a contribution heatmap) and keep the
> frame; otherwise open onto the background. Per ADR-0011 the heatmap is the one
> signature widget on the one-pager; the terminal, now-playing, signals-of-life
> and WakaTime widgets moved off it into the depth layer.
> Each cluster leads with a `BandIntro` (mono eyebrow + one sentence, `landing.*`
> copy) - the "background with text" beat before the boxes resume. `Band` owns the
> shared measure (--container-max + horizontal padding); vertical rhythm is the
> stack's gap. Every band collapses to one column on mobile.

**Purpose:** the working reference for tokens and patterns while building. The
historical high-fidelity reference is the design handoff:
[`handoff/README.md`](handoff/README.md)
(direction "Sand & Pine + Serif" — superseded, see the note above). This doc mirrors
the essentials and states how they map into code.

Related: [responsive & mobile](responsive-and-mobile.md) ·
[animation & motion](animation-and-motion.md) ·
[accessibility](accessibility.md) · [ADR-0003 styling](../../private-docs/docs/architecture/decisions/0003-styling.md)

## Design tokens

Defined once as CSS variables in `app/globals.css` and exposed to Tailwind's theme.

### Color

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#EAE6D9` | Page background (warm "oat" sand) |
| `--surface` | `#F5F1E7` | Cards, pills, raised surfaces |
| `--ink` | `#1C211C` | Primary text, headlines |
| `--ink-soft` | `#57534A` | Body / secondary text |
| `--muted` | `#646659` | Labels, meta, captions (darkened from `#74766B` for WCAG AA at micro sizes) |
| `--line` | `#D8D3C3` | Borders, dividers, spine track |
| `--line-strong` | `#C6C1B0` | Resting border of interactive controls (secondary button) |
| `--pine` | `#24543F` | **Primary accent (surfaces):** buttons, active borders, headline accent, spine fill |
| `--signal` | `#157A45` | **Interaction/glow:** hover, active links, status dot, scroll node, highlights (darkened from `#1F8A5B` in P1-15) |
| `--signal-ink` | `#136F3F` | Resting status-label text that sits on `--bg` (the project status badge). `--signal` clears AA on `--surface` (4.77:1) but not on `--bg` (4.31:1); this slightly darker tier clears 4.5:1 on both (S6-3) |
| `--moss` | `#5C6B4A` | Secondary/quiet accents (optional: charts, icons) |

Terminal / dark context:

| Role | Hex |
|---|---|
| `--term-bg` | `#0F130F` |
| `--term-text` | `#E8EDE6` (bright) · `#9BB0A2` (muted) · `#7C907F` (faint, lifted from `#6B7D70` for WCAG AA - S6-3) |
| `--term-green` | `#5FB98A` (prompt/OK/cursor) |
| `--term-border` | `#2A352C` · `#244A34` (green) |
| REC dot (red) | `#C0392B` |

**The core rule:** Pine carries the calm (static surfaces). Signal green is only for
interaction, hover and "glowing" elements — never used across large areas.

Dark mode (S4-2, ADR-0007) — the same semantic tokens, redefined once under
`html[data-theme="dark"]` in `app/globals.css`; every utility recolours automatically
(ADR-0003). Pine and signal are lifted toward the terminal greens so they read as accents
on a dark surface; the `--term-*` tokens are unchanged (always-dark contexts). Every text
token clears WCAG AA on both `--bg` and `--surface` (see [accessibility.md](accessibility.md)):

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#EAE6D9` | `#12160F` |
| `--surface` | `#F5F1E7` | `#1B211A` |
| `--ink` | `#1C211C` | `#E8EDE6` |
| `--ink-soft` | `#57534A` | `#BFC9BC` |
| `--muted` | `#646659` | `#93A08D` |
| `--line` | `#D8D3C3` | `#2A352C` |
| `--line-strong` | `#C6C1B0` | `#3B473C` |
| `--pine` | `#24543F` | `#8FC4AB` |
| `--signal` | `#157A45` | `#64D6A0` |
| `--signal-ink` | `#136F3F` | `#64D6A0` (the accent green already clears AA on the dark surface) |
| `--moss` | `#5C6B4A` | `#9DB083` |

### Typography

Three families (via `next/font`):

- **Instrument Serif** (400 + italic) — display / headlines; editorial, calm. Italic is
  used for accent words, often in `pine`.
- **Hanken Grotesk** (400/500/600) — body and UI text.
- **IBM Plex Mono** (400/500/600) — labels, kickers, nav, buttons, terminal, all
  "technical" micro-text. Defines the character.

Type scale (authoritative values in the handoff):

| Role | Font | Size | Line-height | Weight | Extra |
|---|---|---|---|---|---|
| Hero display | Instrument Serif | 72px | 1.02 | 400 | tracking -0.01em, max 14ch |
| Section headline (h2) | Instrument Serif | 46px | 1.08 | 400 | |
| Sub-headline | Instrument Serif | 24px | ~1.2 | 400 | |
| Body large | Hanken Grotesk | 18px | 1.6 | 400 | max ~46ch |
| Body | Hanken Grotesk | 16–17px | 1.6–1.7 | 400 | |
| Mono kicker | IBM Plex Mono | 12.5px | — | 500 | tracking 1px, UPPERCASE, pine |
| Section label | IBM Plex Mono | 12px | — | 500 | tracking 2px, UPPERCASE, pine (`01 / …`) |
| Nav / button | IBM Plex Mono | 13–14px | — | 400–500 | |
| Micro / caption | IBM Plex Mono | 10–12px | — | 400 | muted |

Hero display scales on mobile: `clamp(40px, 10vw, 72px)`.

### Spacing & layout

- Content container: `max-width: 1440px`, centered. The cap is the single token
  `--container-max` (`app/globals.css`); every section and page shell references it as
  `max-w-(--container-max)`, so the width changes in one place. Flowing text keeps its own
  narrow measure (`~46-65ch`) regardless of the container width.
- Horizontal padding: **left 104px** (room for the scroll spine), **right 56px**.
- Vertical section spacing: ~110px top/bottom; hero `padding-top: 150px` (under fixed
  nav).
- Fixed nav height is exposed as `--nav-height` (`68px`) and used as the document
  `scroll-padding-top`, so anchor jumps land below the nav rather than under it.
- Section divider: `border-top: 1px solid var(--line)`.

### Radius

- Buttons / squared pills: `9px`
- Cards: `12px`
- Hero visual: `16px`
- Round pills / dots: `999px` / `50%`

### Shadows

- Floating widget: `0 20px 40px -24px rgba(40,60,40,0.4)`
- Node-dot ring: `0 0 0 3px var(--bg)` (halo in bg color)

## Reusable patterns

### Section header (use for every section)
Mono label `NN / Title` (pine, letter-spaced) + a flexible divider line
(`flex:1; height:1px; background: var(--line)`). Sections are numbered `01`, `02`, …
Build once as `components/ui/SectionHeader.tsx`; every section uses it.

### Buttons
- **Primary:** bg `pine`, text `surface`, radius 9px, padding 14/22. Hover: bg → `signal`.
- **Secondary:** transparent, border `1px` `line-strong` (`#C6C1B0`), text `ink`. Hover:
  border → `pine`.
- **Ghost:** text only in `pine`. Hover: → `signal`.

### Status pill
`surface` bg, `line` border, radius 999, pulsing `signal` dot + label
(e.g. "Verfügbar für Werkstudent").

## Component inventory (build order)

`ui/` primitives first, then `chrome/`, then sections, then `widgets/`.

- **ui:** `SectionHeader`, `Button` (3 variants), `Pill`, `Card`, `MonoLabel`,
  `Divider`.
- **chrome:** `Nav` (fixed, fade-out gradient, live scroll %), `ScrollSpine`,
  `Footer`.
- **sections:** `Hero`, `Projects`, `About`, `Skills`, `Experience`, `Contact`.
- **widgets (Phase 2+):** `Terminal`, `Weather`, `GithubActivity`, `NowPlaying`,
  `HeroVisual` (video/mini-character placeholder in MVP).

## Icons & assets

- Icons are intentionally minimal — CSS dots/shapes. If an icon set becomes necessary,
  use a thin one (e.g. Lucide) sparingly.
- No image assets ship in the handoff; MVP uses placeholders (hero visual, now-playing).
  See [content/projects.md](../content/projects.md) and the roadmap for when real assets
  land.
