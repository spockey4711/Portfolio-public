# Portfolio — yannikwuenker.de

Personal portfolio site for **Yannik Wünker**, a business informatics
(Wirtschaftsinformatik) student in Cologne. The public site is a Next.js app
(version `0.5.0` in `package.json`). It is a one-pager plus a small set of
depth routes, not a planning repository and not a product with its own accounts.

> **Positioning** — Wirtschaftsinformatik student from Cologne. I build apps, web
> products and small systems that solve real problems — from fueling for endurance
> athletes to process optimization with Python and AI.

- **Live domain (target):** https://yannikwuenker.de — this checkout does not prove
  which commit that host serves.
- **Status:** application code is in this repo (`app/`, `components/`, `lib/`,
  `content/`). Version `0.5.0`.
- **Site UI:** German (canonical, unprefixed) and English (`/en`). **Code and docs:**
  English.

---

## Table of contents

- [What this repository is](#what-this-repository-is)
- [What the site renders](#what-the-site-renders)
- [Tech stack at a glance](#tech-stack-at-a-glance)
- [Repository layout](#repository-layout)
- [Documentation map](#documentation-map)
- [Getting started](#getting-started)
- [How work is organized](#how-work-is-organized)
- [Conventions](#conventions)
- [Contact](#contact)

---

## What this repository is

This repository is the public source for the portfolio site: the Next.js application,
typed content, tests, and the docs that actually live under `docs/`.

Architecture decision records, the Plane backlog, and a server rollout runbook are
**not in this checkout**. Nothing in this README links to `private-docs/`. Image
publish is `.github/workflows/deploy.yml` (GHCR only). Rolling an image onto a server
is outside this repository and is not documented here.

## What the site renders

Home (`/` and `/en`) is `components/sections/Onepager.tsx`: hero masthead, projects,
about, experience, skills, the GitHub contribution heatmap, contact. The heatmap is
the only live widget mounted on a page. It calls same-origin `/api/github-activity`
and keeps a static caption if that route is unavailable
(`components/widgets/github-activity/GithubActivity.tsx`).

Other published routes, from `lib/i18n/routes.ts`: projects index and detail, blog
index and one translated post (`warum-dieses-portfolio`), Now, Uses, Impressum,
Datenschutz, each with an English twin. Route handlers also exist for weather,
now-playing, WakaTime, and latest commit. Their widgets are not imported by a page;
the command palette uses the terminal parser, not the terminal widget.

`SHOW_AVAILABILITY` is off unless the env flag is exactly `true` or `1`
(`lib/config/features.ts`, `.env.example`). The CV link renders only when
`public/cv/yannik-wuenker.pdf` exists.

Motion on the page is CSS (`app/globals.css`, `motion-safe`). The nav shows scroll
progress as text via `lib/hooks/use-scroll-progress.ts`. A scroll-spine element is
specified in `docs/design/animation-and-motion.md` and is not mounted. That spec is
unchanged here; building or striking it is an open product decision.

## Tech stack at a glance

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.3.5** (App Router) + React 19.3.0 + TypeScript 6.0.3 | Pins in `package.json` / `pnpm-lock.yaml`. |
| Styling | **Tailwind CSS 4.3.3** + CSS variables | Tokens in `app/globals.css`. |
| Motion | **CSS** (`motion-safe`, keyframes). No `framer-motion` dependency. | Nav percentage uses a ref/`requestAnimationFrame` hook, not React state per frame. |
| Fonts | `next/font` | See `app/fonts.ts`. |
| Package manager | pnpm 11.9.0 | `packageManager` in `package.json`. Node `>=22.13` (`.nvmrc`). |
| CI | GitHub Actions | Lint, typecheck, unit, build, Playwright (including axe), Lighthouse desktop home, visual. `.github/workflows/ci.yml`. |
| Image publish | GitHub Actions → GHCR | `.github/workflows/deploy.yml`. No server rollout in this repo. |
| Analytics | Optional Umami, off unless both public env values are set | `docs/operations/analytics.md`. |

Exact versions: [`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md).

## Repository layout

```
.
├── app/                 Next.js App Router: (de), (en), api/
├── components/          sections, chrome, widgets, ui
├── content/             typed copy, projects, blog MDX
├── lib/                 i18n, data adapters, config, hooks
├── public/              images, CV PDF, icons
├── tests/               unit, e2e, visual
├── docs/                documents that exist in this checkout
├── .github/workflows/   ci.yml, deploy.yml (image only), release.yml
├── package.json
└── pnpm-lock.yaml
```

Where a file goes is also described in
[`docs/architecture/project-structure.md`](docs/architecture/project-structure.md).
That page records the current route groups; older trees in the same file are labeled
as historical.

## Documentation map

Start at the [docs index](docs/README.md). Only files present in this checkout are
linked.

| Area | Document | Use it for |
|---|---|---|
| Overview | [`docs/00-overview.md`](docs/00-overview.md) | Vision, goals, scope |
| Architecture | [`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md) | Pinned stack and versions |
| Architecture | [`docs/architecture/project-structure.md`](docs/architecture/project-structure.md) | Where files live |
| Architecture | [`docs/architecture/rendering-and-data.md`](docs/architecture/rendering-and-data.md) | Rendering and live-data routes |
| Design | [`docs/design/design-system.md`](docs/design/design-system.md) | Tokens, type, spacing |
| Design | [`docs/design/animation-and-motion.md`](docs/design/animation-and-motion.md) | Motion spec (spine is specified, not mounted) |
| Design | [`docs/design/accessibility.md`](docs/design/accessibility.md) | a11y rules |
| Content | [`docs/content/content-and-voice.md`](docs/content/content-and-voice.md) | Copy and voice |
| Content | [`docs/content/i18n.md`](docs/content/i18n.md) | DE/EN routing |
| Content | [`docs/content/projects.md`](docs/content/projects.md) | Project data model |
| Engineering | [`docs/engineering/quality-and-testing.md`](docs/engineering/quality-and-testing.md) | Gates that CI actually runs |
| Engineering | [`docs/engineering/git-workflow.md`](docs/engineering/git-workflow.md) | Branches, commits, PRs |
| Engineering | [`docs/engineering/releases.md`](docs/engineering/releases.md) | Release-PR bot |
| Operations | [`docs/operations/local-development.md`](docs/operations/local-development.md) | Local commands |
| Operations | [`docs/operations/environment-variables.md`](docs/operations/environment-variables.md) | Env vars, no secret values |
| Operations | [`docs/operations/deployment.md`](docs/operations/deployment.md) | What `deploy.yml` does and does not do |
| Proposal | [`docs/SELLABILITY-ROADMAP.md`](docs/SELLABILITY-ROADMAP.md) | Unapproved proposal, not a build plan |

## Getting started

Prerequisites: Node `>=22.13` (`.nvmrc`), pnpm 11.9 (`packageManager`).

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local   # every variable is optional; an empty file is enough
pnpm dev                     # http://localhost:3000
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e                # Playwright smoke + axe; set PW_PORT if 3000 is taken
pnpm format
```

Variable names and which ones are public are in
[environment variables](docs/operations/environment-variables.md) and `.env.example`.
The dev server and the production build must succeed with no secrets set. Do not put
secrets in `NEXT_PUBLIC_*`.

## How work is organized

- Meaningful changes are recorded as a changeset under `.changeset/`; the release
  process folds those into [`CHANGELOG.md`](CHANGELOG.md). See
  [releases](docs/engineering/releases.md).
- Branching and PRs: [git workflow](docs/engineering/git-workflow.md).
- Quality gates: [quality and testing](docs/engineering/quality-and-testing.md).
- ADRs and the Plane task list are not published in this checkout. Do not treat a
  missing `private-docs/` path as a task to invent.

## Conventions

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) — see
  [git workflow](docs/engineering/git-workflow.md).
- **Changelog:** [Keep a Changelog](https://keepachangelog.com/), SemVer for tags,
  written via changesets.
- **Code and docs:** English. **Site UI copy:** German and English
  (`content/copy/de.ts`, `content/copy/en.ts`).
- **Voice:** plain, direct, minimal, a little loose. No AI slop, no emojis, only the
  regular hyphen `-`. See [content and voice](docs/content/content-and-voice.md).
- **Naming:** the display name is `Yannik Wünker`; technical slugs and URLs use
  `yannik-wuenker` (no umlaut).

## Contact

- **Email:** mail@yannikwuenker.de
- **LinkedIn:** https://www.linkedin.com/in/yannik-wuenker/
- **GitHub:** https://github.com/spockey4711

The LinkedIn URL is the one in the README and in `content/copy`. A comment in
`content/copy/de.ts` still marks it as unconfirmed. This README does not verify the
profile.
