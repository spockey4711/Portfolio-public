# Changelog

## [Unreleased]

## [0.3.0] - 2026-07-09

### Added
- **English project detail metadata parity (S5-5).** The English detail route
  `/en/projects/<slug>` now ships the branded per-project Open Graph and Twitter cards (its own
  `opengraph-image.tsx`/`twitter-image.tsx`, reusing the S5-3 `lib/og/card` template with English
  labels and an `en/projects/<slug>` footer) and emits `CreativeWork` + `BreadcrumbList` JSON-LD
  in English, plus the per-route `keywords`/`author` metadata. S5-3 shipped the dynamic cards
  German-only and S5-2 the structured data German-only; this closes the gap so every
  `/en/projects/<slug>` is at parity with its German twin. See
  [`docs/content/seo.md`](docs/content/seo.md).
- **English completeness audit and localized command palette (S5-1h).** The S5-1 wrap-up pass.
  Audited every live English route for correct `<html lang>`, canonical and
  `de-DE`/`en`/`x-default` alternates, a complete segmented sitemap, a language toggle that
  round-trips without a 404, and no untranslated leakage. The one gap it closed was the command
  palette, which still read the deprecated German `copy` singleton and so rendered German (and
  routed its ⌘K navigation into the German tree) on every `/en` route; it now takes a `locale`
  from `SiteChrome` and builds its copy, command registry and terminal context per locale,
  mirroring the terminal widget. New `tests/e2e/i18n.spec.ts` pins the audit
  (lang/canonical/hreflang plus the toggle round-trip across the translated routes). The audit
  checklist is recorded in [`docs/content/i18n.md`](docs/content/i18n.md).
- **English blog posts (S5-1g).** Individual posts can now ship an English translation at
  `/en/blog/<slug>`, opt-in per post. Translations live as parallel files under
  `content/blog/en/<slug>.mdx`; the new client-safe `translatedBlogPostSlugs` set in
  `lib/i18n/routes.ts` is the single switch for "advertised in English", and the blog registry
  (`getEnglishPosts`) cross-checks the set against the files at build time and fails loudly on
  drift. Only translated slugs get an `/en/blog/<slug>` page (`dynamicParams=false`, so an
  untranslated slug is a static 404 that is never linked), and the DE/EN post metadata plus the
  sitemap pair reciprocal `de-DE`/`en`/`x-default` hreflang only for translated posts (an
  untranslated post stays a lone German entry). The language toggle deep-links a translated post
  to its twin and sends an untranslated one to `/en/blog` - never a 404, never German under
  `/en`. `blogPost` deliberately stays out of `translatedRoutes` (the per-post gate replaces it).
  The shared blog components (`PostCard`/`PostMeta`/`RelatedPosts`/`formatPostDate`) are now
  locale-aware, so English cards, dates ("July 6, 2026") and reading-time suffix render correctly;
  each EN post also gets its own branded English OpenGraph/Twitter card. The first post,
  "Why this portfolio isn't a website builder", ships in English. See
  [`docs/content/i18n.md`](docs/content/i18n.md).
- **English blog index (S5-1f).** `/en/blog` renders in English via a shared `BlogIndex` body
  (rendered by both `/blog` and `/en/blog`, mirroring `ProjectsIndex`), reading chrome copy via
  `getCopy(locale)`. The listing policy is deliberate: the index lists only posts that carry an
  English translation via the new `getPostsForLocale(locale)` seam - posts are German-only, so
  `/en/blog` lists nothing yet and renders its graceful empty state until the EN post layer ships
  (S5-1g), rather than framing German prose in English chrome. Widening `translatedRoutes` to
  `blogIndex` (not `blogPost`) lit up the reciprocal `de-DE`/`en`/`x-default` hreflang on both
  index pages (the German page previously carried only a bare canonical) and the `/en/blog`
  sitemap entry. Decision recorded in
  [ADR-0006](private-docs/docs/architecture/decisions/0006-i18n-and-localization.md); see also
  [`docs/content/i18n.md`](docs/content/i18n.md).
- **English legal pages (S5-1e).** `/en/imprint` and `/en/privacy` now render a full English
  translation of the Impressum and Datenschutzerklärung. `content/legal.ts` becomes
  locale-keyed (`getImprint`/`getPrivacy`/`getLegalChrome`, mirroring `content/now.ts`) and the
  shared `LegalArticle` takes a `locale`. The German text stays authoritative: each English
  page's lead states that the German version is legally binding, and the German statute names
  (§ 5 DDG, § 18 MStV) are kept verbatim. Both locales are noindex/follow and now advertise the
  reciprocal `de-DE`/`en`/`x-default` hreflang pair, but stay out of the sitemap. `imprint` and
  `privacy` join `translatedRoutes`. Decision recorded in
  [ADR-0006](private-docs/docs/architecture/decisions/0006-i18n-and-localization.md); see also
  [`docs/content/i18n.md`](docs/content/i18n.md).
- **English /now page (S5-1d).** The "now" snapshot now renders in English at `/en/now`, the
  fifth route to light up on the English tree. `content/now.ts` moves from a single German-only
  object to two parallel locale lists read via `getNow(locale)`/`getNowChrome(locale)` (mirroring
  `content/uses.ts`), and the page body moves into a shared `NowSnapshot` component rendered by
  both `/jetzt` and `/en/now` so the two locales stay structurally identical and only the resolved
  content differs. Widening `translatedRoutes` to include `now` auto-wires the rest: the footer's
  "Now" link appears on the English tree, the sitemap gains the `/en/now` entry (ranked a notch
  below its German counterpart), and both now pages advertise the reciprocal
  `de-DE`/`en`/`x-default` hreflang pair (the German page previously carried only a bare
  canonical). Documented in [i18n](docs/content/i18n.md).
- **English /uses page (S5-1c).** The uses inventory now renders in English at `/en/uses`, the
  fourth route to light up on the English tree. The inventory body moves into a shared
  `UsesInventory` component (mirroring `ProjectsIndex` and `Onepager`), rendered by both
  `/uses` and `/en/uses` so the two locales stay structurally identical and only the resolved
  copy/content differ; the English inventory resolves via `getUsesGroups("en")` and the copy
  via `getCopy("en")` (both already translated). Widening `translatedRoutes` to include `uses`
  auto-wires the rest: the footer's "Uses" link appears on the English tree, the sitemap gains
  the `/en/uses` entry (ranked a notch below its German counterpart), and both `/uses` pages
  advertise the reciprocal `de-DE`/`en`/`x-default` hreflang pair (the German page previously
  had none). Documented in [i18n](docs/content/i18n.md).
- **English project detail pages (S5-1b).** Every project that warrants its own page now renders
  in English at `/en/projects/<slug>`, the third route to light up on the English tree. The new
  `app/(en)/en/projects/[slug]/page.tsx` is the twin of the German route: the same `ProjectDetail`
  body rendered with `locale="en"`, the English content resolved via `getDetailProject(slug, "en")`,
  and `dynamicParams=false` over the shared, locale-invariant `detailProjects` so the static param
  set is identical across locales. The three case studies (fuelivo, Aurelian, DevBlueprint) are
  translated in full - summary, solution, features, architecture, challenges, metrics and timeline -
  which is what the English detail route was always gated on. `content/projects/en.ts` grows a
  `CaseStudyOverride` carrying the translated prose, and `getProjects`/`getDetailProject` now
  deep-merge it onto the German base (via `mergeCaseStudy`). The tech stack is translated too (its
  layer names and descriptive items are German prose) and the metric values are reformatted for
  English number style (German "16.100" -> "16,100"); the only facts inherited from the base are
  each feature's build-state (`status`) and the `interactiveProof` flag, so a feature override
  carries just its `label`. Widening `translatedRoutes`
  to include `projectDetail` auto-wires the rest: the projects-index cards now link into the English
  detail pages, the sitemap gains a per-slug English twin (ranked a notch below its German
  counterpart), and both detail routes advertise the reciprocal `de-DE`/`en`/`x-default` hreflang
  pair. Status labels and the interactive proof were already locale-driven off `ProjectDetail`'s
  `locale` prop. Documented in [i18n](docs/content/i18n.md).
- **English projects index (S5-1a).** The projects index now renders in English at
  `/en/projects`, the second route to light up on the English tree after the onepager. The
  index body moves into a shared `ProjectsIndex` component (mirroring `Onepager`), rendered by
  both `/projekte` and `/en/projects` so the two locales stay structurally identical and only
  the resolved copy/content differ; the per-project English content resolves via
  `getProjects("en")`. Widening `translatedRoutes` to include `projectsIndex` auto-wires the
  rest: the onepager's "View all projects" link appears on the English tree, the sitemap gains
  the `/en/projects` entry, and both index pages advertise the `de-DE`/`en`/`x-default`
  hreflang pair. The English project detail links stay hidden until their route ships (S5-1b).
  Documented in [i18n](docs/content/i18n.md).
