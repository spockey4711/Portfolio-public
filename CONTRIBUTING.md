# Contributing

This is a personal project, but it is run like a real one so it stays maintainable for
years. This file is the short version; the full detail lives in
[`docs/engineering/git-workflow.md`](docs/engineering/git-workflow.md).

## Ground rules

- **Language:** code, comments, docs, commits and PRs are in **English**. The site's
  user-facing copy is **German** (`de-DE`).
- **Style:** plain and direct. No emojis anywhere in the repo. Use the regular hyphen
  `-` only (no fancy dashes as a stylistic device).
- **Small steps:** small commits and small PRs beat big ones. One logical change per
  commit.

## Workflow

The branching model has two long-lived branches: feature work integrates on `develop` (which
deploys to the dev subdomain), and `develop` is promoted to the always-deployable `master` via
a periodic release PR. Tasks are tracked in Plane (project `PORT`), the authoritative tracker -
move a task's work item to In Progress when you start and to Done when its PR is open. Full
detail: [git workflow](docs/engineering/git-workflow.md#branching-model) and
[task tracking (Plane)](private-docs/docs/project/plane.md).

1. **Branch** off `develop` into its own worktree: `pnpm wt new <type>/<slug>`. Never commit
   directly to `develop` or `master`; the main clone stays on `master` and each feature branch
   gets its own directory (see [Worktrees](docs/engineering/git-workflow.md#worktrees)).
   - `feat/hero-section`, `fix/scroll-spine-jitter`, `docs/deployment`, `chore/deps`.
2. **Build the change.** Keep it focused on one thing.
3. **Keep quality green** before pushing:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
4. **Update the docs** in the same PR as the code they describe, and **add a changeset**
   (`pnpm changeset`) - a fragment in `.changeset/`, not an edit to `CHANGELOG.md` (see
   [releases](docs/engineering/releases.md#changelog-format)).
5. **Open a PR into `develop`** and fill in the checklist below.
6. **Merge** with a merge commit once CI is green (preserves full branch history). The merged
   feature branch is auto-deleted; run `pnpm wt gc` to remove its worktree.
7. **Release** by opening a `develop` -> `master` PR every few days once `develop` is worth
   shipping (see [Releases](docs/engineering/git-workflow.md#releases-promoting-develop-to-master)).

## Commit messages — Conventional Commits

```
<type>(<optional scope>): <short summary in the imperative>

<optional body: what and why, not how>

<optional footer: BREAKING CHANGE:, Refs: #123>
```

Allowed `type`s: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
`ci`, `chore`, `revert`.

Examples:

```
feat(hero): add boot sequence overlay with session guard
fix(spine): use rAF instead of layout read on every scroll event
docs(deployment): document Nginx TLS renewal via certbot
chore(deps): bump next to 15.1.2
```

## Pull request checklist

- [ ] Scope is one logical change; title follows Conventional Commits.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` all pass locally.
- [ ] Docs updated and a changeset added (`pnpm changeset`, a `.changeset/` fragment).
- [ ] No emojis, no fancy dashes, English in code/docs.
- [ ] Respects the design tokens and the motion/accessibility rules.
- [ ] Backlog task ID referenced (e.g. `Refs: P1-3`) if applicable.

## Definition of done

A task is done when it is built, tested, documented, deployed (or deployable) and the
changelog reflects it. See
[`docs/engineering/quality-and-testing.md`](docs/engineering/quality-and-testing.md)
for the quality bar.
