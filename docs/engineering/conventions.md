# Code conventions

**Purpose:** how code is written here, so it stays consistent regardless of who (or what)
writes it. Enforced by ESLint/Prettier/TypeScript and by review.

Related: [project structure](../architecture/project-structure.md) ·
[git workflow](git-workflow.md) · [quality & testing](quality-and-testing.md)

## Language & tooling

- **TypeScript, `strict: true`.** No `any` unless justified with a comment; prefer
  `unknown` + narrowing. No non-null `!` assertions without a reason.
- **Prettier** owns formatting - do not hand-format or argue with it. Run on save / in
  CI.
- **ESLint** (Next config + `jsx-a11y` + import ordering) is the lint gate. Warnings are
  not acceptable in CI; fix or explicitly disable with a justification comment.
- **English** for all identifiers, comments and docs. German only inside `content/`
  strings. See [ADR-0004](../architecture/decisions/0004-docs-language.md).

## Naming

- Files: components `PascalCase.tsx`; modules/utilities `kebab-case.ts`; hooks
  `use-thing.ts` exporting `useThing`.
- React components: `PascalCase`. Props type: `ComponentNameProps`.
- Variables/functions: `camelCase`. Constants: `UPPER_SNAKE_CASE` only for true
  compile-time constants.
- Booleans read as predicates: `isVisible`, `hasBooted`, `shouldReduceMotion`.
- Types/interfaces: `PascalCase`, no `I`-prefix.

## React / Next

- **Server Components by default.** Add `'use client'` only where interactivity,
  browser APIs or hooks require it - and keep client components small and at the leaves.
- Live data never fetched from client components directly - go through `app/api/*`
  route handlers (see [rendering & data](../architecture/rendering-and-data.md)).
- One component per file (plus tightly-coupled small subcomponents). A section that owns
  a component keeps it in the section folder.
- No business logic in JSX - extract to `lib/` and test it.
- Keys are stable ids, never array indices for dynamic lists.
- Prefer composition over configuration-flag props that balloon over time.

## Styling

- Tailwind utilities + design tokens only. **No raw hex values in components** - always a
  token (`text-ink`, `bg-pine`, …). See
  [ADR-0003](../architecture/decisions/0003-styling.md).
- No inline magic-number spacing that contradicts the scale; use the spacing tokens.
- Per-frame animation writes a CSS variable via a ref, not React state (see
  [animation & motion](../design/animation-and-motion.md)).
- Group long class lists logically (layout → spacing → color → state); consider a `cn()`
  helper for conditional classes.

## Content & data

- All user-facing German strings live in `content/`, typed. No German string literals
  scattered in components.
- Project data conforms to the model in [projects](../content/projects.md).

## Comments

- Comment the **why**, not the **what**. Delete dead code instead of commenting it out
  (git remembers).
- Public functions in `lib/` get a one-line doc comment on intent and units (e.g. scroll
  math, timings in ms).

## Errors & resilience

- Live-data code returns typed "unavailable" states rather than throwing into the render.
  Widgets degrade gracefully (see
  [rendering & data](../architecture/rendering-and-data.md)).
- No secrets in client bundles or `NEXT_PUBLIC_*`. See
  [environment variables](../operations/environment-variables.md).

## Dependencies

- Add a dependency only when it clearly beats a small amount of local code. Prefer the
  platform (Intl, IntersectionObserver, fetch) over a package.
- Pin versions; review `pnpm-lock.yaml` changes. Record notable additions in the
  changelog and, if architectural, an ADR.
