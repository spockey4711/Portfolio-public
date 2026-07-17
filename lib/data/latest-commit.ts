/**
 * Server-only "latest commit" source for the signals-of-life feed (S3-5).
 *
 * Reads the configured GitHub user's most recent public push from the REST events
 * API and shapes it into the head commit's message, repository and commit URL. The
 * events endpoint is technically public, but this reuses the same read-only
 * `GITHUB_TOKEN` as the contribution heatmap and *requires* it: without a token the
 * source throws `WidgetNotConfiguredError` so a secret-less CI build or preview
 * degrades quietly and makes no external call, exactly like the heatmap - rather
 * than hammering GitHub's strict unauthenticated per-IP rate limit from shared
 * runners and spamming the observability signal. On any other failure - a network
 * error, a non-OK response, or no push in the recent event window - this throws so
 * the caller degrades to a quiet fallback; it never returns a partial or bogus
 * commit.
 *
 * This module must stay server-only. It is consumed by the /api/latest-commit route
 * handler; the client feed calls that same-origin endpoint, never GitHub directly,
 * so no token reaches the browser. See docs/architecture/rendering-and-data.md.
 */

import { WidgetNotConfiguredError } from "@/lib/observability/widget-failure";

const GITHUB_EVENTS_ENDPOINT = "https://api.github.com/users";

// Fixed GitHub user, overridable via GITHUB_USERNAME - the same knob the
// contribution heatmap reads. Not derived from the visitor.
const DEFAULT_USERNAME = "spockey4711";

/** The head commit of the most recent public push. */
export type LatestCommit = {
  /** The commit's first message line, trimmed. */
  message: string;
  /** The `owner/repo` the push landed in. */
  repo: string;
  /** Canonical GitHub URL of the commit. */
  url: string;
  /** When the push happened, ISO 8601 (the event's `created_at`). */
  committedAt: string;
};

/** The shape the /api/latest-commit route returns to the client feed. */
export type LatestCommitResult = ({ available: true } & LatestCommit) | { available: false };

type PushCommit = { sha?: unknown; message?: unknown };

type GithubEvent = {
  type?: unknown;
  created_at?: unknown;
  repo?: { name?: unknown };
  payload?: { commits?: PushCommit[] };
};

/** The head (newest) commit of a push: GitHub lists a push's commits oldest first. */
function headCommit(commits: PushCommit[] | undefined): PushCommit | undefined {
  return Array.isArray(commits) && commits.length > 0 ? commits[commits.length - 1] : undefined;
}

/**
 * Maps a raw PushEvent to a typed commit, or null when any field the feed needs is
 * missing or malformed (so a half-formed event is skipped rather than shown).
 */
function normalizePush(event: GithubEvent): LatestCommit | null {
  const repo = event.repo?.name;
  const createdAt = event.created_at;
  const commit = headCommit(event.payload?.commits);
  const sha = commit?.sha;
  const message = commit?.message;

  if (
    typeof repo !== "string" ||
    typeof createdAt !== "string" ||
    typeof sha !== "string" ||
    typeof message !== "string"
  ) {
    return null;
  }

  const firstLine = message.split("\n", 1)[0]?.trim() ?? "";
  if (firstLine === "") {
    return null;
  }

  return {
    message: firstLine,
    repo,
    url: `https://github.com/${repo}/commit/${sha}`,
    committedAt: createdAt,
  };
}

/**
 * Fetches the configured user's most recent public push commit, or `null` when the
 * recent event window simply holds no push (a normal, quiet empty state - the user
 * pushes to private repos or via PRs - not an outage, so the caller degrades
 * without logging, like an idle now-playing). Throws `WidgetNotConfiguredError` when
 * no token is set (a quiet, expected degradation), and a plain error on a genuine
 * failure (network, a non-OK response or an unexpected payload) so that - and only
 * that - is logged as an upstream failure.
 */
export async function fetchLatestCommit(): Promise<LatestCommit | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new WidgetNotConfiguredError(
      "GITHUB_TOKEN is not set; the latest-commit feed row stays on its fallback",
    );
  }

  const login = process.env.GITHUB_USERNAME?.trim() || DEFAULT_USERNAME;

  const response = await fetch(`${GITHUB_EVENTS_ENDPOINT}/${login}/events/public?per_page=30`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      // GitHub rejects API requests without a User-Agent.
      "User-Agent": "portfolio2-latest-commit",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub events endpoint responded ${response.status}`);
  }

  const events = (await response.json()) as unknown;
  if (!Array.isArray(events)) {
    throw new Error("GitHub events payload is not an array");
  }

  for (const event of events as GithubEvent[]) {
    if (event?.type !== "PushEvent") {
      continue;
    }
    const commit = normalizePush(event);
    if (commit) {
      return commit;
    }
  }

  // No push in the window: a quiet empty state, not a failure to signal.
  return null;
}
