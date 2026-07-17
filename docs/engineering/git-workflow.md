# Git workflow

**Purpose:** the full branching, commit, PR and release process. The short version is in
[`../../CONTRIBUTING.md`](../../CONTRIBUTING.md); this is the reference.

Related: [quality & testing](quality-and-testing.md) ·
[dependency updates](dependency-updates.md) ·
[deployment](../operations/deployment.md) · [changelog](../../CHANGELOG.md)

## Task lifecycle

The canonical end-to-end flow for picking up a task. Feature work integrates on `develop`;
the main clone stays on `master`, so its working tree is always clean and ready for the next
task. Sections below are the reference detail for each step.

Trigger: a request like "do task S5-2". Tasks are tracked in Plane, not in checkboxes - see
[task tracking (Plane)](../project/plane.md).

1. **Create the task's worktree.** `pnpm wt new <type>/<short-slug>` (e.g.
   `pnpm wt new feat/hero-section`). This branches off `origin/develop` into its own
   directory and prints the path; do all the work there. The main clone stays on `master` -
   never `git checkout` a feature branch in it. See [Worktrees](#worktrees).
2. **Set the Plane work item to In Progress.** Find the task's item (by its `S<n>-<m>` id in
   the title) and move it to In Progress. See [task tracking (Plane)](../project/plane.md).
