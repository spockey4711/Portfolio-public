# CLAUDE.md

Guidance for AI assistants working in this repo. Keep it short; the detail lives in
[`docs/`](docs/README.md). Start there ([`docs/00-overview.md`](docs/00-overview.md))
before non-trivial work.

## Always

- **Commit after every small fix or task.** One logical change per commit,
  [Conventional Commits](CONTRIBUTING.md#commit-messages--conventional-commits),
  imperative summary. Small commits beat big ones.
- **Two long-lived branches.** Feature work integrates on `develop` (which publishes the dev
  subdomain's preview image; the server rollout is a manual step); `develop` is promoted to
  the always-deployable `master` via a periodic release
  PR. Never merge a feature branch straight into `master`. See
  [`docs/engineering/git-workflow.md#branching-model`](docs/engineering/git-workflow.md#branching-model).
- **One directory per branch (worktrees).** Never commit directly to `develop` or `master`.
  Create each task's branch as its own worktree with `pnpm wt new <type>/<slug>` (e.g. `pnpm
  wt new fix/scroll-jitter`), which branches off `develop`, and do all work inside the printed
  worktree path. The main clone stays on `master` - never `git checkout` a feature branch in
  it, so parallel sessions never collide. Clean up merged worktrees with `pnpm wt gc`. See
  [`docs/engineering/git-workflow.md#worktrees`](docs/engineering/git-workflow.md#worktrees).
- **Follow the task lifecycle.** A request like "do task S5-2" means: fetch, create the
  worktree (off `develop`), set the task's Plane work item to **In Progress**, work in small
  commits, run the quality gate, push, open a PR **into `develop`** (referencing the task),
  **advance the task's Plane work item to Done in that same step** - the moment only the merge
  is left, never wait for the merge - then hand the PR to the user to confirm and merge (the
  main clone never moved). Never self-merge; the PR waits for the user's approval. Tasks live
  in Plane, not in checkboxes - see [`docs/project/plane.md`](private-docs/docs/project/plane.md).
  Full steps: [`docs/engineering/git-workflow.md#task-lifecycle`](docs/engineering/git-workflow.md#task-lifecycle).
- **Fetch before starting work.** Always `git fetch` at the beginning of a session and before creating a new branch to ensure you have the latest state from remote (prevents missing files and stale branches).
- **English** in code, comments, docs, commits. Site copy is **German** (`de-DE`).
- **No emojis, no fancy dashes** anywhere. Regular hyphen `-` only.
- **Docs + a changeset in the same PR** as the code they describe. Record the change with `pnpm changeset` (a fragment in `.changeset/`), never by editing `CHANGELOG.md` directly - see [`docs/engineering/releases.md`](docs/engineering/releases.md#changelog-format). Update only the docs relevant to your change - this does not mean the entire `docs/` directory needs to be analyzed, only the sections affected by your work.

## Before pushing

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Engineering standards

Treat this like production code at a serious software company, not a hobby project. The
bar is professional. It is a single-developer repo run with the discipline of a team.
The concrete rules are codified in the docs below; this is the mindset that sits behind
them.

**How to work**

- Read before you write. Understand the existing code, docs and conventions first, then
  match the surrounding style instead of importing your own.
- Small, reversible steps. One logical change per commit/PR; keep the tree green at every
  step (lint/typecheck/test/build).
- Leave code better than you found it (Boy Scout Rule) - but do not smuggle unrelated
  refactors into a change. Separate concerns into separate commits/PRs.
- Make it work, then make it right, then make it fast - in that order. No premature
  optimization; measure before optimizing.
- Prefer boring, obvious solutions over clever ones. Code is read far more often than it
  is written; optimize for the next reader.

**Design principles (industry standard)**

- SOLID, DRY, KISS, YAGNI. One responsibility per unit; do not abstract until you have
  two or three real cases - avoid speculative generality.
- Composition over inheritance. Prefer pure functions; push side effects to the edges and
  keep the core testable.
- Explicit over implicit: descriptive names, typed boundaries, no hidden global state.
- Encapsulate what changes; keep public surfaces small and stable. Program to interfaces,
  not implementations.

**Correctness & quality**

- Types are the cheapest documentation and the cheapest bug prevention - `strict`
  TypeScript, no `any` escape hatches without a justified comment.
- Tests are part of the change, not a follow-up. Test what has logic or can silently
  break; do not chase coverage on presentational markup. See quality-and-testing.
- Zero warnings in CI. Formatting and lint are settled by tooling, not by opinion or
  review nitpicks.
- Handle errors deliberately: fail loudly in development, degrade gracefully in
  production. No swallowed exceptions, no empty catch blocks.
- Every behavioral change ships with its docs and a changeset (`pnpm changeset`) in the same PR.

**Security & data**

- Never trust input; validate and sanitize at boundaries. Apply an OWASP Top 10 mindset
  even for a portfolio site.
- Never leak secrets into the client bundle or `NEXT_PUBLIC_*`. Least privilege for
  tokens and env vars; rotate immediately on any leak.

**Reviews & collaboration**

- Every change goes through a PR, even solo - self-review the full diff before pushing and
  read it as if someone else wrote it.
- Conventional Commits with a clear "what and why". Commit messages and PR descriptions
  are written for the future maintainer, who is usually you in six months.

**External references worth internalizing**

- Google Engineering Practices (code review + authoring) - https://google.github.io/eng-practices/
- The Twelve-Factor App (config, deploy hygiene) - https://12factor.net/
- Conventional Commits - https://www.conventionalcommits.org/
- Keep a Changelog - https://keepachangelog.com/
- Semantic Versioning - https://semver.org/
- OWASP Top 10 (web security baseline) - https://owasp.org/www-project-top-ten/
- Refactoring / code smells (Martin Fowler) - https://refactoring.com/

The project-specific rules that make "professional" concrete here already live in
[conventions](docs/engineering/conventions.md),
[quality & testing](docs/engineering/quality-and-testing.md) and
[git workflow](docs/engineering/git-workflow.md) - follow them.

## Where things are

- Full process: [`CONTRIBUTING.md`](CONTRIBUTING.md) ·
  [`docs/engineering/git-workflow.md`](docs/engineering/git-workflow.md)
- Code style / TS rules: [`docs/engineering/conventions.md`](docs/engineering/conventions.md)
- Quality bar & tests: [`docs/engineering/quality-and-testing.md`](docs/engineering/quality-and-testing.md)
- What to build next / task status: [Plane](private-docs/docs/project/plane.md) (authoritative tracker);
  each task's scope + acceptance criteria live in [`docs/project/backlog.md`](private-docs/docs/project/backlog.md)
- Stack & structure: [`docs/architecture/`](docs/architecture/)
- Visual truth: [`docs/design/handoff/`](docs/design/handoff/README.md),
  [`docs/design/`](docs/design/design-system.md)

Precedence: ADR > general doc; design handoff is authoritative for visuals; Plane is
authoritative for task status and what to do next (the backlog holds each task's groomed scope).

## Agent skills

Per-repo configuration the installed engineering skills read. Edit the files under
`private-docs/docs/agents/` directly to change these.

### Issue tracker

Issues and tasks live in Plane (project `PORT`), the authoritative tracker; GitHub is
the delivery surface only (PRs into `develop`). See `private-docs/docs/agents/issue-tracker.md`.

### Domain docs

Single-context: `CONTEXT.md` at the root (created lazily) plus ADRs under
`private-docs/docs/architecture/decisions/`. See `private-docs/docs/agents/domain.md`.
