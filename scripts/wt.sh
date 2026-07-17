#!/usr/bin/env bash
# wt.sh - manage git worktrees for the one-directory-per-branch workflow.
#
# The master clone stays permanently on `master`; every task runs in its own
# worktree so parallel sessions never change each other's branch. Worktrees live
# outside the repo, grouped and hidden, at:
#   <parent-of-repo>/.worktrees/<repo-name>/<branch-with-slashes-as-dashes>
#
# Feature branches fork from and merge back into `develop` (the integration
# branch), not `master`; `develop` reaches `master` only via the periodic
# release PR. So `new` branches off `origin/develop` and `gc`/`ls` measure
# "merged" against `origin/develop`, while the main clone still parks on
# `master`.
#
# `new --from <branch>` overrides the base so a worktree forks off another
# branch instead of `origin/develop` - e.g. sub-tasks of a long-lived feature
# branch that integrate back into it rather than into `develop`. `gc`/`ls` still
# measure "merged" against `origin/develop`, so such sub-worktrees are removed
# with `rm`, not `gc`.
#
# Usage:
#   scripts/wt.sh new <type>/<slug> [--from <branch>] [--no-install]
#                                                    create a worktree + branch
#   scripts/wt.sh ls                                 list worktrees + status
#   scripts/wt.sh gc                                 remove merged worktrees
#   scripts/wt.sh rm <branch|folder> [--force]       remove one worktree
#
# See docs/engineering/git-workflow.md#worktrees for the full workflow.
set -euo pipefail

# The branch the main clone stays parked on (stable, always deployable).
MAIN_BRANCH="master"
# The integration branch feature worktrees fork from and merge back into.
BASE_BRANCH="develop"
ALLOWED_TYPES="feat fix docs style refactor perf test build ci chore revert"

die() {
  echo "wt: $*" >&2
  exit 1
}

# Absolute path of the main worktree (the master clone), regardless of where this
# script is invoked from. The first entry of the porcelain listing is the main one.
main_worktree() {
  git worktree list --porcelain | awk '/^worktree /{print $2; exit}'
}

# Emit "path<TAB>branch" for every worktree except the main clone. Detached
# worktrees (no branch line) are skipped.
list_secondary() {
  local main
  main="$1"
  git worktree list --porcelain | awk -v main="$main" '
    /^worktree /{ p = $2 }
    /^branch /  { b = $2; sub("refs/heads/", "", b); if (p != main) print p "\t" b }
  '
}

require_repo() {
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 \
    || die "not inside a git repository"
}

