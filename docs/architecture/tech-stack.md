# Tech stack

**Purpose:** the exact technology choices, pinned versions and the reasoning. When a
version or tool changes, update this file and the changelog.

Related: [ADR-0001 framework](../../private-docs/docs/architecture/decisions/0001-framework.md) ·
[ADR-0003 styling](../../private-docs/docs/architecture/decisions/0003-styling.md) ·
[rendering & data](rendering-and-data.md)

## Summary

| Concern | Choice |
|---|---|
| Language | TypeScript (strict) |
| Runtime | Node.js 22 LTS |
| Package manager | pnpm |
| Framework | Next.js (App Router) + React |
| Styling | Tailwind CSS + CSS variables for tokens |
| Motion | Framer Motion + native `IntersectionObserver` / `requestAnimationFrame` |
| Fonts | `next/font` (Instrument Serif, Hanken Grotesk, IBM Plex Mono) |
| Icons | none by default; Lucide (thin) only if needed |
| Linting | ESLint (next config) + Prettier |
| Testing | Vitest + Testing Library; Playwright for a couple of smoke E2E |
| Container | Docker (multi-stage) |
| Reverse proxy | Nginx + Let's Encrypt (certbot) |
| Host | Contabo VPS (self-managed) |
| CI/CD | GitHub Actions |

## Versions (pin on scaffold)

These are filled in with exact versions when the app is scaffolded in **P0**. Until
then, target the latest stable of each. Record the resolved versions here and rely on
`pnpm-lock.yaml` as the source of truth.

| Package | Target | Resolved |
|---|---|---|
| `next` | latest stable | `16.2.9` |
| `react` / `react-dom` | matches Next | `19.2.4` |
| `typescript` | 5.x | `5.9.3` |
| `tailwindcss` | 4.x (CSS-first, chosen at scaffold) | `4.3.2` (`@tailwindcss/postcss` `4.3.2`) |
| `framer-motion` | latest stable | _tbd (added when motion lands)_ |
| `vitest` | latest stable | _tbd (P0-3)_ |
| `@playwright/test` | latest stable | _tbd (P0-3)_ |
| `eslint` / `prettier` | latest stable | `eslint 9.39.4` / prettier _tbd (P0-3)_ |

Resolved on scaffold (P0-1, 2026-07-02). The original target noted Next `15.x`, but
`16.x` was the latest stable at scaffold time, so the app is on Next 16. `pnpm-lock.yaml`
is the source of truth; ranges in `package.json` are caret.

Node version is pinned via `.nvmrc` (`22`) and `engines` (`node >=22.13`) in
`package.json`. Node 22 LTS is the floor because pnpm 11.9 requires Node
`>=22.13`; local dev may run a newer line (e.g. 24). CI and the Docker image
build on Node 22.

## Why these

- **Next.js (App Router).** The site is mostly static content but needs real
  interactivity (boot sequence, scroll spine, an interactive terminal later) and
  server-side API routes for live data (weather, GitHub activity, now-playing) so we do
  not leak API keys to the client. Next covers both without gluing tools together.
  Static sections are rendered at build time; live data goes through route handlers with
  caching. See [ADR-0001](../../private-docs/docs/architecture/decisions/0001-framework.md).
- **TypeScript, strict.** The project is meant to last; types are the cheapest
  documentation and the cheapest bug prevention.
- **Tailwind + CSS variables.** The design system is token-driven. Tokens live as CSS
  variables (`--pine`, `--signal`, …) and are exposed to Tailwind's theme, so class
  names map to the design vocabulary and there is a single source of truth. See
  [ADR-0003](../../private-docs/docs/architecture/decisions/0003-styling.md).
- **Framer Motion, sparingly.** Reveal/stagger animations and orchestration. The
  performance-critical, per-frame work (scroll spine fill, nav percentage) does **not**
  go through React state — it mutates a CSS variable / transform via a ref in a
  `requestAnimationFrame` loop. See [animation & motion](../design/animation-and-motion.md).
- **pnpm.** Fast, strict, disk-efficient; good with a single-package repo and CI cache.
- **Docker + Nginx on a Contabo VPS.** Self-managed box with generous RAM; full control
  over TLS, caching and the domain. See [ADR-0002](../../private-docs/docs/architecture/decisions/0002-hosting.md) and
  [deployment](../../private-docs/docs/operations/deployment.md).

## Explicitly not used (for now)

- **No CMS.** Content is small and lives in typed data files (`content/`), versioned in
  git. Revisit only if a blog with frequent posts materializes.
- **No component library (MUI/Chakra/…).** The design is bespoke; a generic kit would
  fight the tokens. Small primitives are built in-house.
- **No state manager (Redux/Zustand).** Local component state + refs are enough. Revisit
  only if the terminal or dashboard state grows genuinely complex.
- **Self-hosted, cookieless analytics (Umami), off by default.** No third-party analytics
  vendor. A self-hosted Umami tag (S2-5) attaches only when a build supplies the two public
  `NEXT_PUBLIC_ANALYTICS_*` values, else nothing loads. See
  [ADR-0008](../../private-docs/docs/architecture/decisions/0008-analytics.md) and the [analytics runbook](../operations/analytics.md).