### Changed
- **Changelog now uses Changesets (build).** Unreleased changes are recorded as uniquely-named
  `.changeset/` fragments via `pnpm changeset`, not by editing this file's `[Unreleased]`
  section, so parallel worktrees never conflict on the changelog; `pnpm changeset version` folds
  the fragments in and bumps the version at release. The Keep a Changelog / SemVer note moved to
  the [release runbook](docs/engineering/releases.md#changelog-format). This `[Unreleased]` block
  is the last hand-written one (see the one-time transition there). Rationale:
  [ADR-0010](private-docs/docs/architecture/decisions/0010-changelog-via-changesets.md).
- **CI: bump `actions/checkout` from v4 to v5 across all workflows.** v4 runs on the
  Node 20 action runtime, which GitHub is deprecating on its runners; v5 runs on Node 24
  and clears the runner advisory. Pre-empts the Dependabot `github-actions` major bump.
- **Task tracking moved to Plane.** A self-hosted Plane instance (project `PORT`) is now the
  authoritative task tracker: it owns each task's status and "what to pick up next". The
  task lifecycle advances a Plane work item (Todo -> In Progress -> Done) instead of checking
  a box in `docs/project/backlog.md`, which is reframed as the groomed sprint overview and the
  home of each task's scope and acceptance criteria. New reference:
  [`docs/project/plane.md`](private-docs/docs/project/plane.md); the lifecycle in
  [`docs/engineering/git-workflow.md`](docs/engineering/git-workflow.md) and `CLAUDE.md` is
  updated to match. Task ids stay `S<n>-<m>` / `P<phase>-<n>`.

## [0.2.0] - 2026-07-08

### Added
- **Regular release cadence: a develop -> master release-PR bot (S6-5).** Builds on the
  S2-10 dependency automation with an exercised release rhythm. A new scheduled workflow
  (`.github/workflows/release.yml`) runs weekly (Thursday, and on demand via
  `workflow_dispatch`) and opens - or idempotently refreshes - a single `develop -> master`
  release PR whenever `develop` is ahead of `master`, summarizing the commits being promoted
  with a cut-the-release checklist; it never merges, so the maintainer still reviews and
  merges (which deploys prod). The weekly cadence, the bot's CI caveat and a step-by-step
  runbook plus a release log are documented in
  [`docs/engineering/releases.md`](docs/engineering/releases.md), cross-linked from the git
  workflow and dependency-updates docs.
- **CI quality gates: axe accessibility scan and visual regression (S6-3).** Two new
  gates fail a PR before regressions land. `tests/e2e/axe.spec.ts` runs
  `@axe-core/playwright` over every key route and asserts zero WCAG 2.0/2.1 A+AA
  violations (runs in the `e2e` job); `tests/visual/visual.spec.ts` takes full-page
  Playwright snapshots of the key templates, masking the home page's live widgets, and a
  new `visual` CI job verifies them inside the pinned `mcr.microsoft.com/playwright`
  container so baselines match pixel-for-pixel. Baselines are (re)generated by the
  **Update visual snapshots** workflow. `playwright.config.ts` gains a `visual` project,
  a production-build web server (`PW_PROD`) and a `PW_PORT` override; `pnpm test:visual`
  is added. These sit alongside the existing Lighthouse budgets, completing S6-3.
- **Error & uptime monitoring (S6-2).** Self-hosted, privacy-friendly error tracking and
  uptime monitoring, off by default. Two standalone Docker stacks join the box the same way
  Umami did: **GlitchTip** (Sentry-API compatible error tracking,
  `deploy/error-tracking/`) and **Uptime Kuma** (uptime checks, alerts and a public status
  page, `deploy/uptime/`), both loopback-only behind Nginx with secrets in a server-side
  `.env`. The app wires `@sentry/nextjs` at a self-hosted DSN through one shared, privacy-first
  options builder (`lib/observability/sentry.ts`): errors only (no tracing/replay, to protect
  the Lighthouse budget), `sendDefaultPii: false`, and a `beforeSend` that scrubs residual IP
  and cookie header. Server, edge and browser runtimes init via `instrumentation.ts` /
  `instrumentation-client.ts`; per-locale route error boundaries and a self-contained
  `global-error.tsx` share a terminal-style surface that reports the caught error. Browser
  reports tunnel through the app's own origin (`next.config.ts` `tunnelRoute`), keeping the
  GlitchTip host out of the client and ad-block resilient. A new `/api/health` liveness probe
  backs the uptime check. The whole thing is gated on a single public `NEXT_PUBLIC_SENTRY_DSN`
  (inlined at build time, off when unset), and the processing is disclosed in a new Datenschutz
  section under Art. 6 Abs. 1 lit. f DSGVO. See
  [`docs/operations/error-monitoring.md`](docs/operations/error-monitoring.md) and
  [ADR-0009](private-docs/docs/architecture/decisions/0009-error-and-uptime-monitoring.md).
- **Test depth for the live widgets and interactive surfaces (S6-4).** Hardened the tests
  where logic can silently break, without chasing markup coverage. The live-widget data
  adapters now cover their defensive normalization paths: WakaTime clamps an out-of-range or
  negative percent and drops a nameless/odd entry; the latest-commit feed skips a push whose
  head commit is malformed or blank and falls through to the next; the GitHub heatmap coerces
  a malformed day and a week with no days to safe zeros; now-playing throws when the Spotify
  token refresh itself fails or returns no `access_token`. The interactive surfaces gain their
  input-logic tests: the terminal walks its command history with ArrowUp/ArrowDown (and returns
  to a fresh line past the newest), and the command palette moves its roving highlight with the
  arrow keys (wrapping at both ends), runs the highlighted entry with Enter, traps Tab within
  the overlay and dismisses on a backdrop click. Each test is verified to fail on a deliberate
  break in the logic it guards. See
  [`docs/engineering/quality-and-testing.md`](docs/engineering/quality-and-testing.md).
- **Blog syndication and sharing (S5-4).** The RSS feed is hardened and share
  affordances land on every post. The feed builder moves to a pure, unit-tested
  `lib/content/feed.ts`: each item now carries a `<category>` per tag and a
  `<dc:creator>` (name only, no email exposed), and `lastBuildDate` is derived from
  the newest post rather than the wall clock, so an unchanged rebuild emits a
  byte-identical feed that validates as RSS 2.0. The blog index gains a visible
  "RSS abonnieren" link - the low-friction, cookieless notify path with no platform
  lock-in (the feed needs no backend and no secrets). Each post gains a `SharePost`
  footer: a progressively enhanced Web Share button (shown only where the browser
  supports `navigator.share`) and a universal copy-link fallback, both cookieless
  and free of third-party scripts. See [`docs/content/blog.md`](docs/content/blog.md).
- **SEO deepening: per-route structured data, a segmented sitemap and internal linking (S5-2).**
  `lib/seo/structured-data.ts` now builds a `CreativeWork` per project, an `Article` per blog
  post and a `BreadcrumbList` on both (Home -> section -> page), injected by the detail routes
  via the existing `JsonLd` component; all URLs resolve through a new `absoluteUrl` helper so
  the JSON-LD, metadata and sitemap share one base. Detail-route metadata is sharpened with
  per-route `keywords` (tech stack / tags), an `author`, and OG `article`
  `modifiedTime`/`authors` on posts. The sitemap is split by content type via
  `generateSitemaps` (`/sitemap/pages.xml`, `/sitemap/projects.xml`, `/sitemap/blog.xml`)
  behind a new `app/sitemap-index.xml` `<sitemapindex>` that `robots.txt` points at. Each
  detail page gains an internal-linking footer - `RelatedProjects` on a project, `RelatedPosts`
  on a post - so no detail page is a crawl dead end; both render nothing when empty. Docs:
- **Dynamic social cards for projects and posts (S5-3).** Each project detail
  (`/projekte/<slug>`) and blog post (`/blog/<slug>`) now previews its own branded 1200×630
  Open Graph / Twitter card instead of the single default image. The cards render server-side
  with `next/og` (Satori) from a shared template (`lib/og/card.tsx`) that mirrors the default
  share image - spine, Sand & Pine palette, display-serif title, mono kicker and footer - so
  project (name, tagline, status pill) and post (title, summary, date, reading time) cards
  read as one family. Both routes are statically generated, so the images render at build and
  are served with immutable cache headers; the three typefaces are committed as TTFs under
  `lib/og/fonts/` and read once at build. The default `public/og/default.png` stays the
  fallback for every route without a card of its own. See
  [`docs/content/seo.md`](docs/content/seo.md).

### Changed
- **Backlog check-off convention made explicit.** The task lifecycle now spells out a `[x]`
  done state and requires checking a backlog task off the moment its PR is open and only the
  merge remains (never waiting for the merge); `[~]` is reserved for in-progress work or a
  real follow-up action beyond the merge. Done inbox items may be deleted since `CHANGELOG.md`
  carries the record. Documented in [`docs/project/backlog.md`](private-docs/docs/project/backlog.md),
  [`docs/engineering/git-workflow.md`](docs/engineering/git-workflow.md), the inbox and
  `CLAUDE.md`. Process/docs only.
- **Two-environment deploy: `master` -> production apex, `develop` -> preview subdomain.** The
  deploy pipeline now runs two long-lived environments in parallel on the same Contabo box
  instead of a single dev environment. `deploy.yml` triggers on pushes to both `develop` and
  `master`, resolves the target from the branch (`master` -> `https://yannikwuenker.de` on
  container `:3002` - avoiding `:3001`, which the Umami analytics stack already binds -
  `develop` -> `https://portfolio.yannikwuenker.de` on `:3000`), and
  builds a separate image per environment because `NEXT_PUBLIC_SITE_URL` is inlined at build
  time and must not be shared. Images are tagged under per-env prefixes
  (`prod-sha-<sha>` / `dev-sha-<sha>`, plus `prod-latest` / `dev-latest`). `docker-compose.yml`
  drops the fixed `container_name` (Compose namespaces by project dir instead) and takes a
  `HOST_PORT`; `docker-compose.prod.yml` and `scripts/deploy-remote.sh` bind and health-check
  that port. New runbook [`docs/operations/two-environment-setup.md`](private-docs/docs/operations/two-environment-setup.md)
  documents the DNS, Nginx apex block, TLS and server steps; `deployment.md` and
  `server-setup.md` are updated (the old single-environment "go-live switch" is superseded).
  Repo-side config and docs only; the server/DNS steps are applied manually.

### Fixed
- **Scroll progress now reaches a full 100% on short pages.** The nav percentage and the
  scroll spine read `scrollY / (scrollHeight - innerHeight)`, but the browser rests `scrollY`
  a hair below that denominator (sub-pixel on Retina displays, a few pixels after a momentum
  scroll). On a tall page the gap is invisible; on a short one like `/jetzt` or `/impressum`
  it is a visible slice of the bar, so the fill and the percentage stalled just under 100% at
  the true bottom. `useScrollProgress` now snaps the ratio to a clean `0`/`1` within a ~2px
  tolerance of either end, leaving the value untouched everywhere in between.
- **Two WCAG AA contrast misses the new axe gate surfaced (S6-3).** The project status
  badge's "live" label used `signal` (`#157A45`), which clears 4.5:1 on `--surface` but
  only 4.31:1 when the badge sits on the page `--bg`; resting status text now uses a new
  `--signal-ink` (`#136F3F`) that clears AA on both, leaving `signal` unchanged as the
  glow/interaction accent. The terminal faint tier `--term-text-faint` (the title bar and
  hint line) was lifted `#6B7D70` → `#7C907F` to clear AA on `--term-bg`.
- **Project cards with a detail page now open that page, not their repo.** A non-featured
  `ProjectCard` linked the whole card to `links.live ?? links.demo ?? links.repo`, ignoring
  the project's `detailPage`. Projects whose only external link is a repo (e.g. DevBlueprint,
  aurelian) therefore sent the card straight to GitHub instead of `/projekte/<slug>`; only the
  featured project reached its detail page, via its separate "view details" link. The card now
  prefers the internal detail route when the project has one and its localized variant has
  shipped (the same `detailPage` + `isRouteTranslated("projectDetail")` guard `FeaturedProject`
  uses), falling back to the external link only otherwise, and uses a Next `Link` for the
  internal route so navigation stays client-side.
- **Umami analytics stack no longer crash-loops on a base64 DB password (S2-5).** The setup
  runbook and `.env.example` generated `POSTGRES_PASSWORD` with `openssl rand -base64 24`,
  but that value is interpolated raw into `DATABASE_URL`
  (`postgresql://umami:<password>@umami-db:5432/umami`); base64's `+`, `/` and `=` are not
  URL-safe, so a generated `/` produced `TypeError: Invalid URL` in Umami's `check-db` and
  the container restart-looped while Postgres stayed healthy. The guidance now uses `openssl
  rand -hex 24` (URL-safe) across `docs/operations/analytics.md`,
  `deploy/analytics/.env.example` and a note by `DATABASE_URL` in
  `deploy/analytics/docker-compose.yml`, plus a troubleshooting entry for the crash-loop.
  `APP_SECRET` is unchanged (it is never placed in a URL). Docs-and-config only; no app code.

### Changed
- **Dependency maintenance (consolidated Dependabot updates).** Rolled up the passing weekly
  Dependabot PRs into one change: application deps (`next` 16.2.10, `react`/`react-dom`
  19.2.7), tooling (`typescript` 6, `@types/node` 26, `vitest`/`@vitest/coverage-v8` 4.1.10,
  `eslint-config-next` 16.2.10), and the pinned GitHub Actions (`actions/setup-node` 6,
  `actions/upload-artifact` 7, `docker/setup-buildx-action` 4, `docker/login-action` 4,
  `docker/build-push-action` 7). The `eslint` 9 -> 10 bump is deliberately excluded: it breaks
  `eslint-plugin-react` (`contextOrFilename.getFilename is not a function`) and fails the
  lint gate. No behavioural or API changes; the full quality gate (lint, typecheck, test,
  build) passes.
- **Hero rework (S2-2).** The hero, the site's first screen and captured point of
  dissatisfaction, was reworked on three fronts. It is now **full-bleed**: the section spans
  the viewport instead of the shared `--container-max`, reading as a wide overture above the
  container-capped sections below, while its left gutter still matches the site so the left
  edge and scroll spine stay aligned. The reveal is now **two-staged**: the text column rises
  first, then the live signals settle in as one unit a clear beat later, roughly following
  the `HeroCharacter` walk-in - a fixed-CSS approximation that never depends on the character
  having played, so reduced-motion and narrow viewports still see the hero settled. And the
  now-playing widget, time/weather meta line and availability indicator are gathered into a
  single **live-status module** (`LiveStatus`) - one deliberate card instead of three loosely
  stacked widgets. No content-model changes and no layout shift; behavioural tests unchanged.
  Documented in [animation-and-motion](docs/design/animation-and-motion.md) and
  [responsive-and-mobile](docs/design/responsive-and-mobile.md).

