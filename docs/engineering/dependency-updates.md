# Dependency updates

**Purpose:** how automated dependency updates work in this repo and how to handle the PRs
they raise. Configured for [Dependabot](https://docs.github.com/code-security/dependabot) in
[`.github/dependabot.yml`](../../.github/dependabot.yml).

Related: [git workflow](git-workflow.md) · [releases](releases.md) ·
[quality & testing](quality-and-testing.md) · [deployment](../../private-docs/docs/operations/deployment.md)

## Why Dependabot

Dependabot is native to GitHub, so it needs no external app install and ties into GitHub's
security advisories out of the box. For a single-package portfolio its grouped PRs are
enough; Renovate's extra power (lockfile maintenance, per-package rules) would be more
machinery than the repo needs. See the [S2-10 backlog task](../../private-docs/docs/project/backlog.md).

## What is watched

Two ecosystems, both scanned weekly (Monday 06:00 Europe/Berlin):

- **`npm`** - the application dependencies, read from the `pnpm` lockfile. Minor and patch
  bumps are collapsed into a single grouped PR (`minor-and-patch`) to keep review overhead
  low; a **major** bump opens its own PR so a potential breaking change is reviewed alone.
- **`github-actions`** - the actions pinned in the CI and deploy workflows
  (`.github/workflows/`). Grouped into one PR and committed with the `ci` type, since they
  touch the pipeline rather than the app.

## The flow

Every Dependabot PR targets **`develop`**, the integration branch - never `master`, which
only moves via the periodic release PR (see
[Releases](git-workflow.md#releases-promoting-develop-to-master)). This means a dependency
bump rides the same path as any feature: it lands on `develop`, ships with the next preview
rollout, and is later promoted to `master` in the next release PR.

Each PR runs the full [CI gate](quality-and-testing.md) (lint, typecheck, unit tests, build,
Playwright smoke, Lighthouse budgets) before it can merge, so a bump that breaks the build or
a budget is caught automatically.

## Reviewing a dependency PR

1. Wait for CI to go green. A red gate means the bump is not safe to take as-is.
2. Skim the changelog / release notes Dependabot links in the PR body, especially for majors.
3. Merge into `develop` like any other PR (never self-merge without reading the diff). For a
   grouped minor/patch PR that is green, the review is usually just confirming CI passed.
4. If a bump must be skipped **once**, comment `@dependabot ignore this major version` (or
   minor/patch) on the PR rather than closing it silently, so it is not re-proposed every
   week. If it must be skipped **until upstream moves**, add an `ignore` entry to
   [`.github/dependabot.yml`](../../.github/dependabot.yml) instead - see below.

Dependabot rebases open PRs automatically when `develop` moves, so they stay mergeable.

## Parked majors

A comment-based ignore lives invisibly in Dependabot's own state, which is fine for a
one-off but wrong for a block that will last months: six months on, nothing in the repo
explains why a dependency sits a major behind. Long-lived blocks therefore go into the
`ignore` list in `.github/dependabot.yml`, next to a comment saying **what** blocks the bump
and **what to watch for** before removing the entry again.

Two majors are parked today, both for the same root cause - the lint stack that
`eslint-config-next` pulls in transitively:

| Bump | Blocker |
| --- | --- |
| `eslint` 9 -> 10 | ESLint 10 removed `context.getFilename()`, which `eslint-plugin-react` still calls, so `pnpm lint` crashes before it lints a file. The latest releases of `eslint-plugin-react`, `eslint-plugin-jsx-a11y` and `eslint-plugin-import` all still cap at `eslint ^9`. |
| `typescript` 6 -> 7 | `typescript-eslint` refuses TS 7 outright (`does not support TS 7.0`) and peers `typescript <6.1.0` up to and including its latest release. `tsc --noEmit` already passes on TS 7, so the app code is ready and only the lint step blocks. |

Neither is fixable here: all three plugins arrive through `eslint-config-next`, which is
already on its latest version. Recheck when a new `eslint-config-next` widens those peer
ranges, then drop the matching `ignore` entry and let the major PR open again.
