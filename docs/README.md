# Documentation

This is the documentation for the **yannikwuenker.de** portfolio and the living source of
truth for the project. It turns the vision, requirements and
[design handoff](design/handoff/README.md) into a buildable, maintainable product.

Read [`00-overview.md`](00-overview.md) first.

## Structure

```
docs/
├── 00-overview.md                 Vision, goals, scope, success criteria
│
├── architecture/
│   ├── tech-stack.md              Pinned stack + versions + rationale
│   ├── project-structure.md       Folder-by-folder file layout
│   ├── rendering-and-data.md      SSG/SSR strategy, live-data API routes
│   └── decisions/                 Architecture Decision Records (ADRs)
│       ├── README.md
│       ├── 0001-framework.md
│       ├── 0002-hosting.md
│       ├── 0003-styling.md
│       └── 0004-docs-language.md
│
├── design/
│   ├── design-system.md           Tokens, type scale, spacing, components
│   ├── responsive-and-mobile.md   Breakpoints, fluid type, mobile behavior
│   ├── animation-and-motion.md    Boot, scroll spine, keyframes, timings
│   ├── accessibility.md           a11y, reduced motion, contrast
│   └── handoff/                    Authoritative design handoff (HTML export)
│
├── content/
│   ├── blog.md                    Blog authoring (MDX posts) + the /blog pipeline
│   ├── content-and-voice.md       Section-by-section copy + tone of voice
│   ├── i18n.md                    German/English routing, copy contract, translating a route
│   ├── projects.md                Project data model + per-project details
│   ├── seo.md                     Metadata, Open Graph, structured data
│   └── text-anpassung.md          Worksheet: every user-facing string + its source, to revise copy
│
├── engineering/
│   ├── conventions.md             Code style, naming, TypeScript rules
│   ├── dependency-updates.md      Automated dependency PRs (Dependabot)
│   ├── git-workflow.md            Branching, commits, PRs, releases
│   ├── quality-and-testing.md     Testing, linting, performance budgets
│   └── releases.md                Release cadence, release-PR bot, runbook
│
├── operations/
│   ├── local-development.md       Run and develop locally
│   ├── deployment.md              Docker + Contabo VPS + CI/CD
│   ├── server-setup.md            Contabo VPS provisioning runbook (P0-6)
│   ├── two-environment-setup.md   Production apex + preview subdomain in parallel
│   └── environment-variables.md   Every env var and secret
│
└── project/
    ├── roadmap.md                 Phases and milestones
    ├── backlog.md                 Groomed task scope + acceptance criteria
    └── plane.md                   Task tracking in Plane (authoritative status)
```

## Conventions for these docs

- Written in English, Markdown, wrapped at ~95 columns.
- Each document states its **purpose** at the top and links to related docs.
- When a decision changes, update the relevant doc **and** record it in
  [`../CHANGELOG.md`](../CHANGELOG.md); if it is a significant technical decision, add an
  [ADR](../private-docs/docs/architecture/decisions/README.md).
- Docs and the code they describe change in the same pull request.
- Source-of-truth precedence: an **ADR** overrides a general doc; the
  [design handoff](design/handoff/README.md) is authoritative for visual
  detail; [Plane](../private-docs/docs/project/plane.md) is authoritative for task status and what to do next
  (the [backlog](../private-docs/docs/project/backlog.md) holds each task's groomed scope and acceptance criteria).
