import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// unstable_cache would memoise the first result across tests (and needs a request
// context); stub it to a pass-through so each GET exercises the real handler.
vi.mock("next/cache", () => ({
  unstable_cache: <T>(fn: T) => fn,
}));

import { GET } from "@/app/api/wakatime/route";
import { fetchWakatimeStats } from "@/lib/data/wakatime";
import { WidgetNotConfiguredError } from "@/lib/observability/widget-failure";

function stubFetch(implementation: () => Promise<Response>) {
  const mock = vi.fn<(input: unknown, init?: unknown) => Promise<Response>>(implementation);
  vi.stubGlobal("fetch", mock);
  return mock;
}

// A minimal stats payload: a total plus two projects, share first.
function statsResponse(projects?: unknown[]) {
  return new Response(
    JSON.stringify({
      data: {
        human_readable_total: "10 hrs 2 mins",
        projects: projects ?? [
          { name: "Portfolio2", percent: 62.5, text: "6 hrs 20 mins" },
          { name: "dotfiles", percent: 20, text: "2 hrs" },
        ],
      },
    }),
    { status: 200 },
  );
}

describe("fetchWakatimeStats", () => {
  beforeEach(() => {
    vi.stubEnv("WAKATIME_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("maps the payload into typed projects and sends base64 Basic auth", async () => {
    const mock = stubFetch(() => Promise.resolve(statsResponse()));

    const stats = await fetchWakatimeStats();

    expect(stats.humanReadableTotal).toBe("10 hrs 2 mins");
    expect(stats.projects).toEqual([
      { name: "Portfolio2", percent: 62.5, text: "6 hrs 20 mins" },
      { name: "dotfiles", percent: 20, text: "2 hrs" },
    ]);

    const [url, init] = mock.mock.calls[0] ?? [];
    expect(String(url)).toContain("wakatime.com/api/v1/users/current/stats/last_7_days");
    const expectedAuth = `Basic ${Buffer.from("test-key").toString("base64")}`;
    expect((init as { headers: Record<string, string> }).headers.Authorization).toBe(expectedAuth);
  });

  it("keeps only the leading projects and drops entries with no name", async () => {
    const projects = [
      { name: "Portfolio2", percent: 40, text: "4 hrs" },
      { name: "", percent: 10, text: "1 hr" },
      { name: "dotfiles", percent: 15, text: "1 hr 30 mins" },
      { name: "notes", percent: 12, text: "1 hr 12 mins" },
      { name: "scripts", percent: 10, text: "1 hr" },
      { name: "sandbox", percent: 8, text: "48 mins" },
      { name: "infra", percent: 5, text: "30 mins" },
    ];
    stubFetch(() => Promise.resolve(statsResponse(projects)));

    const stats = await fetchWakatimeStats();

    // The nameless entry is dropped, and the list is capped at the top five.
    expect(stats.projects.map((project) => project.name)).toEqual([
      "Portfolio2",
      "dotfiles",
      "notes",
      "scripts",
      "sandbox",
    ]);
  });

  it("clamps an out-of-range percent into 0-100", async () => {
    stubFetch(() =>
      Promise.resolve(statsResponse([{ name: "Portfolio2", percent: 140, text: "9 hrs" }])),
    );

    const stats = await fetchWakatimeStats();
    expect(stats.projects[0]?.percent).toBe(100);
  });

  it("floors a negative percent at 0", async () => {
    stubFetch(() =>
      Promise.resolve(statsResponse([{ name: "Portfolio2", percent: -20, text: "0 mins" }])),
    );

    const stats = await fetchWakatimeStats();
    expect(stats.projects[0]?.percent).toBe(0);
  });

  it("degrades malformed project fields to safe defaults rather than failing the payload", async () => {
    // A non-numeric percent falls back to 0 (an empty bar) and a missing text to
    // an empty string, so one odd entry never blanks the whole widget.
    stubFetch(() =>
      Promise.resolve(statsResponse([{ name: "Portfolio2", percent: "lots", extra: true }])),
    );

    const stats = await fetchWakatimeStats();
    expect(stats.projects).toEqual([{ name: "Portfolio2", percent: 0, text: "" }]);
  });

  it("drops an entry whose name is not a string", async () => {
    stubFetch(() =>
      Promise.resolve(
        statsResponse([
          { name: 42, percent: 30, text: "3 hrs" },
          { name: "Portfolio2", percent: 20, text: "2 hrs" },
        ]),
      ),
    );

    const stats = await fetchWakatimeStats();
    expect(stats.projects.map((project) => project.name)).toEqual(["Portfolio2"]);
  });

  it("throws WidgetNotConfiguredError when no key is configured", async () => {
    vi.stubEnv("WAKATIME_API_KEY", "");
    stubFetch(() => Promise.resolve(statsResponse()));
    await expect(fetchWakatimeStats()).rejects.toThrow(WidgetNotConfiguredError);
  });

  it("throws on a non-OK upstream response", async () => {
    stubFetch(() => Promise.resolve(new Response("", { status: 401 })));
    await expect(fetchWakatimeStats()).rejects.toThrow();
  });

  it("throws when the stats are missing from the payload", async () => {
    stubFetch(() => Promise.resolve(new Response(JSON.stringify({ data: null }), { status: 200 })));
    await expect(fetchWakatimeStats()).rejects.toThrow();
  });
});

describe("GET /api/wakatime", () => {
  beforeEach(() => {
    vi.stubEnv("WAKATIME_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns the available stats with a cache header on success", async () => {
    stubFetch(() => Promise.resolve(statsResponse()));

    const response = await GET();
    expect(response.headers.get("Cache-Control")).toContain("s-maxage");
    await expect(response.json()).resolves.toEqual({
      available: true,
      humanReadableTotal: "10 hrs 2 mins",
      projects: [
        { name: "Portfolio2", percent: 62.5, text: "6 hrs 20 mins" },
        { name: "dotfiles", percent: 20, text: "2 hrs" },
      ],
    });
  });

  it("degrades to an unavailable state and logs when the upstream fails", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(() => Promise.reject(new Error("network")));

    const response = await GET();
    await expect(response.json()).resolves.toEqual({ available: false });
    // The failure is observable, not silent.
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining("[widget:wakatime]"));
  });

  it("degrades quietly, without logging, when no key is configured", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("WAKATIME_API_KEY", "");
    stubFetch(() => Promise.resolve(statsResponse()));

    const response = await GET();
    await expect(response.json()).resolves.toEqual({ available: false });
    // An unconfigured optional feature is expected, not a failure to signal.
    expect(errorLog).not.toHaveBeenCalled();
  });
});