cmd_new() {
  [ "$#" -ge 1 ] || die "usage: wt new <type>/<slug> [--from <branch>] [--no-install]"
  local branch="$1"
  shift
  local do_install=1
  local from=""
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --no-install) do_install=0 ;;
      --from)
        [ "$#" -ge 2 ] || die "--from needs a branch name"
        from="$2"
        shift
        ;;
      --from=*) from="${1#--from=}" ;;
      *) die "unknown option: $1" ;;
    esac
    shift
  done

  case "$branch" in
    */*) : ;;
    *) die "branch must be <type>/<slug>, e.g. fix/scroll-jitter" ;;
  esac
  local type="${branch%%/*}"
  echo "$ALLOWED_TYPES" | grep -qw "$type" \
    || die "unknown type '$type' (allowed: $ALLOWED_TYPES)"

  local main folder path
  main="$(main_worktree)"
  folder="${branch//\//-}"
  path="$(dirname "$main")/.worktrees/$(basename "$main")/$folder"
  [ -e "$path" ] && die "worktree folder already exists: $path"

  git -C "$main" fetch origin --quiet
  mkdir -p "$(dirname "$path")"

  # Resolve the base a brand-new branch forks from. Default: origin/develop.
  # With --from, prefer the local branch (it may be ahead of origin), then fall
  # back to origin/<branch>.
  local base_ref
  if [ -n "$from" ]; then
    if git -C "$main" show-ref --verify --quiet "refs/heads/$from"; then
      base_ref="$from"
    elif git -C "$main" show-ref --verify --quiet "refs/remotes/origin/$from"; then
      base_ref="origin/$from"
    else
      die "base branch not found locally or on origin: $from"
    fi
  else
    base_ref="origin/$BASE_BRANCH"
  fi

  if git -C "$main" show-ref --verify --quiet "refs/heads/$branch"; then
    git -C "$main" worktree add "$path" "$branch"
  elif git -C "$main" show-ref --verify --quiet "refs/remotes/origin/$branch"; then
    git -C "$main" worktree add --track -b "$branch" "$path" "origin/$branch"
  else
    git -C "$main" worktree add -b "$branch" "$path" "$base_ref"
  fi

  # Make the worktree immediately usable: link gitignored env files from the
  # master clone (skips anything already present, e.g. the tracked .env.example).
  local f base
  shopt -s nullglob dotglob
  for f in "$main"/.env*; do
    base="$(basename "$f")"
    [ -e "$path/$base" ] && continue
    ln -s "$f" "$path/$base"
    echo "linked $base"
  done
  shopt -u nullglob dotglob

  if [ "$do_install" -eq 1 ]; then
    ( cd "$path" && pnpm install --prefer-offline )
  fi

  echo
  echo "Worktree ready for '$branch' (forked from $base_ref):"
  echo "  cd $path"
  echo "Do all work there. The $(basename "$main") clone stays on $MAIN_BRANCH."
  if [ -n "$from" ]; then
    echo "Sub-task of '$from': merge it back into '$from', then remove with"
    echo "  pnpm wt rm $branch   (gc only reaps branches merged into $BASE_BRANCH)."
  fi
}

cmd_ls() {
  local main
  main="$(main_worktree)"
  git -C "$main" fetch origin --quiet 2>/dev/null || true
  local main_branch
  main_branch="$(git -C "$main" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  printf '%-40s %s\n' "$main" "[$main_branch] (main clone)"
  local path branch state
  while IFS=$'\t' read -r path branch; do
    [ -n "$path" ] || continue
    if [ -n "$(git -C "$path" status --porcelain 2>/dev/null)" ]; then
      state="dirty"
    elif git -C "$main" merge-base --is-ancestor "$branch" "origin/$BASE_BRANCH" 2>/dev/null; then
      state="merged"
    else
      state="unmerged"
    fi
    printf '%-40s %s\n' "$path" "[$branch] $state"
  done < <(list_secondary "$main")
}

cmd_gc() {
  local main
  main="$(main_worktree)"
  git -C "$main" fetch origin --quiet
  local path branch removed=0 kept=0
  while IFS=$'\t' read -r path branch; do
    [ -n "$path" ] || continue
    if [ -n "$(git -C "$path" status --porcelain 2>/dev/null)" ]; then
      printf '  kept     %-24s (uncommitted changes)\n' "$branch"
      kept=$((kept + 1))
      continue
    fi
    if git -C "$main" merge-base --is-ancestor "$branch" "origin/$BASE_BRANCH" 2>/dev/null; then
      git -C "$main" worktree remove "$path"
      git -C "$main" branch -d "$branch" 2>/dev/null || true
      printf '  removed  %-24s (merged)\n' "$branch"
      removed=$((removed + 1))
    else
      printf '  kept     %-24s (unmerged)\n' "$branch"
      kept=$((kept + 1))
    fi
  done < <(list_secondary "$main")
  git -C "$main" worktree prune
  echo "gc: $removed removed, $kept kept"
}

cmd_rm() {
  [ "$#" -ge 1 ] || die "usage: wt rm <branch|folder> [--force]"
  local target="$1"
  local force=""
  [ "${2:-}" = "--force" ] && force="--force"

  local main folder path
  main="$(main_worktree)"
  folder="${target//\//-}"
  path="$(dirname "$main")/.worktrees/$(basename "$main")/$folder"
  [ -d "$path" ] || die "no worktree folder at $path"

  local branch
  branch="$(git -C "$path" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  git -C "$main" worktree remove ${force:+"$force"} "$path"
  if [ -n "$branch" ] && [ "$branch" != "HEAD" ]; then
    git -C "$main" branch -d "$branch" 2>/dev/null \
      || echo "branch $branch not deleted (unmerged); use: git branch -D $branch"
  fi
  git -C "$main" worktree prune
  echo "removed $path"
}

usage() {
  sed -n '21,26p' "$0" | sed 's/^# \{0,1\}//'
}

main() {
  require_repo
  local cmd="${1:-}"
  [ "$#" -ge 1 ] && shift
  case "$cmd" in
    new) cmd_new "$@" ;;
    ls | list) cmd_ls "$@" ;;
    gc) cmd_gc "$@" ;;
    rm | remove) cmd_rm "$@" ;;
    "" | -h | --help | help) usage ;;
    *) die "unknown command '$cmd' (try: new, ls, gc, rm)" ;;
  esac
}

main "$@"
