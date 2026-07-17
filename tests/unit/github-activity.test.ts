import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// unstable_cache would memoise the first result across tests (and needs a request
// context); stub it to a pass-through so each GET exercises the real handler.
vi.mock("next/cache", () => ({
  unstable_cache: <T>(fn: T) => fn,
}));

import { GET } from "@/app/api/github-activity/route";
import { fetchContributionCalendar } from "@/lib/data/github-activity";
import { WidgetNotConfiguredError } from "@/lib/observability/widget-failure";

function stubFetch(implementation: () => Promise<Response>) {
  const mock = vi.fn<(input: unknown, init?: unknown) => Promise<Response>>(implementation);
  vi.stubGlobal("fetch", mock);
  return mock;
}

// A minimal GraphQL calendar: one week, two days, spanning the intensity buckets.
function calendarResponse() {
  return new Response(
    JSON.stringify({
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: 1204,
              weeks: [
                {
                  contributionDays: [
                    { date: "2026-06-01", contributionCount: 0, contributionLevel: "NONE" },
                    {
                      date: "2026-06-02",
                      contributionCount: 9,
                      contributionLevel: "FOURTH_QUARTILE",
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    }),
    { status: 200 },
  );
}

describe("fetchContributionCalendar", () => {
  beforeEach(() => {
    vi.stubEnv("GITHUB_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("maps the GraphQL calendar into weeks of typed days", async () => {
    const mock = stubFetch(() => Promise.resolve(calendarResponse()));

    const calendar = await fetchContributionCalendar();

    expect(calendar.totalContributions).toBe(1204);
    expect(calendar.weeks).toEqual([
      [
        { date: "2026-06-01", count: 0, level: 0 },
        { date: "2026-06-02", count: 9, level: 4 },
      ],
    ]);

    const [url, init] = mock.mock.calls[0] ?? [];
    expect(String(url)).toContain("api.github.com/graphql");
    expect((init as { headers: Record<string, string> }).headers.Authorization).toBe(
      "Bearer test-token",
    );
  });

  it("throws WidgetNotConfiguredError when no token is configured", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    stubFetch(() => Promise.resolve(calendarResponse()));
    await expect(fetchContributionCalendar()).rejects.toThrow(WidgetNotConfiguredError);
  });

  it("throws on a non-OK upstream response", async () => {
    stubFetch(() => Promise.resolve(new Response("", { status: 401 })));
    await expect(fetchContributionCalendar()).rejects.toThrow();
  });

  it("throws when the payload reports GraphQL errors", async () => {
    stubFetch(() =>
      Promise.resolve(
        new Response(JSON.stringify({ errors: [{ message: "Bad credentials" }] }), { status: 200 }),
      ),
    );
    await expect(fetchContributionCalendar()).rejects.toThrow();
  });

  it("throws when the calendar is missing from the payload", async () => {
    stubFetch(() =>
      Promise.resolve(new Response(JSON.stringify({ data: { user: null } }), { status: 200 })),
    );
    await expect(fetchContributionCalendar()).rejects.toThrow();
  });

  it("coerces malformed days and weeks to safe defaults", async () => {
    // A day with an odd date/count and an unknown level bucket, plus a week that
    // carries no contributionDays: the heatmap must degrade each to a safe zero
    // rather than render NaN cells or crash on the missing array.
    stubFetch(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              user: {
                contributionsCollection: {
                  contributionCalendar: {
                    totalContributions: 7,
                    weeks: [
                      {
                        contributionDays: [
                          { date: 123, contributionCount: "5", contributionLevel: "MYSTERY" },
                        ],
                      },
                      {},
                    ],
                  },
                },
              },
            },
          }),
          { status: 200 },
        ),
      ),
    );

    const calendar = await fetchContributionCalendar();
    expect(calendar.weeks).toEqual([[{ date: "", count: 0, level: 0 }], []]);
  });
});

describe("GET /api/github-activity", () => {
  beforeEach(() => {
    vi.stubEnv("GITHUB_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns the available calendar with a cache header on success", async () => {
    stubFetch(() => Promise.resolve(calendarResponse()));

    const response = await GET();
    expect(response.headers.get("Cache-Control")).toContain("s-maxage");
    await expect(response.json()).resolves.toEqual({
      available: true,
      totalContributions: 1204,
      weeks: [
        [
          { date: "2026-06-01", count: 0, level: 0 },
          { date: "2026-06-02", count: 9, level: 4 },
        ],
      ],
    });
  });

  it("degrades to an unavailable state and logs when the upstream fails", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(() => Promise.reject(new Error("network")));

    const response = await GET();
    await expect(response.json()).resolves.toEqual({ available: false });
    // The failure is observable, not silent.
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining("[widget:github-activity]"));
  });

  it("degrades quietly, without logging, when no token is configured", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("GITHUB_TOKEN", "");
    stubFetch(() => Promise.resolve(calendarResponse()));

    const response = await GET();
    await expect(response.json()).resolves.toEqual({ available: false });
    // An unconfigured optional feature is expected, not a failure to signal.
    expect(errorLog).not.toHaveBeenCalled();
  });
});
