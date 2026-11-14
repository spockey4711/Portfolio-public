# Documentation

This is the documentation that **ships in this public checkout** for the
yannikwuenker.de portfolio. Read [`00-overview.md`](00-overview.md) first, then the
[repository README](../README.md) for how to run the app.

Files that are not listed below are not in this checkout. In particular, there is no
`private-docs/` tree here: no ADR directory, no Plane backlog, no server-setup
runbook. Links in older pages that still point at `private-docs/` do not resolve.
Do not invent those files from memory.

[`SELLABILITY-ROADMAP.md`](SELLABILITY-ROADMAP.md) is an unapproved proposal. It is
not a task list and not authorization to build.

## Structure

```
docs/
├── 00-overview.md                 Vision, goals, scope
├── SELLABILITY-ROADMAP.md         Proposal only (awaiting approval)
│
├── architecture/
│   ├── tech-stack.md              Pinned stack + versions
│   ├── project-structure.md       Folder layout, with the current route groups called out
│   └── rendering-and-data.md      Rendering strategy, live-data API routes
│
├── design/
│   ├── design-system.md           Tokens, type scale, spacing, components
│   ├── responsive-and-mobile.md   Breakpoints, fluid type, mobile behavior
│   ├── animation-and-motion.md    Motion spec, including a scroll spine that is not mounted
│   ├── accessibility.md           a11y, reduced motion, contrast
│   └── handoff/                   Design handoff HTML export
│
├── content/
│   ├── blog.md                    Blog authoring (MDX) and the /blog pipeline
│   ├── content-and-voice.md       Section copy and tone of voice
│   ├── i18n.md                    German/English routing and copy contract
│   ├── projects.md                Project data model
│   ├── seo.md                     Metadata, Open Graph, structured data
│   └── text-anpassung.md          Worksheet of user-facing strings
│
├── engineering/
│   ├── conventions.md             Code style, naming, TypeScript rules
│   ├── dependency-updates.md      Dependabot
│   ├── git-workflow.md            Branching, commits, PRs
│   ├── quality-and-testing.md     Gates CI actually runs
│   └── releases.md                Release-PR bot and versioning
│
└── operations/
    ├── local-development.md       Run and develop locally
    ├── environment-variables.md   Env var names (no secret values)
    ├── deployment.md              GHCR image publish; no server rollout
    ├── analytics.md               Optional Umami tag
    └── error-monitoring.md        Optional GlitchTip/Sentry DSN
```

## Conventions for these docs

- Written in English, Markdown, wrapped at about 95 columns, except
  `SELLABILITY-ROADMAP.md`, which is a German proposal for the maintainer.
- Each document states its purpose at the top and links only to files that exist
  here, or says explicitly that a topic is not published in this checkout.
- When a decision changes, update the relevant doc in the same change. A changeset
  under `.changeset/` is how this repo records a changelog entry. ADRs are not
  stored in this checkout.
- Source-of-truth precedence for what the site **does**: the code. A design spec
  can still describe something the UI does not mount; that gap is a product
  decision, not a license to treat the spec as implemented.
