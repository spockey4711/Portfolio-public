# Project structure

**Purpose:** define where every kind of file lives, so the codebase stays predictable as
it grows. This is a contract: new files follow it; deviations get discussed and this doc
gets updated.

Related: [tech stack](tech-stack.md) · [conventions](../engineering/conventions.md) ·
[rendering & data](rendering-and-data.md)

## Target layout (introduced in P0)

```
.
├── app/                          Next.js App Router
│   ├── layout.tsx                Root layout: fonts, <html lang="de">, metadata
│   ├── page.tsx                  The onepager (composes sections)
│   ├── globals.css               Tailwind directives + CSS token variables
│   ├── opengraph-image.tsx       Generated OG image (or static in public/)
│   ├── sitemap.ts                Sitemap
│   ├── robots.ts                 robots.txt
│   ├── impressum/page.tsx        Legal: Impressum
│   ├── datenschutz/page.tsx      Legal: Datenschutz
│   ├── projekte/[slug]/page.tsx  Project detail page (SSG, projects flagged detailPage)
│   └── api/                      Route handlers (server-only, hide secrets)
│       ├── weather/route.ts
│       ├── github-activity/route.ts
│       └── now-playing/route.ts
│
├── components/
│   ├── sections/                 One folder per page section
│   │   ├── hero/
│   │   ├── projects/
│   │   ├── about/
│   │   ├── skills/
│   │   ├── experience/
│   │   └── contact/
│   ├── chrome/                   Nav, scroll spine, footer
│   ├── widgets/                  Terminal, command palette, weather, github heatmap, now-playing
│   └── ui/                       Primitives: Button, Pill, SectionHeader, Card
│
├── lib/                          Framework-agnostic logic
│   ├── motion/                   Scroll-progress hook, reveal helpers
│   ├── data/                     Fetchers/adapters for live data (server)
│   ├── seo/                      Metadata + JSON-LD builders
│   └── utils/                    Small pure helpers
│
├── content/                      Typed content (the "CMS in git")
│   ├── projects/                 Project entries, one file per project (see content/projects.md)
│   ├── skills.ts                 Skill/tech-stack groups
│   ├── experience.ts             Studies + working-student entries
│   └── copy.ts                   Section copy (German UI strings)
│
├── types/                        Shared TypeScript types
│
├── public/                       Static assets served as-is
│   ├── fonts/                    (if self-hosting beyond next/font)
│   ├── images/
│   ├── og/                       Open Graph images
│   └── cv/                       CV PDF (added later)
│
├── styles/                       Design tokens as a single TS/CSS source (optional)
│   └── tokens.ts
│
├── tests/                        Vitest unit tests + Playwright e2e
│   ├── unit/
│   └── e2e/
│
├── docs/                         (this documentation; design handoff lives in
│                                  docs/design/handoff/)
│
├── Dockerfile
├── docker-compose.yml            Local prod-like run / server run
├── .github/workflows/            CI/CD
│   ├── ci.yml
│   └── deploy.yml
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── .nvmrc
└── package.json
```

## Rules

### Sections
- Every page section is a self-contained folder under `components/sections/<name>/` with
  an `index.tsx` (the section) plus local subcomponents and any section-only helpers.
- Sections read their content from `content/`, never inline long German copy in JSX.
- Each section renders the shared `SectionHeader` (numbered `01 / …`) from `ui/` — see
  the [design system](../design/design-system.md).

### Components
- `ui/` = generic, reusable primitives with no business meaning (Button, Pill, Card).
- `chrome/` = the persistent frame (nav, scroll spine, footer).
- `widgets/` = self-contained interactive/live features that can fail independently and
  must degrade gracefully.
- A component that is used by exactly one section lives inside that section's folder, not
  in `components/`.

### Logic and data
- No `fetch` to third-party APIs from client components. Live data flows:
  `client widget → /app/api/<x>/route.ts → lib/data/<x>.ts → external API`. Secrets stay
  server-side. See [rendering & data](rendering-and-data.md).
- `lib/` is framework-light and unit-testable. Anything with real logic (e.g. scroll math,
  metadata builders) has a test.

### Content
- All user-facing German strings live in `content/` as typed objects. This keeps copy
  reviewable in one place and makes a later English variant a mechanical change.
- Project data conforms to the model in [content/projects.md](../content/projects.md).

### Naming
- Files: `kebab-case.ts` for modules, `PascalCase.tsx` for React components, `use-*.ts`
  for hooks. See [conventions](../engineering/conventions.md).

## Import aliases

`tsconfig.json` defines path aliases so imports stay clean and moves are cheap:

```
@/components/*   @/lib/*   @/content/*   @/types/*   @/styles/*
```

No deep relative chains (`../../../`). If you write one, you are probably missing an
alias or the file is in the wrong place.
