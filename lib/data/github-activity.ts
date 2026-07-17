/**
 * Server-only GitHub activity source for the contribution heatmap widget (P2-3).
 *
 * Fetches the public contribution calendar (per-day counts for the last year) for a
 * fixed GitHub user. GitHub exposes that calendar only through its authenticated
 * GraphQL API, so this needs a `GITHUB_TOKEN`; a read-only token with no scopes is
 * enough for public contribution data. Without a token - in CI, previews, or any
 * deploy that has not set one - `fetchContributionCalendar` throws and the widget
 * degrades to its static fallback. See docs/architecture/rendering-and-data.md.
 *
 * This module must stay server-only. It reads the token from server env and is
 * consumed only by the /api/github-activity route handler; the client widget calls
 * that same-origin endpoint, never GitHub directly, so no secret reaches the browser.
 */

import { WidgetNotConfiguredError } from "@/lib/observability/widget-failure";

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

// Fixed GitHub user, overridable via GITHUB_USERNAME. Not derived from the visitor.
const DEFAULT_USERNAME = "spockey4711";

// The calendar is the last year of activity; asking only for what the heatmap needs
// keeps the payload small.
const CONTRIBUTIONS_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

// GitHub's five contribution-intensity buckets, mapped onto a 0-4 scale so the widget
// can colour cells with the site's own tokens instead of GitHub's greens.
const LEVEL_BY_ENUM: Record<string, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

/** Contribution-intensity bucket, 0 (none) to 4 (most). */
export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

/** One day in the contribution calendar. `date` is an ISO `YYYY-MM-DD` string. */
export type ContributionDay = {
  date: string;
  count: number;
  level: ContributionLevel;
};

/** The successful calendar payload: weeks of seven days each, oldest week first. */
export type ContributionCalendar = {
  totalContributions: number;
  weeks: ContributionDay[][];
};

/** The shape the /api/github-activity route returns to the client widget. */
export type GithubActivityResult =
  ({ available: true } & ContributionCalendar) | { available: false };

type GraphQLDay = {
  date?: unknown;
  contributionCount?: unknown;
  contributionLevel?: unknown;
};

type GraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: unknown;
          weeks?: { contributionDays?: GraphQLDay[] }[];
        };
      };
    };
  };
  errors?: unknown;
};

function normalizeDay(day: GraphQLDay): ContributionDay {
  const date = typeof day.date === "string" ? day.date : "";
  const count =
    typeof day.contributionCount === "number" && Number.isFinite(day.contributionCount)
      ? day.contributionCount
      : 0;
  const level =
    typeof day.contributionLevel === "string" ? (LEVEL_BY_ENUM[day.contributionLevel] ?? 0) : 0;
  return { date, count, level };
}

/**
 * Fetches the contribution calendar for the configured GitHub user. Throws when the
 * token is missing, on a network error, a non-OK response, GraphQL errors or an
 * unexpected payload, so the caller can decide how to degrade; it never returns a
 * partial or bogus calendar.
 */
export async function fetchContributionCalendar(): Promise<ContributionCalendar> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new WidgetNotConfiguredError(
      "GITHUB_TOKEN is not set; the contribution calendar needs GraphQL auth",
    );
  }

  const login = process.env.GITHUB_USERNAME?.trim() || DEFAULT_USERNAME;

  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      // GitHub rejects API requests without a User-Agent.
      "User-Agent": "portfolio2-github-activity",
    },
    body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login } }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL responded ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse;
  if (payload.errors) {
    throw new Error("GitHub GraphQL returned errors");
  }

  const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
  const total = calendar?.totalContributions;
  const rawWeeks = calendar?.weeks;
  if (typeof total !== "number" || !Number.isFinite(total) || !Array.isArray(rawWeeks)) {
    throw new Error("GitHub GraphQL payload is missing the contribution calendar");
  }

  const weeks = rawWeeks.map((week) => {
    const days = Array.isArray(week?.contributionDays) ? week.contributionDays : [];
    return days.map(normalizeDay);
  });

  return { totalContributions: total, weeks };
}
