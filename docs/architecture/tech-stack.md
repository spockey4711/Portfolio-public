# Tech stack

**Purpose:** the technology choices and the versions resolved in this checkout. When a
version or tool changes, update this file. `pnpm-lock.yaml` is the source of truth for
the resolved version; `package.json` is the source of truth for the declared range or pin.

Related: [rendering and data](rendering-and-data.md) ·
[quality and testing](../engineering/quality-and-testing.md). Architecture decision
records are not published in this checkout.

## Summary

| Concern | Choice |
|---|---|
| Language | TypeScript (strict) |
| Runtime | Node.js 22 LTS (`>=22.13`, `.nvmrc`) |
| Package manager | pnpm 11.9.0 |
| Framework | Next.js 16.3.5 (App Router) + React 19.3.0 |
| Styling | Tailwind CSS 4 + CSS variables for tokens |
| Motion | CSS (`motion-safe`, keyframes in `app/globals.css`). No Framer Motion package. |
| Fonts | `next/font` (see `app/fonts.ts`) |
| Icons | none by default; Lucide is not a dependency |
| Linting | ESLint 9 + Prettier 3 |
| Testing | Vitest 4 + Testing Library; Playwright 1.63 for smoke, axe, and visual |
| Container | Docker (multi-stage `Dockerfile`) |
| Image publish | GitHub Actions → GHCR (`.github/workflows/deploy.yml`) |
| Host | Not documented in this checkout. The workflow does not roll out. |
| CI | GitHub Actions (`.github/workflows/ci.yml`) |

## Versions

Resolved from `pnpm-lock.yaml` on this tree (lockfile version 9.0). Ranges in
`package.json` are caret unless the specifier below is exact.

| Package | Declared (`package.json`) | Resolved (`pnpm-lock.yaml`) |
|---|---|---|
| `next` | `16.3.5` | `16.3.5` |
| `react` / `react-dom` | `19.3.0` | `19.3.0` |
| `typescript` | `^6` | `6.0.3` |
| `tailwindcss` | `^4` | `4.3.3` (`@tailwindcss/postcss` `4.3.3`) |
| `framer-motion` | not a dependency | not installed |
| `vitest` | `^4.1.10` | `4.1.10` |
| `@playwright/test` | `^1.63.0` | `1.63.0` |
| `eslint` | `^9` | `9.39.4` |
| `prettier` | `^3.9.6` | `3.9.6` |

Node is pinned via `.nvmrc` (`22`) and `engines` (`node >=22.13`) in `package.json`.
Node 22 LTS is the floor because pnpm 11.9 requires Node `>=22.13`. CI and the Docker
image build on Node 22.

## Why these

- **Next.js (App Router).** The site is mostly static content with a few client islands
  and server route handlers for live data, so API tokens stay off the client. Static
  sections are rendered at build time; live data goes through route handlers. The only
  live widget mounted on a page is the GitHub heatmap
  (`components/widgets/github-activity/GithubActivity.tsx`).
- **TypeScript, strict.** The project is meant to last; types are the cheapest
  documentation and the cheapest bug prevention.
- **Tailwind + CSS variables.** Tokens live as CSS variables and are exposed to
  Tailwind's theme. There is no `tailwind.config.ts`; Tailwind 4 is wired through
  PostCSS (`postcss.config.mjs`).
- **CSS motion, not Framer Motion.** Reveals are CSS under `motion-safe`. Scroll
  progress for the nav percentage is a `requestAnimationFrame` loop that writes the DOM
  via a ref (`lib/hooks/use-scroll-progress.ts`), not React state per frame. A scroll
  spine is specified in [animation and motion](../design/animation-and-motion.md) and
  is not mounted. This file does not decide whether to build it.
- **pnpm.** Fast, strict, disk-efficient; good with a single-package repo and CI cache.
- **Docker image on GHCR.** This repo publishes an image. It does not document the
  server, TLS, or DNS. See [deployment](../operations/deployment.md).

## Explicitly not used (in this checkout)

- **No CMS.** Content lives in typed files under `content/`, including MDX blog posts.
- **No component library (MUI/Chakra/…).** Small primitives are in `components/ui`.
- **No state manager (Redux/Zustand).**
- **No Framer Motion.** Do not add it to match an older sentence in this file.
- **Self-hosted, cookieless analytics (Umami), off by default.** A tag attaches only
  when a build supplies both public `NEXT_PUBLIC_ANALYTICS_*` values. See
  [analytics](../operations/analytics.md).
