# Quality and testing

**Purpose:** the quality bar and how it is enforced - linting, types, tests, performance
and the definition of done.

Related: [conventions](conventions.md) · [git workflow](git-workflow.md) ·
[accessibility](../design/accessibility.md) · [rendering & data](../architecture/rendering-and-data.md)

## Gates (must be green to merge)

Run locally before pushing; CI runs the same on every PR:

```bash
pnpm lint         # ESLint (incl. jsx-a11y) - zero warnings
pnpm typecheck    # tsc --noEmit - zero errors
pnpm test         # Vitest unit tests
pnpm build        # production build must succeed
```

CI additionally runs a Lighthouse budget check on a production build (see budgets below) and
the Playwright smoke tests.

## Testing strategy

Test what has logic or can silently break; do not chase coverage on presentational
markup.

- **Unit (Vitest + Testing Library):**
  - `lib/` logic: scroll-progress math (clamping at 0 and 1), SEO/metadata builders,
    live-data adapters (shape + fallback behavior), any project-data transforms.
  - Live-widget adapters degrade deliberately: cover the defensive normalization paths
    (a malformed or missing upstream field coerced to a safe default, an unusable entry
    dropped, an auth/token step failing) so a broken coercion is caught, not shipped as a
    NaN or blank cell.
  - Key component behavior: reduced-motion branches, terminal
    command parsing (Phase 2), and the interactive surfaces' input logic - terminal history
    recall (ArrowUp/Down) and the command palette's roving keyboard highlight, focus trap
    and backdrop dismiss.

Each of these tests is written so a deliberate break in the logic it guards fails it -
coverage is a by-product of testing behavior, not the goal.
- **E2E smoke (Playwright), a few only:**
  - Home page renders, hero visible, nav links jump to sections.
  - Legal pages reachable.
  - A live widget renders its fallback when its API route returns "unavailable".
- **No snapshot tests of large DOM** - they rot and prove little.

Target: meaningful coverage of `lib/` and critical widgets, not a global percentage.

## Performance budget

The production build must meet, on a mid-tier laptop / throttled mobile:

- Lighthouse (prod build): **Performance, Accessibility, Best Practices, SEO all ≥ 95.**
- **No layout shift** from live widgets (CLS ≈ 0) - they reserve space and fall back.
- LCP fast: hero is static HTML + `next/font` (no FOIT/FOUT jank), images sized and
  optimized.
- JS kept lean: client islands only where needed; the scroll spine runs off the React
  render path (see [animation & motion](../design/animation-and-motion.md)).

## Accessibility gate

- `eslint-plugin-jsx-a11y` on; Lighthouse a11y ≥ 95.
- **Automated axe scan (S6-3)** - `tests/e2e/axe.spec.ts` runs `@axe-core/playwright`
  over every key route and fails the PR on any WCAG 2.0/2.1 A or AA violation, with the
  offending rule and node named (the rule-level complement to Lighthouse's single a11y
  score). Runs in the `e2e` job via `pnpm test:e2e`.
- Manual pass before each release: keyboard tab-through, focus visibility, reduced-motion
  toggle, contrast check on any new colors. Full list in
  [accessibility](../design/accessibility.md).

## Definition of done

A task is done when:

1. It works and matches the design/motion/a11y specs.
2. `lint`, `typecheck`, `test`, `build` are green; performance and a11y budgets hold.
3. Docs are updated and `CHANGELOG.md` has an entry.
4. It is merged to `master` via a reviewed PR and is deployable (or deployed).

## Tooling

Wired in P0-3 (config lives at the repo root):

- **ESLint** - `eslint.config.mjs`: the Next presets (`core-web-vitals` +
  `typescript`, which include `jsx-a11y`), an explicit `import/order` rule, and
  `eslint-config-prettier` last so ESLint does not fight the formatter. Run: `pnpm lint`.
- **Prettier** - `prettier.config.mjs` with `prettier-plugin-tailwindcss` for canonical
  class order. Owns code and config formatting; long-form docs and the generated design
  handoff are ignored (`.prettierignore`). Run: `pnpm format` / `pnpm format:check`.
- **Vitest + Testing Library** - `vitest.config.ts` (jsdom, `@/*` alias, `vitest.setup.ts`
  for jest-dom matchers). Unit specs in `tests/unit`. Run: `pnpm test` (or `test:watch`,
  `test:coverage`).
- **Playwright** - `playwright.config.ts` boots the app via its `webServer` block. Two
  projects share one Chromium config: `chromium` (`tests/e2e`) carries the functional
  smoke suite plus the axe scan against the dev server (`pnpm test:e2e`); `visual`
  (`tests/visual`) carries the pixel snapshots against a production build (`pnpm
  test:visual`, sets `PW_PROD`). `PW_PORT` overrides the port so a run does not reuse a
  dev server from another worktree.
- **lint-staged + husky** - a `pre-commit` hook formats and lints only the staged files.
  Husky no-ops outside a git repo, so container and CI installs are unaffected.
- **CI** - `.github/workflows/ci.yml` runs on every PR to `develop` or `master` (and on push
  to either): a `quality` job runs the four gates (`lint`, `typecheck`, `test`, `build`), a
  parallel `e2e` job runs the Playwright smoke suite plus the axe scan (Chromium), a
  `lighthouse` job runs the budget check, and a `visual` job runs the snapshots in the
  pinned Playwright container. All must be green to merge.
- **Lighthouse budgets** - `@lhci/cli` with `lighthouserc.json` at the repo root. `pnpm
  lighthouse` (`lhci autorun`) builds the app, starts the production server (`pnpm start`),
  runs Lighthouse three times against the home page and asserts the budgets below
  (Performance/Accessibility/Best-Practices/SEO `>= 0.95`, `cumulative-layout-shift <=
  0.1`). Chrome is pre-installed on the CI runner. Note: fade-in animations (the hero
  rise-up) can make axe sample a colour mid-transition, so the a11y score
  may read a point or two below 100 even though every colour clears AA at rest - the `0.95`
  floor accounts for this.
- **Visual regression (S6-3)** - `tests/visual/visual.spec.ts` takes full-page
  `toHaveScreenshot` snapshots of the key templates (home, projects index + a detail, blog
  index, the legal pages) against a production build. Reduced motion is emulated and the
  home page's live-data widgets (the hero live-status card and the "signs of life" regions)
  are masked, so the shots are deterministic. The CI `visual` job runs inside the pinned
  `mcr.microsoft.com/playwright` image; baselines under
  `tests/visual/visual.spec.ts-snapshots/` are Linux-rendered in that same image, so parity
  is exact. **Regenerating baselines:** run the **Update visual snapshots** workflow
  (`gh workflow run update-visual-snapshots.yml --ref <branch>`) after an intended visual
  change - it re-shoots in the container and commits the PNGs back. Do not update baselines
  from macOS; those pixels will not match CI. **Upgrading Playwright:** the
  `mcr.microsoft.com/playwright` tag in both workflows must be bumped in the same PR as
  `@playwright/test` - the image ships only the browser build its own release expects, so a
  mismatched tag fails every visual test with "Executable doesn't exist". The new image
  re-renders the pages, so regenerate the baselines afterwards. **First-time bootstrap:**
  when no baselines exist yet, the `visual` job generates them and fails, uploading them as
  the `visual-baselines` artifact; download it, commit the PNGs under
  `tests/visual/visual.spec.ts-snapshots/`, and the job verifies green on the next run.
