/**
 * Server-only WakaTime coding-stats source for the coding-activity widget (S3-2).
 *
 * Fetches the last-7-days project breakdown (time coded per project) for the
 * account behind a WakaTime API key. WakaTime exposes stats only through its
 * authenticated REST API, so this needs a `WAKATIME_API_KEY`; the key authenticates
 * as its own account, so the request targets `users/current` and no username is
 * needed. Without a key - in CI, previews, or any deploy that has not set one -
 * `fetchWakatimeStats` throws `WidgetNotConfiguredError` and the widget degrades to
 * its static fallback. See docs/architecture/rendering-and-data.md.
 *
 * This module must stay server-only. It reads the key from server env and is
 * consumed only by the /api/wakatime route handler; the client widget calls that
 * same-origin endpoint, never WakaTime directly, so no secret reaches the browser.
 */

import { WidgetNotConfiguredError } from "@/lib/observability/widget-failure";

// The rolling 7-day stats endpoint is available on free accounts and is all the
// widget needs; `users/current` resolves to the key's own account.
const WAKATIME_STATS_ENDPOINT = "https://wakatime.com/api/v1/users/current/stats/last_7_days";

// The breakdown shows only the leading projects so the widget stays compact and
// reserves a fixed height; the rest fold into the account total shown as the caption.
const TOP_PROJECTS = 5;

/** One project in the coding breakdown: a share of the last-7-days coding time. */
export type WakatimeProject = {
  name: string;
  // Share of total coding time, 0-100. Drives the bar width.
  percent: number;
  // Human-readable duration for this project, e.g. "4 hrs 5 mins".
  text: string;
};

/** The successful stats payload: a total and the leading projects, share first. */
export type WakatimeStats = {
  // Human-readable total coding time over the range, e.g. "10 hrs 2 mins".
  humanReadableTotal: string;
  projects: WakatimeProject[];
};

/** The shape the /api/wakatime route returns to the client widget. */
export type WakatimeResult = ({ available: true } & WakatimeStats) | { available: false };

type RawProject = {
  name?: unknown;
  percent?: unknown;
  text?: unknown;
};

type WakatimeResponse = {
  data?: {
    human_readable_total?: unknown;
    projects?: RawProject[];
  };
};

/**
 * Narrows one raw project entry, or null when it lacks a usable name. A missing or
 * non-finite percent degrades to 0 (an empty bar) rather than failing the whole
 * payload; a missing text degrades to an empty string.
 */
function normalizeProject(raw: RawProject): WakatimeProject | null {
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (name === "") {
    return null;
  }
  const percent =
    typeof raw.percent === "number" && Number.isFinite(raw.percent)
      ? Math.max(0, Math.min(100, raw.percent))
      : 0;
  const text = typeof raw.text === "string" ? raw.text : "";
  return { name, percent, text };
}

/**
 * Fetches the last-7-days coding stats for the account behind the API key. Throws
 * when the key is missing, on a network error, a non-OK response or an unexpected
 * payload, so the caller can decide how to degrade; it never returns partial or
 * bogus stats. Basic auth carries the base64-encoded key, per WakaTime's API.
 */
export async function fetchWakatimeStats(): Promise<WakatimeStats> {
  const apiKey = process.env.WAKATIME_API_KEY;
  if (!apiKey) {
    throw new WidgetNotConfiguredError(
      "WAKATIME_API_KEY is not set; the coding stats need API auth",
    );
  }

  const authorization = `Basic ${Buffer.from(apiKey).toString("base64")}`;

  const response = await fetch(WAKATIME_STATS_ENDPOINT, {
    headers: {
      Authorization: authorization,
      // WakaTime rejects API requests without a User-Agent.
      "User-Agent": "portfolio2-wakatime",
    },
  });

  if (!response.ok) {
    throw new Error(`WakaTime stats responded ${response.status}`);
  }

  const payload = (await response.json()) as WakatimeResponse;
  const humanReadableTotal = payload.data?.human_readable_total;
  const rawProjects = payload.data?.projects;
  if (typeof humanReadableTotal !== "string" || !Array.isArray(rawProjects)) {
    throw new Error("WakaTime payload is missing the coding stats");
  }

  const projects = rawProjects
    .map(normalizeProject)
    .filter((project): project is WakatimeProject => project !== null)
    .slice(0, TOP_PROJECTS);

  return { humanReadableTotal, projects };
}