### Added
- **Real project covers and share image (S2-1).** Every project card and detail page now
  shows a real cover instead of the striped slug placeholder: the two live products keep
  their curated screenshots (a re-shoot of the live sites regressed - fuelivo's homepage
  carries a cookie banner, aurelian's public URL is an English marketing page rather than
  the app - so the originals stay), and the four projects with no reachable web UI
  (devblueprint, rezepte-app, daily-dashboard, mail-classifier) get deliberate, on-brand
  generated covers (serif name, tagline, status pill, slug tag, Sand & Pine palette). The
  default Open Graph image is likewise a real generated asset (name, role, palette) in place
  of the empty placeholder bands. Both are produced from committed HTML templates via a new,
  reproducible `scripts/generate-assets.mjs` (Playwright, `pnpm assets:generate`) that mirrors
  the site's tokens and fonts; covers are served through `next/image` so the reserved
  `aspect-[16/10]` frame keeps layout shift at zero. Documented in
  [projects](docs/content/projects.md) and [seo](docs/content/seo.md).
- **Privacy-friendly analytics (S2-5).** Self-hosted, cookieless
  [Umami](https://umami.is) for aggregate usage insight, so the backlog can be groomed on
  evidence (S6-6) instead of guesswork. Umami runs as a standalone Docker stack on the same
  Contabo VPS ([`deploy/analytics/docker-compose.yml`](deploy/analytics/docker-compose.yml),
  bound to loopback behind Nginx on `analytics.<domain>`), with its own lifecycle - it is
  not built or deployed by the app's CI. The app loads the tracking tag only when a build
  supplies two public, build-time-inlined values (`NEXT_PUBLIC_ANALYTICS_SRC` and
  `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID`); with either unset, `lib/config/analytics.ts` returns
  null and the `Analytics` component (mounted in `SiteChrome`) renders nothing, so an
  unconfigured build makes zero analytics requests. The tag is a single deferred, cookieless
  script that stores no IP and builds no personal profiles; the Datenschutz page
  (`content/legal.ts`) discloses the processing under Art. 6 Abs. 1 lit. f DSGVO, with no
  cookie banner. Decision and trade-offs (Umami over Plausible CE) in
  [ADR-0008](private-docs/docs/architecture/decisions/0008-analytics.md); the stand-up procedure in the
  [analytics runbook](docs/operations/analytics.md).
- **Interactive fuelivo proof (S4-5).** A self-contained live calculator on the fuelivo
  detail page that turns its strongest claim - deterministic, explainable output - into
  something a visitor can touch. Drive a session (duration, intensity, sport, heat) and the
  per-hour carbohydrate, fluid and sodium targets recompute instantly, each showing the
  reasoning trace behind its number ("Basis 60 · +15 Intensität · +10 Sportart · gedeckelt
  bei 90"). The math is a pure, unit-tested, dependency-free engine
  (`lib/fuelivo/proof.ts`) - a deliberately simplified illustration of the real additive
  model, not the production formula - so the widget does no data fetching and holds no
  secrets. It initialises from a fixed default input, so the server and first client render
  agree (no hydration mismatch, no layout shift); its only motion (bars easing to length) is
  gated behind `motion-safe`, so reduced motion gets the same widget with values that snap.
  A new `caseStudy.interactiveProof` flag mounts it under the solution section (claim then
  proof), keeping `ProjectDetail` data-driven. Documented in
  [projects](docs/content/projects.md) and
  [rendering-and-data](docs/architecture/rendering-and-data.md).
- **Dark mode (S4-2, unparks P3-4).** An optional dark theme, delivered as the token swap
  ADR-0003 always promised: `html[data-theme="dark"]` in `app/globals.css` redefines only
  the raw semantic tokens, so every utility recolours with no duplicated values (the
  always-dark terminal/boot `--term-*` tokens stay put). A dependency-free pre-paint inline
  script (`lib/chrome/theme.ts`, mounted in `SiteChrome`) resolves the persisted choice, else
  the light default, and writes `data-theme` on `<html>` before first paint, so there is no
  flash of the wrong theme. Dark mode is **off by default**: the OS `prefers-color-scheme` is
  not consulted, so the site opens light for everyone until they flip the toggle. The theme
  toggles from the command palette and from a dedicated button in the nav "Mehr" and phone
  menus, both wired through a `useTheme` hook; the choice persists in `localStorage`. The dark
  palette is derived from the site's own terminal greens and verified against WCAG AA on both
  `--bg` and `--surface`. Documented in [ADR-0007](private-docs/docs/architecture/decisions/0007-theming-dark-mode.md),
  [design-system](docs/design/design-system.md) and [accessibility](docs/design/accessibility.md).
- **Motion & micro-interaction polish (S4-6).** Deliberate hover/focus choreography across
  the signature surfaces, with hover and keyboard focus kept in step and a reduced-motion path
  for every move. A new shared `ArrowAffordance` (`components/ui/ArrowAffordance.tsx`) nudges
  trailing CTA/link arrows in their travel direction on hover and `:focus-visible` (forward
  `→` slides right, external `↗` lifts up-right), wired into the hero CTAs, the featured
  project's live/detail links and the "view all" link; `Button` now carries `group` so the
  arrow tracks the control. Linked project cards lift with the widget shadow, rise, shift their
  border to `pine` and zoom their cover on both `group-hover` and `group-focus-visible`, so
  tabbing to a card matches hovering it. The command-palette row highlight glides between
  entries during ArrowUp/Down navigation. All `translate`/`scale` moves are `motion-safe` only
  (colour/border/shadow stay), and the global `:focus-visible` ring is untouched. Documented in
  [animation-and-motion](docs/design/animation-and-motion.md).
- **Terminal depth (S4-4).** Two new advertised commands, `skills` and `experience`, source
  their output from the same `content/skills.ts` and `content/experience.ts` data as the
  Skills and Werdegang sections, so the terminal and the page never drift; both surface in the
  command palette automatically via `terminal.help.entries`. A hidden `sudo rm -rf /` easter
  egg answers with a safe, on-tone refusal (nothing is ever deleted), and the `sudo hire-me`
  flow gains a verifying beat before the grant. All command logic stays in the pure core
  (`lib/terminal`) and every string in `content/copy/{de,en}.ts`; focus behaviour and the
  reduced-motion static cursor are unchanged.
- **Signals-of-life feed (S3-5).** One "the site is alive" surface on the onepager that
  gathers the previously scattered live signals into a single strip: the latest public
  commit, the latest blog post, the now-playing track (mirrored from the hero) and the
  GitHub contribution total. The latest post is real build-time content rendered on the
  server; the three live signals are fetched from their same-origin routes after
  hydration and each degrades on its own, so one source failing only drops its own row
  (never the surface). A new server-only `lib/data/latest-commit.ts` + `/api/latest-commit`
  route reads the most recent public push from the GitHub events API (reusing the
  contribution heatmap's `GITHUB_TOKEN`; a secret-less CI/preview degrades quietly and
  makes no external call), cached ~15 min with a graceful fallback and the same
  `logWidgetFailure` observability as the other widgets. Every row
  reserves its height (no CLS), the only motion is a `motion-safe` live-dot pulse, and
  nothing re-renders per frame. The existing hero now-playing and the standalone activity
  heatmap stay in place. The coding-stats signal (WakaTime, S3-2) ships as its own
  standalone strip alongside these live signals. Documented in
  [rendering-and-data](docs/architecture/rendering-and-data.md).
- **`/uses` page (S3-4).** A content-driven `/uses` route listing the hardware, editor, stack
  and tools actually in use, grouped in the spirit of uses.tech and kept honest (no
  aspirational kit). The inventory lives in a typed `content/uses.ts` read via
  `getUsesGroups(locale)`; the page reuses the numbered `SectionHeader` per group and the blog
  index's page-header pattern. It is an IA level-2 destination (ADR-0005): reached from the
  footer's `explore` nav, registered in the `lib/i18n/routes.ts` route map, and indexable in
  the sitemap. Only the German route is live today; the English variant is wired but gated
  behind `translatedRoutes` until translated.
- **WakaTime coding-stats widget (S3-2).** A standalone strip after the GitHub activity heatmap
  showing the last-7-days language breakdown (share bars + durations) and total coding time, so
  the two live-coding signals sit together. The client widget calls a same-origin
  `/api/wakatime` route that reads a server-only `WAKATIME_API_KEY` (authenticating as its own
  account, so no username is needed) and caches one upstream call per ~1 h window via
  `unstable_cache`; the key never reaches the client bundle. It renders a fixed number of rows
  (a skeleton on the server and first client render) so the strip reserves its height with no
  layout shift, and degrades to a static German/English fallback caption on any failure -
  logged through `logWidgetFailure` unless the key is simply unset. Documented in
  [`rendering-and-data.md`](docs/architecture/rendering-and-data.md) and
  [`environment-variables.md`](private-docs/docs/operations/environment-variables.md).
- **DevBlueprint project detail page (S3-6).** Promotes DevBlueprint - a reusable,
  stack-agnostic engineering-setup kit - to a full `/projekte/devblueprint` case study with a
  genuine problem -> approach -> learnings story (summary, solution, features, tech stack,
  architecture, challenges, metrics, timeline), reusing the existing `ProjectDetail`
  infrastructure and the German/English card-level content split. This brings the site to three
  real detail pages (fuelivo, Aurelian, DevBlueprint), all statically generated, in the sitemap
  and linked from the `/projekte` index. As a command-line kit it carries no product screenshot,
  so the page deliberately uses the striped placeholder; its outbound link points at the public,
  MIT-licensed repository. DevBlueprint sorts third by `order`, ahead of the remaining lean
  stubs (which shift down accordingly). Documented in
  [`docs/content/projects.md`](docs/content/projects.md).
- **`/jetzt` (Now) page (S3-3).** A page-level (IA level 2) route with a dated snapshot of the
  current focus - what I am building, learning and reading. Reached from the footer's explore
  list rather than the scroll-only primary nav (ADR-0005), indexable with its own canonical
  and Open Graph metadata, and in the sitemap. The German copy lives as a typed `NowPage` in
  [`content/now.ts`](content/now.ts), so keeping the page current is a one-file edit (change
  the sections, bump `Stand`); the page under `app/(de)/jetzt/` is a thin renderer over it.
  The route is registered in the i18n route map; its English variant is staged behind
  `translatedRoutes` (the footer link is hidden and the language toggle falls back to the
  English home until it ships), like the blog. Editing guide in
  [`docs/content/text-anpassung.md`](docs/content/text-anpassung.md).
- **English onepager and the i18n foundation (S5-1).** The site now serves German and English
  from one component tree. German stays canonical and unprefixed (`/`); English lives under an
  `/en` prefix with translated path segments, via two App Router route-group root layouts
  (`app/(de)/`, `app/(en)/en/`) that each own their `<html lang>` shell and root metadata and
  share a locale-parameterized `SiteChrome` and `Onepager`. Copy moves from a single German
  singleton to `getCopy(locale)` over a typed `Copy` contract (`content/copy/de.ts` +
  `en.ts`), so a missing English string is a compile error; a `lib/i18n/` locale model and
  route map are the single source of truth for every path, the language toggle, the
  `de-DE`/`en`/`x-default` hreflang alternates and the sitemap. A `translatedRoutes` gate
  keeps untranslated English routes hidden (the toggle falls back to the English home), so
  translation can land route-by-route; only the onepager is live today. The `/en` onepager is
  in the sitemap with absolute hreflang. Documented in
  [ADR-0006](private-docs/docs/architecture/decisions/0006-i18n-and-localization.md) and
  [`docs/content/i18n.md`](docs/content/i18n.md). Also fixes two bugs surfaced en route: a
  half-migrated `NotFoundTerminal` and a `usePathname()` null crash in the language toggle.
- **Command palette (⌘K) (S2-6).** A keyboard-first launcher that unifies section/route
  navigation and the terminal's command set. `⌘K`/`Ctrl-K` (or a discreet `⌘K` chip in the
  nav) opens it on any route; typing filters, ArrowUp/Down move the highlight and Enter
  activates. Navigation entries route (section anchors scroll, pages navigate); terminal
  commands run through the same pure `runCommand` as the widget and paint their German
  output inline. It is an accessible modal (ARIA combobox/listbox, `aria-modal`): `Escape`
  always closes it and restores focus to the opener, focus never escapes behind the overlay,
  and the open animation is `motion-safe` only. The command registry and its filter live as
  a pure, DOM-free core in `lib/command-palette`; all German copy stays in `content/copy.ts`.
  The optional theme slot is deferred to S4-2 (no theme system exists yet).
- **Automated dependency updates (S2-10).** [Dependabot](https://docs.github.com/code-security/dependabot)
  (`.github/dependabot.yml`) now opens weekly PRs against the `develop` integration branch for
  both application dependencies (`npm`, read from the pnpm lockfile) and the GitHub Actions
  pinned in the CI/deploy workflows. Minor and patch bumps are grouped into a single PR per
  ecosystem to keep review overhead low; majors open individually. Every PR runs the full CI
  gate before it can merge, and bumps ride the normal `develop` -> `master` release path - they
  never touch `master` directly. New doc `docs/engineering/dependency-updates.md` covers the
  flow and how to review a dependency PR. The three live-data route handlers
- **Route view transitions (S2-7).** Navigating between the onepager, the `/projekte` index
  and the project detail pages now cross-fades via the native View Transitions API. It is
  strict progressive enhancement: a transition-aware `Link`
  (`components/chrome/view-transitions`) wraps `next/link` and, only when the browser supports
  `document.startViewTransition` and the visitor has not requested reduced motion, drives the
  animation around the client navigation; everywhere else it falls back to the ordinary
  instant navigation. A `ViewTransitionProvider` in the root layout resolves each transition
  once the new route commits, with a safety timeout so a stalled navigation can never block
  input. The cross-fade timing (~0.28s) and a reduced-motion kill switch live in
  `app/globals.css`. Docs in `docs/design/animation-and-motion.md`.
- **Observable live-widget failures (S2-9).** The three live-data route handlers
  (`app/api/github-activity`, `app/api/now-playing`, `app/api/weather`) still degrade to
  their static fallback on any upstream error, but a genuine failure is no longer swallowed
  silently: a new server-only `logWidgetFailure` (`lib/observability/widget-failure.ts`)
  records it as a single greppable `[widget:<name>] upstream unavailable, serving fallback:
  ...` line on stderr, the lightweight error signal ahead of full monitoring (S6-2). An
  intentionally unconfigured optional feature (no `GITHUB_TOKEN`, no Spotify secrets) throws
  the new `WidgetNotConfiguredError` and is skipped, so CI builds and secret-less previews do
  not spam the signal. Only the widget name and the error message are logged, never a token.
  Docs in `docs/architecture/rendering-and-data.md`.
- **12-month roadmap outlook (Jul 2026 - Jun 2027).** `docs/project/roadmap.md` gains a
  strategic outlook above the sprints: four themed quarter-sprints (S3 Living portfolio, S4
  Signature & delight, S5 Reach & discoverability, S6 Longevity & trust) that absorb the
  still-open S2 tiers into their theme and add new features (WakaTime coding-stats widget,
  `/jetzt` and `/uses` pages, a signals-of-life feed, an interactive fuelivo proof, dynamic
  per-page OG cards, error/uptime monitoring and CI quality gates), plus an explicit
  out-of-scope list. `docs/project/backlog.md` gains the matching pickup-ready tasks
  (`S3-1`..`S3-6`, `S4-1`..`S4-6`, `S5-1`..`S5-4`, `S6-1`..`S6-6`) with acceptance criteria;
  each sprint records which still-open `S2-*` tasks it carries so nothing is double-counted.
  No code change; planning only.
- **Aurelian project detail page (full case study).** The former `stoic-daily` placeholder is
  replaced by a real `aurelian` project (`content/projects/aurelian.ts`): an iOS-first app for
  daily stoic reflection, now the second project (after fuelivo) with a full `caseStudy` and a
  `detailPage` at `/projekte/aurelian`, linking to the live site
  `aurelian.yannikwuenker.de`. It moves to `order: 2` (rezepte-app shifts to `3`), so it also
  surfaces on the onepager projects teaser. Docs updated in `docs/content/projects.md`.
- **Terminal-style 404 page.** An unmatched route now renders `app/not-found.tsx`, which
  reuses the terminal widget's motif (dark card, chrome bar, green prompt) and echoes the
  requested path as a failed `cd` before showing a German 404 message and `ls`-style links
  back into the site. The message lives in a real `<h1>` and paragraph (not just terminal
  decoration), the block cursor blinks under `motion-safe` only, and the page is `noindex`
  like the legal pages. German copy lives in `content/copy.ts` (`notFound`).
- **Availability pill is now feature-flagged.** The hero "Verfügbar als Werkstudent" pill
  (reworded from "für") is gated behind a new server-only `SHOW_AVAILABILITY` flag
  (`lib/config/features.ts`). It is off by default, so the pill is absent from the
  prerendered HTML unless the flag is explicitly set to `true`/`1` and the site is rebuilt -
  the site does not advertise a job search until that switch is flipped. The flag is
  server-only (never `NEXT_PUBLIC_*`, so it stays out of the client bundle) and is catalogued
  in [environment variables](private-docs/docs/operations/environment-variables.md) and `.env.example`.
- **fuelivo project detail page turned into a full case study.** The `Project` model gains
  an optional `caseStudy` object (`content/projects/types.ts`), and `ProjectDetail` renders
  it section by section: a lead summary, the solution with its calculation highlights, a
  feature list with status dots, the tech stack grouped by layer, architecture notes,
  challenge cards, a scope-metrics grid and a timeline. Every field is optional, so a
  project without a case study renders exactly as before; the layered `techStack` replaces
  the flat `stack` pills when present. fuelivo's entry is filled from its own repository -
  its provisional placeholder stack is gone. Feature build state (`done`/`in-progress`/
  `planned`) shows as text next to a color dot, never color alone. Model documented in
  [projects](docs/content/projects.md).
- **Copy-revision worksheet.** A working document at
  [`docs/content/text-anpassung.md`](docs/content/text-anpassung.md) that lists every
  user-facing German string on the site with its source location (file + line) and a
  `Neu:` line per entry, so the copy can be reviewed and refined section by section in one
  place. Grouped by page flow (meta/SEO, nav, hero, terminal, projects, about, contact,
  blog, legal, ...). Documentation only; no runtime change.
- **Blog (P3-7).** An MDX-based blog at `/blog` (index) and `/blog/[slug]` (post pages),
  reached from a new page-level "explore" nav in the footer rather than the scroll-only
  primary nav (IA level 2/3, [ADR-0005](private-docs/docs/architecture/decisions/0005-information-architecture.md)).
  Posts are authored as `content/blog/*.mdx` with a small, validated frontmatter block
  (`title`, `date`, `summary`, optional `tags` and `draft`); `lib/content/blog.ts` reads
  and validates them at build time and is the single source of truth behind the index, the
  statically generated post pages, the sitemap and a static RSS feed at `/blog/feed.xml`. A
  malformed post fails the build loudly, drafts stay out of every published surface, and the
  slug is the filename so it can never disagree with the URL. Prose is styled globally by the
  root `mdx-components.tsx` so posts match the legal and project-detail pages. Ships with a
  first post; authoring and pipeline documented in [blog](docs/content/blog.md).
- **Blog reachable from the primary nav.** The header now carries the blog as a page-level
  destination alongside the scroll anchors, so a visitor no longer has to reach the footer to
  find it. Per [ADR-0005](private-docs/docs/architecture/decisions/0005-information-architecture.md) a page
  link must not look like a section anchor, so `copy.nav.pageLinks` is kept separate from the
  scroll `links` and the Nav renders it past a divider with a trailing arrow - on desktop and
  in the phone menu (`components/chrome/Nav.tsx`). The footer's `explore` link stays as-is.
- **Nav no longer blurs content scrolling underneath it.** The fixed header carried a
  `backdrop-filter: blur(8px)`, which frosted everything behind it - most visibly the
  `ScrollSpine` line, which turned fuzzy where it passed under the header
  (`components/chrome/Nav.tsx`). The blur is removed; the fade-out background gradient
  already lets content disappear cleanly under the nav, so the spine and other content
  now stay crisp.
- **Hero walk-through character no longer shows a black box in Safari.** The clip was served
  only as an alpha WebM (VP9); Safari plays VP9 but ignores its alpha channel, compositing the
  character onto an opaque black rectangle. The component
  (`components/sections/hero/HeroCharacter.tsx`) now also serves an HEVC clip with an alpha
  channel (`public/hero-character.mov`, `hvc1`) listed first. Only Safari accepts the
  `video/quicktime` type, so Chrome and Firefox keep using the WebM and never fetch the `.mov`;
  each engine downloads just the one clip it can render transparently.

### Changed
- **WakaTime widget shows projects, not languages.** The coding-activity strip now breaks the
  last-7-days coding time down by project rather than by programming language, reading the
  `projects` array from the same `stats/last_7_days` payload (same shape: name, share, duration).
  This surfaces *what* was being built over *which* language it was written in, which reads as a
  stronger signal on a portfolio. No new scopes or requests - the swap is a different slice of the
  response already fetched. Documented in
  [rendering-and-data](docs/architecture/rendering-and-data.md).
- **Nav "Mehr" menu groups the off-one-pager destinations.** The primary nav stays a
  scroll-only map of the sections (ADR-0005): on desktop the page links (blog, uses, now),
  the language toggle and the command palette trigger now collapse behind a single "Mehr"
  disclosure past the section links, so a page navigation can never be mistaken for a section
  anchor. The nav previously surfaced only the blog inline; uses and now are now reachable
  from the header too (they already lived in the footer's `explore` nav). The phone menu
  gains the command palette trigger alongside the same destinations. Both disclosures share
  one dismissal behaviour (Escape returns focus to the trigger, an outside press closes).
- **Ignore the local `.wakatime-project` file.** The WakaTime editor plugin writes a
  `.wakatime-project` marker into the repo root; it is a local time-tracking artifact and is
  now listed in `.gitignore` so it no longer shows up as untracked.
- **Wider content and a two-column project case study.** The content container is capped by
  a single `--container-max` token (`app/globals.css`) that every section shell now
  references as `max-w-(--container-max)` instead of a hardcoded `max-w-[1320px]`, and the
  cap is raised 1320 -> 1440px so wide screens are used with structure rather than fat
  margins (flowing text keeps its own `~46-65ch` measure). The project detail page
  (`ProjectDetail`) becomes a two-column case study at `lg`+: a readable story column plus a
  sticky rail with the actions, tech stack and headline numbers, so it fills the width and
  reads much shorter; below `lg` the rail drops under the story, and it is skipped entirely
  for a project with nothing to put in it. The `/projekte` index card grid gains a third
  column at `xl`. Docs updated in [design system](docs/design/design-system.md) and
  [responsive & mobile](docs/design/responsive-and-mobile.md).
- **`sudo hire-me` no longer advertises the job search.** The terminal payoff command
  dropped the "Verfügbar für Werkstudent - ab sofort." line and now closes with a plain
  invitation to get in touch ("Schick mir gerne eine Mail: mail@yannikwuenker.de", in
  `content/copy.ts`). Availability status stays gated to the hero pill behind
  `SHOW_AVAILABILITY`, so the terminal no longer leaks it. Copy only - the terminal unit
  test derives its expectation from the copy, so it stays green.
- **Copy pass on the hero, about and project taglines.** From the copy-revision worksheet
  ([`docs/content/text-anpassung.md`](docs/content/text-anpassung.md)): the hero kicker is
  now `STUDENT · DEVELOPER · ATHLETE`, the H1 reads "Ich entwickle Software, die meine
  eigenen Probleme löst." and the sub leads with websites, apps and automation. The about
  headline becomes "Code, Sport, Sleep, Repeat." (a riff on the "eat sleep code repeat"
  trope that folds in the sport that sets him apart) and both body paragraphs are reworded
  to be more personal. Taglines updated for fuelivo, Stoic Daily and Daily Dashboard. Copy
  only - no behavioral change; the hero smoke test asserts the new H1.
- **Nav is now responsive (S2-11).** The fixed header used the desktop padding
  (`pl-26 pr-14`) and rendered every section link inline, so on phones the link row could
  overflow or be clipped (`components/chrome/Nav.tsx`). It now follows the canonical shell
  padding (`px-6 sm:px-10 lg:pr-14 lg:pl-26`) and respects `env(safe-area-inset-*)` so its
  content clears a notch or home indicator. From `md` up nothing changes - the inline links
  and the live scroll percentage still show. Below `md` those desktop flourishes collapse:
  the header degrades to logo plus a single ~44px menu affordance that toggles the section
  links in a dropdown (Escape closes it and returns focus to the toggle; a press outside
  the header dismisses it; focus is not trapped). The scroll percentage still updates via a
  ref without a per-frame React re-render. Documented in
  [responsive & mobile](docs/design/responsive-and-mobile.md).
- **Hero character is now gated to desktop widths (S2-12).** The one-shot walk-in video
  (`components/sections/hero/HeroCharacter.tsx`) was suppressed only under
  `prefers-reduced-motion`; on narrow / mobile screens the `45vh` full-width figure crowded
  the single-column hero and pulled an alpha video for no benefit. It now also skips below
  `lg` (`min-width: 1024px`). Both gates are read client-side, so the `<video>` is only
  added to the tree once the viewport is confirmed to allow motion and be wide enough - a
  reduced-motion or small-screen visitor gets the hero copy only, no character, and never
  fetches the clip. Desktop behaviour is unchanged. Documented in
  [responsive & mobile](docs/design/responsive-and-mobile.md).
- **Hero now tracks the visible viewport on mobile (S2-13).** The hero
  (`components/sections/hero/Hero.tsx`) used `min-h-screen` (`100vh`), which mobile browsers
  measure against the tallest layout, so the section jumped and showed a blank strip as the
  address bar showed/hid. It now uses `min-h-dvh`, which tracks the dynamic (visible)
  viewport, so the hero stays flush as the address bar toggles. Desktop height is unchanged.
  Documented in [responsive & mobile](docs/design/responsive-and-mobile.md).
- **Hero now uses a two-column layout that fills the empty space beside the copy.** The
  hero was a single left-aligned text column with a large empty area to its right, and the
  live widgets (now-playing, time/weather, availability) were crammed into one status row
  under the CTAs. They now move into a right-hand cluster (`components/sections/hero/Hero.tsx`)
  that sits top-right on `lg` and stacks under the copy below it, balancing the headline and
  giving the now-playing card room. The reveal is sequenced so the text column rises in first
  and the cluster settles in a beat later. The walk-through character (`HeroCharacter`) still
  crosses the foot of the section, now passing under the cluster so it never covers text or
  widgets.
- **Adopted a `develop` integration branch with a periodic release to `master`.** Feature
  branches now fork from and merge into `develop` (`pnpm wt new` and `pnpm wt gc` measure
  against `origin/develop`), and pushing `develop` deploys to the dev subdomain
  (`portfolio.yannikwuenker.de`) for cross-device testing. `master` stays the always-deployable
  release branch, promoted only via a `develop` -> `master` PR, and is no longer auto-deployed
  pre-MVP. CI (`ci.yml`) now gates PRs into both branches; the deploy workflow (`deploy.yml`)
  triggers on `develop` and release tags. Both long-lived branches are protected, so GitHub's
  auto-delete-on-merge cleans up feature branches without ever removing `develop` or `master`.
  Documented in [git-workflow](docs/engineering/git-workflow.md),
  [CONTRIBUTING](CONTRIBUTING.md) and [deployment](private-docs/docs/operations/deployment.md).
- **Projects section is now a curated teaser.** The onepager section
  (`components/sections/projects/Projects.tsx`) shows the featured project plus `TEASER_COUNT`
  (2) more by `order` instead of every project, and gains an "Alle Projekte ansehen" link into
  the new `/projekte` index. The lower-order projects (Daily Dashboard, Mail Classifier today)
  now live only on the index. This makes the section IA level 1 - a top-N teaser - per
  ADR-0005.
- **Project detail back-link points at the projects index.** The "Zurück zu den Projekten"
  link on `/projekte/<slug>` now navigates to `/projekte` (its parent) instead of the
  `/#projekte` onepager section (`content/copy.ts`). No component change - `ProjectDetail`
  already renders whatever `backToProjects.href` holds.
- **CV download moved to the Werdegang section.** The "Lebenslauf (PDF)" download now sits
  below the Werdegang timeline (`components/sections/experience/Experience.tsx`) instead of in
  the contact section, next to the condensed career history it complements. The
  availability check (`lib/content/cv.ts`, `isCvAvailable()`) and its single-source-of-truth
  path moved with it from `copy.contact.cv` to `copy.experience.cv`; the contact section no
  longer renders a CV link. Behaviour is unchanged: the download appears only when a
  non-empty CV exists in `public/`, otherwise it degrades to nothing.

### Removed
- **Dead hero CV CTA.** Dropped the never-rendered `copy.hero.ctas.cv` entry ("CV laden") and
  the stale comment in `components/sections/hero/Hero.tsx` that promised to wire it into the
  contact section (P1-12). The CV download instead ships in the Werdegang section
  (`copy.experience.cv`), so the hero entry was orphaned copy; its guard test in
  `tests/unit/hero.test.tsx` was removed with it.

### Fixed
- **Dark-mode toggle state stays on one line.** In the nav "Mehr" and phone menus the
  `[ aus ]` / `[ ein ]` state indicator beside "Dunkelmodus" could wrap between its bracket
  and word under the toggle's `justify-between` layout, so the button looked broken. The
  state span is now `whitespace-nowrap`, keeping the label and its bracketed state on a
  single line.
- **Scroll spine now reaches 100% at the bottom of the page.** `useScrollProgress`
  (`lib/hooks/use-scroll-progress.ts`) only re-measured the scrollable height on `resize`,
  so height changes that fire no `resize` event - web fonts settling, images loading,
  expanding content - left the cached height stale and the spine fill stopped short of (or
  past) the end. A `ResizeObserver` on the document element now re-measures on every height
  change, keeping the ratio exact all the way to the bottom.

### Added
- **Responsive & mobile-optimization guide.** New
  [`docs/design/responsive-and-mobile.md`](docs/design/responsive-and-mobile.md) defines how
  the desktop handoff degrades from 1320px down to a 320px phone: the shared section shell,
  the breakpoint set (Tailwind v4 defaults plus the `min-[1100px]` spine query), fluid
  `clamp()` typography, how grids collapse to one column, and how the chrome steps back on
  small screens (scroll spine hidden below 1100px, hero character suppressed on narrow
  screens, nav collapsed) so nothing is clipped and nothing overflows horizontally. Adds a
  per-width testing checklist and records the current code gaps (nav padding/menu, character
  width gate, hero `min-h-dvh`). Linked from the docs index and the design system.
- **`pnpm spotify:token` helper to mint the now-playing refresh token.** A one-shot local
  script (`scripts/spotify-token.mjs`) runs the Spotify OAuth flow on a loopback server and
  prints a `SPOTIFY_REFRESH_TOKEN` carrying both required scopes
  (`user-read-currently-playing` + `user-read-recently-played`). Previously the P3-8
  last-played fallback needed a hand-rolled OAuth flow; a token minted without
  `user-read-recently-played` silently degraded the widget to the static "Lofi & Commits"
  placeholder. Documented in
  [environment variables](private-docs/docs/operations/environment-variables.md#spotify-now-playing-scopes).
- **P3-9 — Projects index page.** A dedicated `/projekte` route (`app/projekte/page.tsx`)
  lists every project, not just the onepager teaser - the IA level-2 index from ADR-0005.
  It reuses `FeaturedProject` and `ProjectCard` and the standalone-page chrome (mono eyebrow,
  serif H1, back link up to `/#projekte`) so it feels like one family with the detail and
  legal pages. The page is indexable and joins `app/sitemap.ts`; it sits beside
  `/projekte/[slug]` without conflict (that route's `dynamicParams = false` is scoped to the
  dynamic segment).
- **ADR-0005 — Information architecture.** Recorded the one-pager-hub-with-opt-in-drill-down
  model that already governs the site: a fixed three-level hierarchy (section → index page →
  detail page), the rule that the primary nav always *scrolls* and never navigates, and
  summary-to-depth as a separate in-section gesture. Documents the existing
  `detailPage`-flag pattern as the canonical opt-in and names `/projekte` (a level-2 index) as
  the intended next step (`docs/architecture/decisions/0005-information-architecture.md`).
- **P3-3 — Project detail pages.** Projects flagged `detailPage` now get a dedicated
  `/projekte/<slug>` page (`app/projekte/[slug]/page.tsx`,
  `components/sections/projects/ProjectDetail.tsx`) that gives a warranted project more room
  than the onepager card: a large cover, the full problem/role/learnings story, the stack and
  its outbound links. The pages are statically generated from a shared `detailProjects` list
  (`content/projects.ts`) that also drives the sitemap and the onepager link, so the route,
  sitemap and link never drift; every other `/projekte/*` slug is a static 404
  (`dynamicParams = false`). fuelivo is the only flagged project today - its featured card keeps
  the "Live ansehen" button and gains a "Details ansehen" link into the page. Each page ships
  per-page metadata (title, description, canonical, Open Graph) and joins `app/sitemap.ts` as an
  indexable route. The page renders only the fields a project has, so a leaner entry degrades
  gracefully.
- **CV PDF (part of P3-5).** Added the real CV at `public/cv/yannik-wuenker.pdf`, the
  canonical path already referenced by `content/copy.ts` and checked server-side by
  `lib/content/cv.ts`. With the file present and non-empty, `isCvAvailable()` now returns
  true, so the contact section surfaces its "Lebenslauf (PDF)" download instead of degrading
  to nothing. Also dropped the now-obsolete `.gitkeep` placeholders from `public/cv/` and
  `public/images/` since both directories hold real assets.
- **fuelivo cover in a browser frame.** Replaced the featured project's cover screenshot with
  the real fueling-plan output (`public/images/fuelivo_screen.png`) and wrapped it in a
  lightweight browser-window frame - traffic-light dots plus the live domain pill - so the
  landscape app shot reads as a real product rather than a raw capture
  (`components/sections/projects/ProjectMedia.tsx`). The featured media slot moved from a
  portrait `aspect-[4/5]` box (which cropped a landscape screenshot to a narrow strip) to a
  vertically centered `aspect-[16/10]` frame that shows the whole screenshot uncropped
  (`components/sections/projects/FeaturedProject.tsx`).
- **P3-8 — Now-playing recently-played fallback.** When nothing is currently playing, the
  hero widget now falls back to the most recently played track, labelled "last played",
  before the static "Lofi & Commits" placeholder (`lib/data/now-playing.ts`,
  `components/sections/hero/NowPlaying.tsx`). The data source resolves a small discriminated
  union (`playing` / `recent` / `idle`): it reads `me/player/currently-playing` and, only
  when idle, `me/player/recently-played?limit=1`; the route maps that to cache headers and
  degrades to `idle` on any failure so the widget keeps its placeholder. Secrets stay
  server-only. The recently-played read needs the `user-read-recently-played` scope on the
  refresh token; until the token is regenerated with it Spotify returns 403 and the widget
  degrades cleanly to the placeholder, so nothing breaks. See
  [environment variables](private-docs/docs/operations/environment-variables.md#spotify-now-playing-scopes).
- **fuelivo cover screenshot.** Gave the featured project a real cover visual instead of the
  striped placeholder by setting `media.cover` to `public/images/fuelivo_screen.png`
  (`content/projects.ts`). `ProjectMedia` already rendered `media.cover` when present, so no
  component change was needed; the projects-section test now asserts the placeholder only for
  projects without a cover.
- **Inbox doc for raw capture.** Added `docs/project/inbox.md`, a low-friction scratch list
  for feature ideas, bugs and open questions, kept separate from the groomed
  [backlog](private-docs/docs/project/backlog.md) so the authoritative task list stays clean. Items get
  triaged from the inbox into real backlog tasks (or dropped); the backlog now links it.
- **P3-2 — Hero character walk-through.** Replaced the hero's placeholder visual panel (the
  striped card, REC badge and `[ hero-video.mp4 ]` caption) with a small character that walks
  along the foot of the hero once on load (`components/sections/hero/HeroCharacter.tsx`, an
  alpha WebM at `public/hero-character.webm`). The overlay is absolutely positioned and
  click-through (`pointer-events-none`), anchored to the bottom of the hero section (which
  is `relative`) at a fraction of the viewport height (`h-[45vh]`, full-viewport-width via
  `w-screen` centered with `left-1/2 -translate-x-1/2`, `object-contain object-left-bottom`)
  so it reads as a small figure, never covers the hero copy, and scrolls away with the hero
  rather than trailing the reader down the page; it is mirrored (`-scale-x-100`) so the character enters from the right,
  and the frame is anchored to that right screen edge (the mirror flips `object-left` to the
  right) so the character walks in from the very edge rather than starting mid-screen; it
  fades in only once playback starts so the transparent lead-in never flashes a poster. It
  plays exactly once: after a 1.5s pause on a returning visit (long enough that the hero text
  has finished its rise-in reveal first, so the character always follows the already-present
  copy), or after the boot splash has cleared plus that pause on a first visit, then unmounts
  on `ended` so nothing lingers. It is muted (no autoplay sound) and decorative (`aria-hidden`); under
  `prefers-reduced-motion` it never plays and renders nothing, per the P3-2 "reduced-motion
  still" rule and [accessibility](docs/design/accessibility.md). The alpha WebM is a
  progressive enhancement - a browser that cannot composite it (e.g. Safari) simply shows
  nothing. With the panel gone the hero is a single text column and the now-playing widget
  (P3-1) moved from a floating card into an inline pill in the status row.
- **P2-3 — GitHub activity.** Added a standalone GitHub contribution heatmap after the About
  section (`components/widgets/github-activity/GithubActivity.tsx`, mounted in `app/page.tsx`;
  a widget, not a numbered section, so it stays out of the section-eyebrow sequence). The
  last year of contributions is fetched from a new same-origin route handler
  (`app/api/github-activity/route.ts`) that calls GitHub's authenticated GraphQL
  contribution calendar server-side (`lib/data/github-activity.ts`) for the fixed
  `spockey4711` user (overridable via `GITHUB_USERNAME`). The result is cached on-box with
  `unstable_cache` for ~6h - at most one upstream call per window across all visitors, so it
  stays within GitHub's rate limit - and the route returns a typed "unavailable" state on any
  failure (missing token, upstream error, bad payload). The widget renders a fixed-size
  skeleton grid on the server and first client render (no hydration mismatch, no layout
  shift), fetches the live calendar in an effect, and keeps a static fallback caption if data
  never arrives. Cells use the site's own tokens (line/signal/pine), not GitHub's greens, so
  the heatmap stays on-brand; the grid exposes a single summary to assistive tech. The
  `GITHUB_TOKEN` is optional and server-only - without it the widget shows its fallback and
  the build/CI need no secret - and never reaches the client. Per
  [rendering & data](docs/architecture/rendering-and-data.md).
- **P3-1 — Now-playing (Spotify).** Wired the hero's floating "now playing" widget to live
  Spotify data (`components/sections/hero/NowPlaying.tsx`, extracted from the static
  placeholder in `Hero.tsx`): the four-bar equalizer stays decorative (animated only under
  `motion-safe`, per the design handoff) and the track line now shows the currently playing
  song. Playback is read by a new same-origin route handler (`app/api/now-playing/route.ts`)
  that calls Spotify server-side (`lib/data/now-playing.ts`): it refreshes the stored OAuth
  refresh token into a short-lived access token (never cached), reads the currently playing
  track, and returns a tiny typed `{ playing }` state cached ~30-60s. All three secrets
  (`SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` / `SPOTIFY_REFRESH_TOKEN`) stay server-only
  and the feature is fully optional - when unconfigured, on any upstream failure, or when
  nothing is playing, the route returns not-playing and the widget keeps its static
  "Lofi & Commits" fallback. The track starts from that fallback so the server and first
  client render agree (no hydration mismatch), the card reserves its space (no CLS), and a
  long title is width-capped and truncates so the floating card cannot overflow a narrow
  viewport. The widget polls the route each minute so the song stays current. Per
  [rendering & data](docs/architecture/rendering-and-data.md).
- **P2-2 — Live time/weather/location.** Replaced the hero's static mono meta with a live
  widget (`components/sections/hero/HeroMeta.tsx`): fixed location (`GER`), a live
  Europe/Berlin clock that ticks each minute and switches CET/CEST with daylight saving
  (`lib/utils/berlin-time.ts`), and the current Cologne temperature. Weather is fetched from
  a new same-origin route handler (`app/api/weather/route.ts`) that calls the key-less
  Open-Meteo API server-side (`lib/data/weather.ts`) for fixed Cologne coordinates, caches
  the result ~30 min, and returns a typed "unavailable" state on any upstream failure. Both
  live values start from the static fallbacks in `content/copy.ts`, so the server and first
  client render agree (no hydration mismatch), the line reserves its width up front (no CLS),
  and it degrades silently if data never arrives. No secret is involved and none reaches the
  client. Per [rendering & data](docs/architecture/rendering-and-data.md).
- **P2-1 — Added the interactive terminal.** The design handoff's static
  "Terminal-Hint-Strip" (docs/design/handoff/README.md section 4) is now a real command
  line, built directly as the interactive terminal it was always planned to become. A
  full content-width dark strip below the hero (`components/widgets/terminal/Terminal.tsx`,
  mounted in `app/page.tsx` between the hero and the first numbered section) echoes typed
  input and paints the output of a pure, DOM-free command core (`lib/terminal/commands.ts`
  + `lib/terminal/run.ts`). Commands: `help`, `whoami`, `projects` (from the project
  data), `contact`, `sudo hire-me`, `clear`, plus hidden easter eggs (`ls`, `coffee`,
  `echo`, bare `sudo`); unknown input returns a "command not found - tippe 'help'" hint,
  and Arrow up/down recalls entered commands. All German copy lives in `content/copy.ts`
  (`copy.terminal`), so components and lib hold no literals. Focus-safe per
  [accessibility](docs/design/accessibility.md): the input is a normal tab stop with a
  visible signal focus ring, is never autofocused (the strip is below the fold), `Escape`
  blurs it and `Tab` moves on - no focus trap; the log is an `aria-live` region. The block
  cursor is custom (a transparent input over a monospace mirror span) and blinks only
  under `motion-safe`, so reduced-motion users get a static cursor. Covered by unit tests
  for the command core (parsing, every command, `sudo` dispatch, unknown/blank input,
  `clear`) and the component (echo, clear, unknown-command hint, history recall, Escape
  blur, reduced-motion cursor class).
- **P1-15 — Accessibility + performance pass.** Wired the Lighthouse budget check deferred
  from P0-5: `@lhci/cli` plus a `lighthouserc.json` that asserts Performance, Accessibility,
  Best-Practices and SEO all `>= 0.95` and `cumulative-layout-shift <= 0.1` on a production
  build of the home page (three runs), a `lighthouse` script, and a `lighthouse` CI job that
  builds, runs the budgets and uploads the reports as an artifact. Added a keyboard
  skip-to-content link as the first tab stop (`app/layout.tsx`, off-screen until focused,
  jumping to `<main id="main" tabIndex={-1}>`), a single global `:focus-visible` ring in the
  `signal` accent (`app/globals.css`) so every tab stop shows a clear, on-brand focus state,
  and an SVG app icon (`app/icon.svg`) so browsers stop requesting a missing `/favicon.ico`.
  New Playwright coverage (`tests/e2e/a11y.spec.ts`) asserts the skip link and focus ring.
  Local Lighthouse: Performance 100, Accessibility 96, Best-Practices 100, SEO 100, CLS 0
  (the 4-point a11y gap is transient axe sampling during the boot/hero fade-in animations;
  every colour clears WCAG AA at rest). Per [accessibility](docs/design/accessibility.md)
  and [quality & testing](docs/engineering/quality-and-testing.md).
- **P1-14 — Added Person JSON-LD structured data.** A new `lib/seo/structured-data.ts`
  builds a schema.org `Person` entity (name, canonical `url`, `jobTitle`, `alumniOf`
  Universität zu Köln, `address` Köln/DE) with its `sameAs` profiles reused from the
  visible contact copy (`content/copy.ts`) so the LinkedIn/GitHub links never drift. The
  static facts live alongside the rest of the metadata contract in `lib/seo/site.ts`
  (`siteConfig.person`). A small server component `components/seo/JsonLd.tsx` serialises
  the payload into a single `application/ld+json` `<script>` (escaping `<` so no value can
  break out of the tag) and the root layout injects it once. Kept truthful and minimal per
  [seo](docs/content/seo.md) - only facts already shown on the page. The default Open Graph
  image tag already ships from P1-1 (on-brand Sand & Pine placeholder at
  `public/og/default.png`; the final asset lands in P3-5). Covered by unit tests guarding
  the schema.org-required shape, the absolute URL, the nested `alumniOf`/`address` objects
  and the `sameAs` set.
- **P1-13 — Added the legal pages (Impressum + Datenschutz).** New routes
  `app/impressum/page.tsx` and `app/datenschutz/page.tsx` render a shared
  `components/legal/LegalArticle.tsx` from the structured German content in
  `content/legal.ts`. The Impressum follows § 5 DDG and § 18 Abs. 2 MStV (full Anschrift,
  contact email, liability and consumer-arbitration statements); the Datenschutzerklärung
  reflects the actual, minimal GDPR footprint - self-hosted on the Contabo VPS (server
  logfiles under Art. 6 (1) (f), with the hoster as processor per Art. 28), self-hosted
  fonts with no Google connection, no tracking cookies, email contact, data-subject rights
  (Art. 15-21) and the Art. 77 right to complain. Both pages are `noindex, follow` and stay
  out of the sitemap. Each page links back to the onepager, and the footer (P1-12) already
  links both pages from every route. Covered by unit tests (content-model integrity and both
  rendered pages) and an e2e reachability/footer-navigation spec.
- **P1-12 — Added the contact section and the site footer.** Built
  `components/sections/contact/Contact.tsx` and mounted it as the last content section in
  `app/page.tsx`: a two-column pattern (collapsing to one below `md`) where the lead reads as
  the section's serif statement on the left and the actions sit on the right with email as the
  single prominent CTA (the pine "Kontakt aufnehmen" mailto button) above the direct channels
  (email address, LinkedIn, GitHub). It uses the shared `SectionHeader` eyebrow (`05 / Kontakt`),
  carries the `#kontakt` anchor the nav links to, labelled by a screen-reader heading. The CV
  download is a subtle ghost link shown only when the file actually exists in `public/`, checked
  server-side by a new `lib/content/cv.ts` helper (`isCvAvailable`, a non-empty-file stat), so an
  absent CV degrades to nothing instead of a dead link; added the `contact.cv` label/path to
  `content/copy.ts` as the single source of truth for that path. Built the site footer
  `components/chrome/Footer.tsx`, mounted in `app/layout.tsx` below every page's content: the
  owner line with the server-rendered current year and a `Rechtliches` nav with the Impressum and
  Datenschutz links (the pages land in P1-13; the links are already correct). All strings come
  from the content model. Since the footer adds a second navigation landmark, gave both nav
  regions distinct accessible names (`nav.label` "Hauptnavigation", `footer.label`
  "Rechtliches") so assistive tech can tell them apart. Covered by unit tests (contact: numbered eyebrow, lead, the prominent
  mailto CTA, every channel link, CV hidden by default and shown when available, the labelled
  `#kontakt` landmark; footer: owner + current year, both legal links, the `contentinfo`
  landmark; the CV helper: present/empty/missing file).
- **P1-11 — Added the experience/Werdegang section.** Built
  `components/sections/experience/Experience.tsx` and mounted it below the about section in
  `app/page.tsx`. A compact timeline that reads the study and work entries from
  `content/experience.ts` (newest first): each row pairs the period (mono, left column) with
  the role, organisation and short focus line (right), and ongoing entries carry the pulsing
  signal marker. It uses the shared `SectionHeader` eyebrow (`03 / Werdegang`), carries the
  `#werdegang` anchor labelled by a screen-reader heading, and collapses to one column below
  `md`. All strings come from the content model; added `experience.current` (`aktuell`) to
  `content/copy.ts` for the ongoing marker. The exact working-student task wording stays
  general and non-confidential (flagged as an open question in `content/experience.ts`).
  Covered by unit tests (numbered eyebrow, every entry's role/org/period/description, the
  current marker only on ongoing entries, and the labelled `#werdegang` landmark).
- **P1-10 — Added the skills section.** Built `components/sections/skills/Skills.tsx` and
  mounted it below the about section in `app/page.tsx`. A grouped, "uses"-style tech stack:
  each group from `content/skills.ts` (Sprachen & Daten, Praxis, Werkzeuge & Themen, Produkt &
  Prozess) renders as a mono label with its technologies as plain pills - honest, no rating
  bars, no logo soup. Marked up as a description list (group title -> items) so the grouping is
  meaningful to assistive tech, in a two-column grid that collapses to one column below `sm`.
  Uses the shared `SectionHeader` eyebrow (`03 / Skills`) and a screen-reader `h2`; carries the
  `#skills` anchor labelled by its heading. All strings come from the content model. Covered by
  unit tests (the numbered eyebrow, every group rendered as a term with all its items, and the
  labelled section landmark).
- **P1-9 — Added the about section.** Built `components/sections/about/About.tsx` per the
  design handoff and mounted it below the hero in `app/page.tsx` (the projects section, P1-8,
  slots in between once merged). Two-column pattern that collapses to one column below `md`:
  the serif H2 with its italic pine accent sits left, the plain first-person body reads right.
  It uses the shared `SectionHeader` eyebrow (`02 / Über mich`) and carries the `#ueber` anchor
  the nav links to, labelled by its heading. All strings come from the content model; added an
  `about.headline` (`lead` / `accent` / `tail`) to `content/copy.ts` for the H2 and kept the
  existing first-person body (studies + fuelivo, and the sport connection that shapes the
  hands-on way of working). Covered by unit tests (headline as h2, every body paragraph, the
  numbered eyebrow, and the `#ueber` anchor / `aria-labelledby`).
- **P1-8 — Added the projects section.** Built `components/sections/projects/` and mounted
  it below the hero (`app/page.tsx`): the section reads the ordered project data from
  `content/projects.ts` and renders fuelivo as a prominent featured card first, followed by a
  lighter two-column grid of the remaining projects. `FeaturedProject.tsx` tells the short
  story - tagline, then labelled Problem, Rolle and "Was ich gelernt habe" blocks, a stack
  chip row and a primary "Live ansehen" CTA - next to a cover slot. `ProjectCard.tsx` is the
  compact grid card (cover, name with status, tagline) that becomes a hover-highlighted link
  when the project has one. `ProjectStatusBadge.tsx` shows each status as its German label
  plus a colour-coded dot (signal for live, pine for mvp, moss for concept, muted for
  experiment) so status never rides on colour alone. `ProjectMedia.tsx` renders the design's
  diagonal striped placeholder captioned with the slug wherever a real cover is still missing
  (all of them for now, see [projects](docs/content/projects.md)). The section carries the
  `#projekte` anchor the nav links to and a screen-reader `h2`; field labels come from
  `content/copy.ts` (`projects.labels`). Covered by unit tests (fuelivo featured and first,
  problem/role/learnings rendered, every status shown as text, a placeholder per coverless
  project, the live link target, and the labelled section landmark).
- **P1-7 — Added the hero section.** Built `components/sections/hero/Hero.tsx` per the
  design handoff and mounted it as the page (`app/page.tsx`), replacing the placeholder:
  a two-column grid (`1.15fr / 0.85fr`, `min-height:100vh`) that collapses to one column
  below `lg`. Left column reads all copy from the content model - a pine mono kicker with a
  pulsing signal dot, the serif H1 with its italic pine accent word, the sub, a CTA row
  (primary "Projekte ansehen" and a ghost "GitHub" that opens in a new tab; the CV download
  stays withheld until the file exists, P1-12), and a status row (the "Verfügbar für
  Werkstudent" pill plus the static `GER · 14:32 CET · 18°C` meta placeholder that P2-2 makes
  live). Right column is the placeholder hero visual (a `4/5` card with a REC badge and a
  floating "now playing" widget whose four signal bars fake an equalizer) until the real
  video / mini-character (P3-2) and Spotify data (P3-1) land; its German placeholder strings
  live in `content/copy.ts` under `hero.visual`. Every element rises in on a stagger via a
  new `rise-up` keyframe (`animate-rise-up`, paired with `motion-safe:opacity-0` so
  reduced-motion users see the settled hero); a `--hero-reveal-offset` custom property, frozen
  before first paint by a small inline script (`components/sections/hero/reveal.ts` in
  `app/layout.tsx`), delays the rise until the boot end on a first visit and to 0s on a reload
  - frozen as an inline style so the boot overlay removing `data-boot` mid-rise never snaps
  it. Added the decorative `equalize` keyframe for the widget bars. The section carries the
  `#top` anchor the nav wordmark links to. Covered by unit tests (headline/kicker/sub from the
  content model, primary/GitHub CTA targets, CV withheld, availability status, `#top` anchor).
- **P1-6 — Added the content model.** Introduced the German content layer under `content/`,
  the single source of truth the section components read from so no German literals live in
  components: `content/copy.ts` (nav, hero, section titles, about, way-of-working, contact
  and footer strings), `content/projects.ts` (the typed `Project` model, `ProjectStatus`
  German label map, and the project entries with fuelivo featured and first),
  `content/skills.ts` (the grouped `SkillGroup` tech stack) and `content/experience.ts` (the
  typed study/work `ExperienceEntry` list). Migrated `components/chrome/Nav.tsx` to read its
  logo and links from `content/copy.ts`. Provisional taglines, statuses and the fuelivo stack
  are flagged inline pending the open questions in [content docs](docs/content/projects.md).
  Covered by unit tests guarding the projects invariants (one featured entry that is fuelivo
  and first, unique url-safe slugs and orders, a label for every status).
- **Worktree-based branch workflow.** Added `scripts/wt.sh` (exposed as `pnpm wt`) for a
  one-directory-per-branch workflow: `wt new <type>/<slug>` branches off `origin/master`
  into a hidden, grouped worktree (`<parent>/.worktrees/<repo>/`), links the gitignored
  `.env*` and runs `pnpm install` so it is ready to use; `wt ls` annotates worktrees
  merged/unmerged/dirty; `wt gc` deletes only merged worktrees (never dirty ones); `wt rm`
  removes one. The main clone now stays permanently on `master`, so parallel sessions never
  change each other's branch. Documented in
  [git-workflow](docs/engineering/git-workflow.md#worktrees); the task lifecycle,
  `CONTRIBUTING.md` and `CLAUDE.md` reference it.
- **P1-5 — Added the boot overlay chrome.** Built `components/chrome/BootOverlay.tsx`, a
  once-per-session terminal splash per the design handoff: a fullscreen `--term-bg` overlay
  (`z-index:100`) with six mono lines that fade and rise in on the binding stagger
  (`0.10 / 0.45 / 0.80 / 1.15 / 1.5 / 1.85s`) via the new `bootline` keyframe
  (`animate-bootline`, paired with `motion-safe:`); `ok`/`▸` in `--term-green`, the version,
  handle and `ready` highlighted in bright term text. After ~2350ms the overlay fades out
  over 0.7s and unmounts, so the hero reveal can follow the boot end. A pre-paint inline
  guard script (`lib/chrome/boot.ts`, injected in `app/layout.tsx`) sets `data-boot="play"`
  on `<html>` only on a first, motion-allowed visit of the session; the overlay is
  `display:none` until then (globals.css), so a returning or reduced-motion visitor never
  sees a flash. The component records the `sessionStorage['pf_booted']` guard on the play
  path and is `aria-hidden` (a decorative splash). Mounted globally in `app/layout.tsx`.
  Covered by unit tests (play vs. skip paths, guard write, timed fade/unmount, and the guard
  script's first-visit / reload / reduced-motion decisions) and Playwright tests (plays then
  reveals the site; no replay on reload within the session; skipped under reduced motion).
  Narrowed the P1-4 scroll-spine e2e selector to exclude the new aria-hidden overlay sibling.
- **P1-4 — Added the scroll spine chrome.** Built `components/chrome/ScrollSpine.tsx`, the
  site's signature element per the design handoff: a fixed 2px vertical track at
  `left:71px` (`z-index:5`) in the `--line` colour, with a `--pine` fill whose height is the
  scroll progress and an 8px `--signal` node that rides the fill's end with a bg-coloured
  halo ring (`--shadow-node-ring`). It reuses the P1-3 `useScrollProgress` driver, so it is
  synced to the nav percentage by construction. Progress is written once per frame to a
  single `--progress` CSS variable via a ref; the fill `height` and node `top` derive from
  it with `calc()`, keeping the animation off the React render path (no state, no
  transitions). The spine is `aria-hidden` (decorative/informational) and hidden below the
  1100px desktop layout, where its 104px left gutter collapses. Mounted globally in
  `app/layout.tsx`. Covered by unit tests (aria-hidden structure; `--progress` seeded at 0
  and updated/clamped on scroll) and a Playwright test (fixed at `left:71px`, empty at the
  top, fill spans the full track and `--progress` reaches 1 at the bottom, synced to the
  nav 100%).
- **P1-3 — Added the fixed navigation chrome.** Built `components/chrome/Nav.tsx` per the
  design handoff: fixed, with a blurred fade-out gradient (`bg-linear-to-b` + 8px
  `backdrop-filter`) so content scrolls under it cleanly. Terminal-style `yannik.wuenker`
  logo with a blinking signal cursor on the left; the P1 section links (Projekte, Über,
  Kontakt) with a pine→signal hover and a live scroll percentage split off by a line
  divider on the right. Blog stays out of the nav until it exists (optional, P3-7). Added
  `lib/hooks/use-scroll-progress.ts`, an rAF-batched scroll driver that reports progress
  `(0..1)` off the React render path; the nav writes the percentage straight into the
  node's `textContent` via a ref, so scrolling never re-renders React. Smooth-scrolling to
  the anchors and offsetting them below the nav are handled in CSS (`scroll-behavior` /
  `scroll-padding-top`), with a reduced-motion fallback; added the binding `blink` keyframe
  as an `animate-blink` utility (paired with `motion-safe:`) and a `--nav-height` token.
  The nav is mounted globally in `app/layout.tsx`. Covered by unit tests (hook progress and
  clamping; nav logo/links/percentage) and a Playwright test (nav is fixed, links resolve,
  the percentage counts up to 100% at the bottom).
- **P1-2 — Added the `ui/` primitives.** Built the six shared primitives under
  `components/ui/` per the design system: `SectionHeader` (numbered `NN / Title` eyebrow
  plus a flexible divider line), `Button` (primary/secondary/ghost with the pine→signal
  and border→pine hovers; renders an `<a>` when given `href`, else a real `<button>`),
  `Pill` (surface/line status pill with an optional pulsing signal dot), `Card`,
  `MonoLabel` (uppercase, letter-spaced mono micro-text in pine/muted/ink) and `Divider`.
  Added a tiny `lib/utils/cn.ts` class-name joiner (unit-tested), a `--line-strong`
  (`#C6C1B0`) token for the secondary-control border, and the binding `glowPulse` keyframe
  as an `animate-glow-pulse` utility (paired with `motion-safe:` for reduced motion). A
  noindexed `/primitives` reference page renders every primitive and variant. Covered by
  unit tests (`cn`, `SectionHeader` number padding, `Button` element/variant behaviour)
  and a Playwright smoke test that the showcase renders.
- **P1-1 — Wired the root layout metadata and technical SEO.** Added a central
  `lib/seo/site.ts` (canonical base URL from `NEXT_PUBLIC_SITE_URL` with a production
  fallback, plus the shared title/description/locale/OG strings) and expanded
  `app/layout.tsx` with full `metadata` (title template, description, canonical,
  Open Graph, Twitter `summary_large_image`, robots) and a `viewport` `themeColor`
  drawn from `--bg`. Generated `app/sitemap.ts` and `app/robots.ts` (allow-all,
  sitemap reference) at build time, and committed a placeholder 1200x630 Sand & Pine
  OG image at `public/og/default.png` (replaced with the on-brand asset in P1-14).
  `<html lang="de">` and the three fonts were already in place from P0-2. Covered by a
  unit test (sitemap/robots shape) and Playwright tests (rendered head tags; `/robots.txt`
  and `/sitemap.xml` resolve).
- Project documentation set under `docs/` (architecture, design, content, engineering,
  operations, project plan) and Architecture Decision Records.
- Root `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`.
- **P0-1 — Scaffolded the Next.js app** (App Router, TypeScript strict, pnpm): Next
  16.2.9, React 19.2.4, Tailwind CSS 4.3.2. Added `.nvmrc` (20), `engines`, base
  `package.json` scripts (`dev/build/start/lint/typecheck`, plus `test/format`
  placeholders pending P0-3), the folder structure from `project-structure.md` (empty
  section/lib/content folders with path alias `@/*`), and a branding-free placeholder
  page. `pnpm dev`, `pnpm build`, `pnpm lint` and `pnpm typecheck` all pass.
- **P0-2 — Wired the design tokens and fonts** ("Sand & Pine + Serif"). Defined all
  tokens (colours, terminal/dark palette, layout, radius, shadows) as CSS custom
  properties in `app/globals.css` and exposed them to Tailwind via `@theme`, so classes
  speak the design vocabulary (`bg-bg`, `text-ink`, `text-pine`, `font-serif`,
  `rounded-card`, `shadow-widget`). Loaded Instrument Serif, Hanken Grotesk and IBM Plex
  Mono via `next/font` (`font-serif`/`font-sans`/`font-mono`) and set the page
  background, ink and default body font from tokens.
- **P0-3 — Wired the tooling and quality gates.** Prettier (with
  `prettier-plugin-tailwindcss` for canonical class order) owns code and config
  formatting; ESLint gained an explicit `import/order` rule and `eslint-config-prettier`
  on top of the Next presets (which already provide `jsx-a11y`). Added Vitest + Testing
  Library (jsdom) with a home-page smoke test, Playwright smoke tests that boot the app
  themselves, and a husky `pre-commit` hook running lint-staged. New scripts:
  `format`/`format:check`, `test`/`test:watch`/`test:coverage`, `test:e2e`. The four
  gates (`lint`, `typecheck`, `test`, `build`) and both trivial tests pass locally.
- **P0-4 — Containerized the app.** Enabled Next's `standalone` output and added a
  multi-stage `Dockerfile` (Node 22 Alpine: `deps` -> `builder` -> `runner`) that serves
  the standalone server as a non-root user on `:3000`, a `.dockerignore` to keep the build
  context lean, a `docker-compose.yml` (publishes `:3000`, optional `.env`, container
  health check), and a committed `.env.example` documenting `NEXT_PUBLIC_SITE_URL` and the
  optional live-data variables.
- **P0-6 — Added the Contabo VPS provisioning runbook** (`docs/operations/server-setup.md`):
  a step-by-step, copy-pasteable procedure from a fresh box to `https://portfolio.yannikwuenker.de`
  over TLS — deploy user, SSH hardening, ufw firewall, DNS, a loopback-bound container,
  Nginx reverse proxy, certbot TLS with HSTS, and a verification/acceptance checklist.
  During development the site is served on the subdomain `portfolio.yannikwuenker.de`; a
  dedicated go-live section covers the switch to the apex `yannikwuenker.de` (with `www`
  redirect). The (now private) repo is cloned on the server via a read-only GitHub deploy
  key. The app image is built on the server for now; P0-7 swaps this for a registry pull.
- **P0-7 — Added the deploy pipeline.** `.github/workflows/deploy.yml` runs on push to
  `master` and on `vX.Y.Z` tags: it builds the Docker image and pushes it to GHCR
  (`ghcr.io/spockey4711/portfolio2`, tagged by short `sha`, `latest`, and the release
  version), then deploys over SSH by copying the compose files and `scripts/deploy-remote.sh`
  to the VPS and running `docker compose ... pull && up -d` against a new committed
  `docker-compose.prod.yml` (registry image + loopback bind), health-checking the container
  on `127.0.0.1:3000` before success and pruning only dangling layers so prior tags stay
  available for rollback. The Dockerfile builder gained a `NEXT_PUBLIC_SITE_URL` build arg
  (that value is inlined into the client bundle at build time). Server-side one-time prep
  (Actions secrets, a GHCR `docker login`) is documented in `server-setup.md` step 12. The
  deploy job preflights the required secrets and fails fast with an actionable message when
  they are not set, rather than erroring cryptically in the SSH step.
- **P0-5 — Added the CI pipeline.** `.github/workflows/ci.yml` runs on every PR to
  `master` (and on push to `master`): a `quality` job runs the four gates (`lint`,
  `typecheck`, `test`, `build`) and a parallel `e2e` job runs the Playwright smoke suite on
  Chromium. Node is pinned from `.nvmrc` and pnpm from `package.json`; the pnpm store is
  cached and superseded runs are cancelled. A Lighthouse budget check is deferred to the
  performance pass (P1-15).

### Fixed
- **Header links now work from the project detail pages.** The nav is mounted in the root
  layout, so it also renders on `/projekte/<slug>`, where the linked home sections do not
  exist - the bare `#projekte` / `#ueber` / `#kontakt` / `#top` anchors resolved to nothing
  there. The links now target the home route plus a hash (`content/copy.ts` hrefs are
  root-relative `/#...`) and are passed to `next/link` as explicit `{ pathname, hash }`
  objects (`components/chrome/Nav.tsx`): on the home page they still scroll to the section
  client-side, and from a detail page they navigate home and jump to the anchor.
- **"Zurück zu den Projekten" link now navigates home.** The project detail page's back link
  (`components/sections/projects/ProjectDetail.tsx`) passed `next/link` the `/#projekte`
  string; `next/link` collapses a `"/#hash"` string href to a same-page hash, so clicking it
  tried to scroll to a non-existent anchor on the detail page and never returned to the
  onepager. It now passes the same `{ pathname, hash }` object as the nav, so it navigates
  home and jumps to the projects section.

### Changed
- **Projects split into one file per project.** Replaced the single `content/projects.ts`
  with a `content/projects/` directory - the `Project` type and status labels in
  `types.ts`, one file per project (e.g. `fuelivo.ts`), and `index.ts` aggregating them into
  the same ordered `projects`/`detailProjects`/`getDetailProject` API. Import path
  (`@/content/projects`) and behaviour are unchanged; the split just keeps per-project edits
  local and stops the file growing without bound as more projects are added.
- **Now-playing widget stacked onto two lines.** Reshaped the hero's now-playing widget
  (`components/sections/hero/NowPlaying.tsx`) from a single-line pill into a small stacked
  card: the equalizer and `// now playing` label sit on a top line, with the track and artist
  on the line below. Same data, polling and reduced-motion behaviour; layout only.
- **P1-15 — Darkened the `muted` and `signal` tokens for WCAG AA.** As text colours the
  original `muted` (`#74766B`) and `signal` (`#1F8A5B`) missed the 4.5:1 AA threshold at the
  micro/caption sizes and status-label they are spec'd for (`muted` sat at 3.7-4.1:1,
  `signal` at 3.8:1 as the "live" status text). Darkened to `muted #646659` and
  `signal #157A45` in `app/globals.css`, which clear AA everywhere they render as text while
  keeping the palette's look and their interaction/glow role unchanged. Documented the
  deviation from the otherwise-binding design handoff in
  [design-system](docs/design/design-system.md) and the
  [design handoff README](docs/design/handoff/README.md).
- **Renumbered the skills section eyebrow from `03` to `04`.** In the rendered onepager order
  (Projekte, Über, Werdegang, Skills) the experience and skills sections both carried `03 /`;
  skills is the fourth numbered section, so its `SectionHeader` index is now `4`, ahead of the
  new contact section at `05`.
- **Centered the boot overlay.** The once-per-session terminal splash
  (`components/chrome/BootOverlay.tsx`) now centers its content both axes (dropped the
  left-aligning `min-[1100px]:pl-26` for `items-center`), so the boot sequence sits in the
  middle of the viewport instead of hugging the left edge.
- **Slowed the terminal cursor blink** from `1s` to `1.6s` (`--animate-blink` in
  `app/globals.css`) for a calmer cadence on the `yannik.wuenker_` nav wordmark and the
  boot-overlay cursor. Updated the binding keyframe tables in
  [animation-and-motion](docs/design/animation-and-motion.md) and the
  [design handoff README](docs/design/handoff/README.md).
- Raised the Node baseline from 20 to 22 LTS (`.nvmrc`, `engines` `node >=22.13`, the
  Docker base image) because the pinned pnpm 11.9 requires Node `>=22.13` and fails to boot
  on Node 20; Node 20 is also being deprecated on GitHub Actions runners. Updated the
  affected docs (tech stack, local development, deployment, README).
- Documented the canonical task lifecycle (fetch, branch off `master`, small commits,
  quality gate, push, open PR, return to `master`) in `docs/engineering/git-workflow.md`
  and referenced it from `CLAUDE.md`.
- Revised the hosting provider from DigitalOcean to a self-managed **Contabo VPS** (12 GB
  RAM) — same Docker + Nginx + certbot architecture, more RAM per euro. Updated ADR-0002,
  the deployment/tech-stack/roadmap/README docs and the backlog accordingly.
- Aligned the documented trunk branch name with the repo's actual default (`master`
  instead of `main`) across the docs, `CONTRIBUTING.md` and `CLAUDE.md`.
- Moved the design handoff from the root `design_handoff_portfolio/` into
  `docs/design/handoff/` so it sits with the design docs that reference it, and updated
  all links.

### Fixed
- **P1-5 — Silenced the boot-guard hydration warning.** The pre-paint boot guard
  (`BOOT_GUARD_SCRIPT`) sets `data-boot="play"` on `<html>` before React hydrates, so the
  server HTML (no marker) intentionally differs from the client DOM and React logged a
  hydration mismatch on `<html>`. Added `suppressHydrationWarning` to the `<html>` element
  in `app/layout.tsx`, the standard escape hatch for an intentional pre-hydration DOM
  mutation; it scopes to that element's attributes only (one level deep), so real mismatches
  in children still surface.
- **P0-6 — Corrected the server Compose override** in `docs/operations/server-setup.md`.
  Docker Compose concatenates `ports` lists across files, so the base `3000:3000` mapping
  (all interfaces) and the override's `127.0.0.1:3000:3000` both claimed host port 3000 and
  the loopback bind failed with "address already in use". The override now uses the
  `!override` tag (Compose v2.24+) to replace the base `ports` list, so the container is
  published on loopback only.

### Removed
- Deleted the historical discovery material now fully captured in `docs/` (`idee.md`,
  `08-seo-deployment.md`, `info/`, `other/`). The raw notes remain available in git
  history; `docs/` is the living source of truth.

### Notes
- The app skeleton is live, themed, gated, containerized and CI-checked (P0-1 through P0-5
  done). P0-6 (provision the Contabo VPS) is done — the box serves
  `https://portfolio.yannikwuenker.de` over TLS with auto-renewing certificates. P0-7 (deploy
  pipeline) is done — the Actions secrets and the server's one-time GHCR login are in place and
  a push to `master` deploys the placeholder page live at the domain. That completes the P0
  foundation. See `docs/project/roadmap.md`.

---

## How to update this file

- Add entries under `## [Unreleased]` as you work, grouped by:
  `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
- Write for a human reader, in the past tense, one bullet per change.
- On release, rename `[Unreleased]` to the new version with a date
  (`## [0.2.0] - 2026-07-15`) and start a fresh `[Unreleased]` block.
- Tag the release in git (`v0.2.0`) so the changelog and tags stay in sync.

<!-- Link references, filled in as versions are tagged:
[Unreleased]: https://github.com/spockey4711/portfolio/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/spockey4711/portfolio/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/spockey4711/portfolio/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/spockey4711/portfolio/releases/tag/v0.1.0
-->
