# Portfolio — yannikwuenker.de

Personal portfolio site for **Yannik Wünker**, a business informatics
(Wirtschaftsinformatik) student in Cologne building apps, web products and small
systems that solve concrete problems.

The site is not a static CV. It is a quiet, technical, high-quality developer/product
portfolio that unfolds while scrolling — a boot sequence, a scroll spine that tracks
progress, terminal touches and small live widgets — without ever feeling like an
experimental designer playground.

> **Positioning** — Wirtschaftsinformatik student from Cologne. I build apps, web
> products and small systems that solve real problems — from fueling for endurance
> athletes to process optimization with Python and AI.

- **Live domain (target):** https://yannikwuenker.de
- **Status:** planning / pre-build (no application code yet — this repo currently holds
  the documentation, including the design handoff and the project plan)
- **Language of the site UI:** German · **Language of code & docs:** English

---

## Table of contents

- [What this repository is](#what-this-repository-is)
- [Tech stack at a glance](#tech-stack-at-a-glance)
- [Repository layout](#repository-layout)
- [Documentation map](#documentation-map)
- [Getting started (once code exists)](#getting-started-once-code-exists)
- [How work is organized](#how-work-is-organized)
- [Roadmap in one screen](#roadmap-in-one-screen)
- [Task handoff — where to start](#task-handoff--where-to-start)
- [Conventions](#conventions)
- [Contact](#contact)

---

## What this repository is

This repository is the single source of truth for the portfolio project. Right now it
contains everything needed to build the site **except the site itself**:

- the **design handoff** (`docs/design/handoff/`) — a finalized design system
  ("Sand & Pine + Serif") plus a high-fidelity Hero reference, authored in an internal
  HTML preview format;
- the **documentation** (`docs/`) — vision, architecture, engineering conventions,
  operations and the project plan that turn the vision and design into a buildable,
  maintainable product.

The application code (Next.js app) will live in `app/`, `components/`, `lib/` etc. and
is introduced in [Phase 0 of the roadmap](docs/project/roadmap.md).

The site is meant to be maintained for years as a personal product, not shipped once as
a landing page. Structure, docs and conventions are set up accordingly.

## Tech stack at a glance

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router)** + React + TypeScript | Interactivity (terminal, live widgets, boot), API routes for live data, strong DX. See [ADR-0001](docs/architecture/decisions/0001-framework.md). |
| Styling | **Tailwind CSS** + CSS variables for design tokens | Fast, consistent, tokens map 1:1 to the design system. See [ADR-0003](docs/architecture/decisions/0003-styling.md). |
| Motion | **Framer Motion** + `IntersectionObserver` / `requestAnimationFrame` | Scroll spine, reveals, boot sequence. See [animation spec](docs/design/animation-and-motion.md). |
| Fonts | Instrument Serif · Hanken Grotesk · IBM Plex Mono (Google Fonts, self-hosted via `next/font`) | Defined by the design system. |
| Hosting | **Contabo VPS** (self-managed), Docker + Nginx reverse proxy + Let's Encrypt | Own the stack, generous RAM. See [ADR-0002](docs/architecture/decisions/0002-hosting.md). |
| CI/CD | **GitHub Actions** → build image → deploy to the VPS | Reproducible deploys. See [deployment](docs/operations/deployment.md). |
| Analytics | Optional, privacy-friendly (Plausible/Umami), self-hosted, only if it drives real decisions | Per owner preference. |

Exact versions are pinned in [`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md).

## Repository layout

```
.
├── README.md                     ← you are here
├── CHANGELOG.md                  ← human-readable history (Keep a Changelog)
├── CONTRIBUTING.md               ← how to work in this repo (git, commits, PRs)
├── LICENSE
│
└── docs/                         ← all project documentation, incl. the authoritative
                                     design handoff in docs/design/handoff/ (see map below)
```

Once development starts, the application source is added following the structure defined
in [`docs/architecture/project-structure.md`](docs/architecture/project-structure.md).

## Documentation map

Everything lives under [`docs/`](docs/). Start at the [docs index](docs/README.md).

| Area | Document | Use it for |
|---|---|---|
| Overview | [`docs/00-overview.md`](docs/00-overview.md) | Vision, goals, scope, success criteria |
| Architecture | [`architecture/tech-stack.md`](docs/architecture/tech-stack.md) | Pinned stack, versions, rationale |
| Architecture | [`architecture/project-structure.md`](docs/architecture/project-structure.md) | Where every file goes and why |
| Architecture | [`architecture/rendering-and-data.md`](docs/architecture/rendering-and-data.md) | SSG/SSR strategy, live-data API routes |
| Architecture | [`architecture/decisions/`](docs/architecture/decisions/README.md) | Architecture Decision Records (ADRs) |
| Design | [`design/design-system.md`](docs/design/design-system.md) | Tokens, type scale, spacing, components |
| Design | [`design/animation-and-motion.md`](docs/design/animation-and-motion.md) | Boot, scroll spine, keyframes, timings |
| Design | [`design/accessibility.md`](docs/design/accessibility.md) | a11y rules, reduced motion, contrast |
| Content | [`content/content-and-voice.md`](docs/content/content-and-voice.md) | Section-by-section copy, tone of voice |
| Content | [`content/projects.md`](docs/content/projects.md) | Project data model + per-project details |
| Content | [`content/seo.md`](docs/content/seo.md) | Metadata, Open Graph, structured data |
| Engineering | [`engineering/conventions.md`](docs/engineering/conventions.md) | Code style, naming, TypeScript rules |
| Engineering | [`engineering/git-workflow.md`](docs/engineering/git-workflow.md) | Branching, commits, PRs, releases |
| Engineering | [`engineering/quality-and-testing.md`](docs/engineering/quality-and-testing.md) | Testing, linting, performance budgets |
| Operations | [`operations/local-development.md`](docs/operations/local-development.md) | Run and develop locally |
| Operations | [`operations/deployment.md`](docs/operations/deployment.md) | Docker + Contabo VPS + CI/CD |
| Operations | [`operations/environment-variables.md`](docs/operations/environment-variables.md) | Every env var and secret |
| Project | [`project/roadmap.md`](docs/project/roadmap.md) | Phases and milestones |
| Project | [`project/backlog.md`](docs/project/backlog.md) | The concrete, prioritized task list |

## Getting started (once code exists)

> These commands become valid in **Phase 0**, when the Next.js app is scaffolded.
> Until then they are the target contract; see [local development](docs/operations/local-development.md).

```bash
# Prerequisites: Node 22 LTS, pnpm
pnpm install          # install dependencies
pnpm dev              # start the dev server on http://localhost:3000
pnpm build            # production build
pnpm start            # serve the production build
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test             # unit tests (Vitest)
pnpm test:e2e         # Playwright smoke tests
pnpm format           # Prettier write
```

Copy `.env.example` to `.env.local` and fill in the values documented in
[environment variables](docs/operations/environment-variables.md).

## How work is organized

- Work is broken into **phases** (see the [roadmap](docs/project/roadmap.md)); each phase
  has a clear deliverable and exit criteria.
- Concrete, pickup-ready tasks live in the [backlog](docs/project/backlog.md), each with
  an ID (`P0-1`, `P1-3`, …), scope, acceptance criteria and doc references.
- Every meaningful change is recorded in [`CHANGELOG.md`](CHANGELOG.md).
- Non-trivial technical decisions are captured as
  [ADRs](docs/architecture/decisions/README.md).

## Roadmap in one screen

| Phase | Goal | Exit criteria |
|---|---|---|
| **P0 — Foundation** | Next.js app scaffolded, tokens wired, CI green, deploy pipeline working end-to-end (empty page live on the domain) | `pnpm build` + deploy succeed; design tokens available as Tailwind theme |
| **P1 — MVP site** | Hero, Projects, About, Skills, Contact + scroll spine + boot sequence; German copy; SEO/OG; legal pages | Site tells who/what/why in 30s; Lighthouse ≥ 95; deployed to prod |
| **P2 — Signature widgets** | Interactive terminal, live time/weather/location, GitHub activity | Widgets degrade gracefully, no layout shift, respect reduced motion |
| **P3 — Depth** | Now-playing, hero video/mini-character, project detail pages, optional blog | Content complete, assets replaced, analytics reviewed |

Full detail in [`docs/project/roadmap.md`](docs/project/roadmap.md).

## Task handoff — where to start

If you are picking this up (future me, or a collaborator):

1. Read [`docs/00-overview.md`](docs/00-overview.md) and the
   [design handoff](docs/design/handoff/README.md) — 20 minutes, non-negotiable.
2. Skim the [roadmap](docs/project/roadmap.md) to see the shape of the work.
3. Open the [backlog](docs/project/backlog.md) and take the top unblocked task in the
   current phase. Start with **`P0-1` (scaffold the Next.js app)**.
4. Follow the [git workflow](docs/engineering/git-workflow.md): branch, small commits,
   update the changelog, open a PR against the checklist.

## Conventions

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) — see
  [git workflow](docs/engineering/git-workflow.md).
- **Changelog:** [Keep a Changelog](https://keepachangelog.com/), SemVer for tags.
- **Code & docs:** English. **Site UI copy:** German (`de-DE`).
- **Voice:** plain, direct, minimal, a little loose. No AI slop, no emojis, only the
  regular hyphen `-`. See [content & voice](docs/content/content-and-voice.md).
- **Naming:** the display name is `Yannik Wünker`; technical slugs/URLs use `yannik-wuenker`
  (no umlaut).

## Contact

- **Email:** mail@yannikwuenker.de
- **LinkedIn:** https://www.linkedin.com/in/yannik-wuenker/
- **GitHub:** https://github.com/spockey4711