3. **Do the work in small commits.** One logical change per commit, Conventional Commits,
   each commit building green. See [Commits](#commits--conventional-commits).
4. **Keep docs and changelog in sync** in the same branch - update the affected docs and
   add a changeset with `pnpm changeset` (a uniquely-named fragment in `.changeset/`, not an
   edit to the shared `CHANGELOG.md`). See [Releases](#releases-promoting-develop-to-master).
5. **Run the quality gate** before pushing: `pnpm lint && pnpm typecheck && pnpm test &&
   pnpm build`.
6. **Push** the branch to `origin`.
7. **Open a PR into `develop`** describing what changed and why, referencing the task by its
   sprint id (`Refs: S5-2`). See [Pull requests](#pull-requests). Never self-merge.
8. **Advance the Plane work item to Done.** The moment the PR is open and only the merge is
   left, set the item to Done. Do not wait for the merge - a ready PR must already read Done,
   never In Progress. Leave it In Progress only if a real follow-up beyond the merge is still
   outstanding. See [task tracking (Plane)](../project/plane.md).
9. **Hand the PR to the user**, who reviews and merges into `develop`. Merging deploys the
   updated `develop` to the dev subdomain (see [deployment](../operations/deployment.md)). The
   main clone never moved, so there is nothing to switch back. Once the PR is merged,
   `pnpm wt gc` removes the now-merged worktree and its branch.

Promoting the accumulated work from `develop` to `master` is a separate, periodic step - see
[Releases](#releases-promoting-develop-to-master).

## Branching model

Two long-lived branches with short-lived feature branches integrating on `develop`:

- **`master`** is the stable release branch, always deployable. It is protected: no direct
  pushes, PRs only, CI must pass. It moves only via the periodic release PR from `develop`
  (see [Releases](#releases-promoting-develop-to-master)), never by merging feature branches
  directly. Pre-MVP it is not auto-deployed; release tags cut on `master` become the
  production deploy path at go-live (see [deployment](../operations/deployment.md)).
- **`develop`** is the integration branch. Feature branches merge here first, and every merge
  deploys to the dev subdomain (`portfolio.yannikwuenker.de`) so a change can be tested across
  devices and browsers before it is promoted. It is protected too: PRs only, CI must pass.
  Because it is protected, GitHub's "automatically delete head branches" setting leaves it
  alone while still cleaning up merged feature branches (see [Pull requests](#pull-requests)).
- **Feature branches** off `develop`, named `<type>/<short-slug>`:
  - `feat/hero-section`, `fix/scroll-spine-jitter`, `docs/deployment`, `chore/deps`,
    `refactor/section-header`, `perf/spine-raf`.
- Keep branches small and short-lived; rebase on `develop` if they fall behind. Delete after
  merge.
- **One directory per branch.** The main clone stays permanently on `master`; every feature
  branch lives in its own worktree branched off `develop`. Never `git checkout` a feature
  branch in the main clone. See [Worktrees](#worktrees).

## Worktrees

Every task runs in its own [git worktree](https://git-scm.com/docs/git-worktree) so that
several sessions (e.g. two parallel Claude chats) can work at once without one changing the
branch under another. The invariant is simple and exception-free:

> The main `Portfolio2/` clone stays on `master`. Each feature branch gets its own directory,
> branched off `develop`.

Worktrees live outside the repo, grouped and hidden, at
`<parent-of-repo>/.worktrees/<repo-name>/<branch-with-slashes-as-dashes>` (e.g.
`~/PragrammierProjekte/.worktrees/Portfolio2/fix-scroll-jitter`), so they never clutter the
project list. Manage them with `scripts/wt.sh`, exposed as `pnpm wt`:

- **`pnpm wt new <type>/<slug>`** - branch off `origin/develop` into a new worktree, link the
  gitignored `.env*` files from the main clone, and run `pnpm install` so it is immediately
  usable (`--no-install` to skip). Prints the path to `cd` into.
- **`pnpm wt ls`** - list all worktrees, each annotated `merged` / `unmerged` / `dirty`
  (measured against `origin/develop`).
- **`pnpm wt gc`** - remove every worktree whose branch is already merged into
  `origin/develop` (deletes the folder and the branch). Worktrees with uncommitted changes or
  unmerged commits are kept and reported. Run it after your PRs merge.
- **`pnpm wt rm <branch|folder>`** - remove one worktree explicitly (`--force` for a dirty one).

**Parallel work example.** Chat A: `pnpm wt new fix/a`, work in the printed directory.
Chat B: `pnpm wt new chore/b`, work in its own directory. Neither touches the other's branch
and the main clone never leaves `master`, so nothing collides. After both PRs merge,
`pnpm wt gc` cleans up both folders.

**No archiving.** A worktree folder is a disposable checkout - once commits are pushed and
merged, the code lives permanently in git history. "Can I delete this folder?" has a
deterministic answer: if `pnpm wt gc` removes it, yes; if it keeps it, you still have
unmerged or uncommitted work there.

## Commits — Conventional Commits

```
<type>(<optional scope>): <imperative summary, lower case, no trailing period>

<optional body: what and why>

<optional footer: BREAKING CHANGE: ... / Refs: P1-3 / Closes #12>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
`chore`, `revert`. Common scopes: `hero`, `projects`, `spine`, `boot`, `terminal`,
`nav`, `seo`, `deploy`, `deps`.

Rules:
- One logical change per commit; it should build.
- Reference the backlog task in the footer where relevant (`Refs: P1-3`).
- `BREAKING CHANGE:` in the footer bumps the major on release.

Examples:
```
feat(spine): drive scroll fill via CSS var in a rAF loop
fix(boot): respect prefers-reduced-motion and skip the fade
docs(adr): add ADR-0002 for DigitalOcean hosting
chore(deps): bump framer-motion to latest
```

## Pull requests

- Feature PRs target **`develop`**; the release PR targets **`master`** (see
  [Releases](#releases-promoting-develop-to-master)).
- Title follows Conventional Commits (the merge commit uses it as the merge message).
- Description: what changed and why, screenshots/screen-recording for visual changes,
  and the backlog task id.
- The PR checklist (from [CONTRIBUTING](../../CONTRIBUTING.md)) must be satisfied:
  lint/typecheck/test/build green, docs + changelog updated, no emojis/fancy dashes,
  design tokens and a11y respected.
- **Merge commit** - preserves full branch history and all commits.
- The repo has "automatically delete head branches" enabled, so a merged feature branch is
  removed automatically. Both `develop` and `master` are protected, and GitHub never
  auto-deletes a protected branch, so the long-lived branches survive the release PR. Locally,
  `pnpm wt gc` removes the matching worktree once its branch merged into `origin/develop`.

## Releases: promoting develop to master

`develop` accumulates merged feature work and continuously deploys to the dev subdomain. It is
promoted to `master` on a **weekly release train** (the full cadence and runbook live in
[releases](releases.md)); a week with nothing worth shipping simply skips the release. To
promote:

1. Open a PR from `develop` into `master` (`develop` -> `master`). The
   [release-PR bot](releases.md#the-release-pr-bot) does this automatically each week, or run
   it on demand with `gh workflow run release.yml`. CI runs the full gate again on the merge
   result.
2. Review the aggregated diff as a release: this is the last gate before `master`, which must
   stay always deployable.
3. **Merge commit** into `master`. `master` is protected and is not auto-deleted; `develop`
   keeps living and immediately continues to collect the next round of work.
4. Cut a version tag when the release warrants one (see
   [Versioning & releases](#versioning--releases)).

Follow the [release runbook](releases.md#runbook-cutting-a-release) for the full step-by-step,
and record each promotion in its [release log](releases.md#release-log).

Never merge a feature branch straight into `master` - it only ever receives `develop` via a
release PR. If `master` ever moves independently (e.g. a hotfix), merge `master` back into
`develop` afterwards so the two branches do not diverge.

## Keeping docs and changelog in sync

- Code and the docs describing it change in the **same PR**.
- Record anything user- or developer-visible as a changeset (`pnpm changeset`) - a
  uniquely-named fragment in `.changeset/`, so parallel branches never conflict on
  `CHANGELOG.md`. The release folds fragments into the changelog. See
  [ADR-0010](../architecture/decisions/0010-changelog-via-changesets.md) and
  [releases](releases.md#changelog-format).
- Significant technical decisions get an [ADR](../architecture/decisions/README.md).

## Versioning & releases

- [Semantic Versioning](https://semver.org/). Pre-launch stays on `0.x`; first public
  production launch is `1.0.0`.
- To release:
  1. Run `pnpm changeset version` to bump `package.json` and fold the `.changeset/` fragments
     into `CHANGELOG.md` (replaces the old manual `[Unreleased]` move). See the
     [runbook](releases.md#runbook-cutting-a-release).
  2. Tag: `git tag -a vX.Y.Z -m "vX.Y.Z"` and push tags.
  3. The deploy workflow ships the tagged build (see
     [deployment](../operations/deployment.md)).
- Bump rules (the level chosen in each changeset): `feat` → minor, `fix`/`perf` → patch,
  `BREAKING CHANGE` → major.

## Hygiene

- `.gitignore` excludes `node_modules`, `.next`, `.env*` (except `.env.example`), build
  artifacts, OS cruft.
- Never commit secrets. If one leaks, rotate it and scrub - see
  [environment variables](../operations/environment-variables.md).
- No large binaries in git without reason; optimize images before committing.
- Dependency bumps are automated: [Dependabot](dependency-updates.md) opens weekly PRs into
  `develop`, gated by CI like any other change.
