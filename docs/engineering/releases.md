# Releases

**Purpose:** the release cadence for promoting `develop` to `master` (production), how the
release-PR bot keeps that cadence, and the runbook for cutting a release. The branching model
and versioning rules live in [git workflow](git-workflow.md); this is the operational detail
that sits on top of them.

Related: [git workflow](git-workflow.md) · [dependency updates](dependency-updates.md) ·
[deployment](../../private-docs/docs/operations/deployment.md) · [`CHANGELOG.md`](../../CHANGELOG.md) ·
[ADR-0010: changelog via changesets](../../private-docs/docs/architecture/decisions/0010-changelog-via-changesets.md)

## Cadence

A **weekly release train**, aligned with the dependency cadence so the two move together:

- **Monday** - [Dependabot](dependency-updates.md) opens its grouped dependency PRs into
  `develop`; they are reviewed and merged during the week like any other change.
- **Thursday** - the [release-PR bot](#the-release-pr-bot) opens (or refreshes) a single
  `develop -> master` release PR with the week's promoted commits.
- **Thursday/Friday** - the maintainer cuts the release from that PR (see the
  [runbook](#runbook-cutting-a-release)): review the aggregated diff, bump the version, merge,
  tag, roll out and verify production.

Weekly is the default rhythm, not a rule: a week with nothing worth shipping skips the release
(the bot opens no PR when `develop` is not ahead of `master`), and an urgent change can be
released on demand by running the bot manually. The point is that a release is never blocked on
remembering to open the PR by hand.

## The release-PR bot

[`.github/workflows/release.yml`](../../.github/workflows/release.yml) runs weekly on a
schedule (Thursday 06:00 UTC) and on demand via `workflow_dispatch`. Each run:

1. Checks whether `develop` is ahead of `master`. If not, it stops without opening a PR.
2. Otherwise opens - or, if one is already open, refreshes - the single `develop -> master`
   release PR, labelled `release`, with a summary of the commits being promoted and a
   cut-the-release checklist in the body. It is idempotent: repeated runs update the same PR
   rather than creating duplicates.

It **never merges.** Promoting to `master` is a production deploy, so the maintainer always
reviews the aggregated diff and merges by hand.

Run it manually with:

```bash
gh workflow run release.yml
```

### Release-PR CI note

A PR opened by the built-in `GITHUB_TOKEN` does not itself trigger the [CI
workflow](quality-and-testing.md) (GitHub suppresses this to prevent workflow-triggering
loops). Two ways to get the release PR's gate to run:

- **Preferred:** set a fine-scoped `RELEASE_PAT` repository secret (a
  [fine-grained PAT](https://github.com/settings/tokens) with `contents` and `pull-requests`
  write on this repo). The bot uses it in preference to `GITHUB_TOKEN`, so the release PR
  triggers CI automatically.
- **Without a PAT:** re-trigger CI on the open PR with an empty commit
  (`git commit --allow-empty` on `develop`) or a close/reopen. Every commit on `develop`
  already passed CI on its own PR, so this is confirming the merge result, not first-time
  validation.

## Runbook: cutting a release

From the open `develop -> master` release PR:

1. **Review** the aggregated diff as a release - this is the last gate before production,
   which must stay always deployable.
2. **Confirm CI is green** on the PR (see the [CI note](#release-pr-ci-note) if it did not
   run).
3. **Version the release.** On `develop` (via a small PR), run `pnpm changeset version`. It
   applies the SemVer bump chosen in each `.changeset/` fragment
   ([rules](git-workflow.md#versioning--releases): `feat` -> minor, `fix`/`perf` -> patch,
   `BREAKING CHANGE` -> major; pre-launch stays `0.x`), bumps `version` in
   [`package.json`](../../package.json), folds the fragments into
   [`CHANGELOG.md`](../../CHANGELOG.md) under the new version and deletes them. Add the date to
   the new heading if wanted, then commit. See [Changelog format](#changelog-format).
4. **Merge** the release PR into `master` with a merge commit. `master` is protected and not
   auto-deleted; `develop` keeps living. This merge triggers the image build, the tag and the
   release-log PR (steps 5-7); the server rollout in step 6 stays manual.
5. **Tagging is automatic.** On the `master` push, [`tag-release.yml`](../../.github/workflows/tag-release.yml)
   reads `version` from [`package.json`](../../package.json) and, if the matching `vX.Y.Z` tag
   does not yet exist, creates and pushes it - the tag is the human-facing release record.
   (Nothing depends on it mechanically: the release-PR bot measures `master..develop` by commit,
   and the deploy uses its own image tags.)
6. **Roll out and verify.** [`deploy.yml`](../../.github/workflows/deploy.yml) only builds the
   production image and publishes it to GHCR (`prod-sha-<sha>` / `prod-latest`); this public
   repo holds no deploy credentials, so shipping the image to the server is a manual step (see
   the private deployment runbook). SSH to the box and run `deploy-remote.sh` in the production
   compose project with `IMAGE_TAG=prod-sha-<sha>` of the merge commit, then confirm
   https://yannikwuenker.de serves the release. The preview environment updates the same way
   from the `dev-sha-<sha>` image on `develop` pushes.
7. **Merge the release-log PR.** `tag-release.yml` also opens a small PR into `develop` that
   appends the row to the [release log](#release-log) below (a PR, not a direct commit, because
   `develop` is protected). Its note column is generic - refine it if you want the curated
   one-liner - then merge it.

## Changelog format

All notable changes are recorded in [`CHANGELOG.md`](../../CHANGELOG.md). The format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html); while the site is pre-launch it
stays on `0.x`, and the first public production launch is `1.0.0`.

Unreleased changes are **not** written into `CHANGELOG.md` directly. Each change adds a
uniquely-named fragment in `.changeset/` via `pnpm changeset` (so parallel worktrees never
conflict on the changelog), and `pnpm changeset version` folds them into the file at release
time. Write the full prose entry - the "what and why", with doc links - into the fragment body;
Changesets keeps the multi-line text verbatim. It groups a version's entries by bump level
("Minor Changes" / "Patch Changes") rather than Added/Changed/Fixed, and its generated headings
carry no date (add one by hand if wanted). Rationale and trade-offs:
[ADR-0010](../../private-docs/docs/architecture/decisions/0010-changelog-via-changesets.md).

**One-time transition.** The `## [Unreleased]` block that existed when Changesets was adopted
(the S5 sprint) is the last hand-written one. Release it once by renaming `## [Unreleased]` to
`## [x.y.z] - YYYY-MM-DD` by hand - do **not** run `pnpm changeset version` for that release.
Any `.changeset/` fragments already present roll into the following release, which is the first
`pnpm changeset version` run. From then on, `.changeset/` is the only mechanism.

## Release log

The exercised record of `develop -> master` promotions. Tags start at `v0.2.0`; the first
promotion predated tagging.

| Date       | Version  | PR   | Notes                                                              |
| ---------- | -------- | ---- | ----------------------------------------------------------------- |
| 2026-07-17 | v0.4.0 | #10 | Automated release record; 13 commit(s) promoted. |
| 2026-07-09 | v0.3.0   | #143 | Promotes the S5 English i18n routes (S5-1e..h) and EN detail metadata parity (S5-5); last hand-written CHANGELOG release before Changesets. |
| 2026-07-08 | v0.2.0   | #136 | First tagged release; promotes the S3-S6 sprint work (incl. the S6-5 cadence). |
| 2026-07-08 | untagged | #123 | First `develop -> master` release (S2-10); no version tag cut yet. |
