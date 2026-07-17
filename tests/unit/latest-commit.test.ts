import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// unstable_cache would memoise the first result across tests (and needs a request
// context); stub it to a pass-through so each GET exercises the real handler.
vi.mock("next/cache", () => ({
  unstable_cache: <T>(fn: T) => fn,
}));

import { GET } from "@/app/api/latest-commit/route";
import { fetchLatestCommit } from "@/lib/data/latest-commit";
import { WidgetNotConfiguredError } from "@/lib/observability/widget-failure";

function stubFetch(implementation: () => Promise<Response>) {
  const mock = vi.fn<(input: unknown, init?: unknown) => Promise<Response>>(implementation);
  vi.stubGlobal("fetch", mock);
  return mock;
}

// A recent-events page: a non-push event first, then a push whose head commit (the
// last in the array - GitHub lists a push oldest first) is what the feed shows.
function eventsResponse() {
  return new Response(
    JSON.stringify([
      { type: "WatchEvent", created_at: "2026-07-08T12:00:00Z", repo: { name: "spockey4711/x" } },
      {
        type: "PushEvent",
        created_at: "2026-07-08T10:00:00Z",
        repo: { name: "spockey4711/portfolio2" },
        payload: {
          commits: [
            { sha: "aaa", message: "chore: earlier commit" },
            { sha: "b1c2d3", message: "feat: add signals feed\n\na longer body line" },
          ],
        },
      },
    ]),
    { status: 200 },
  );
}

describe("fetchLatestCommit", () => {
  beforeEach(() => {
    vi.stubEnv("GITHUB_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("maps the most recent push to its head commit's first message line", async () => {
    const mock = stubFetch(() => Promise.resolve(eventsResponse()));

    const commit = await fetchLatestCommit();

    expect(commit).toEqual({
      message: "feat: add signals feed",
      repo: "spockey4711/portfolio2",
      url: "https://github.com/spockey4711/portfolio2/commit/b1c2d3",
      committedAt: "2026-07-08T10:00:00Z",
    });

    const [url, init] = mock.mock.calls[0] ?? [];
    expect(String(url)).toContain("api.github.com/users/spockey4711/events/public");
    // The read-only heatmap token authenticates the read to raise the rate limit.
    expect((init as { headers: Record<string, string> }).headers.Authorization).toBe(
      "Bearer test-token",
    );
  });

  it("throws WidgetNotConfiguredError when no token is configured", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    const mock = stubFetch(() => Promise.resolve(eventsResponse()));

    await expect(fetchLatestCommit()).rejects.toThrow(WidgetNotConfiguredError);
    // It degrades before touching GitHub: no external call without a token.
    expect(mock).not.toHaveBeenCalled();
  });

  it("throws on a non-OK upstream response", async () => {
    stubFetch(() => Promise.resolve(new Response("", { status: 403 })));
    await expect(fetchLatestCommit()).rejects.toThrow();
  });

  it("returns null when the recent event window holds no push (quiet empty state)", async () => {
    stubFetch(() =>
      Promise.resolve(new Response(JSON.stringify([{ type: "WatchEvent" }]), { status: 200 })),
    );
    await expect(fetchLatestCommit()).resolves.toBeNull();
  });

  it("skips a push whose head commit is malformed and falls through to the next", async () => {
    // The newest push's head commit is missing its sha, so it is unusable; the
    // feed must skip it and surface the next well-formed push rather than nothing.
    stubFetch(() =>
      Promise.resolve(
        new Response(
          JSON.stringify([
            {
              type: "PushEvent",
              created_at: "2026-07-08T11:00:00Z",
              repo: { name: "spockey4711/broken" },
              payload: { commits: [{ message: "feat: no sha here" }] },
            },
            {
              type: "PushEvent",
              created_at: "2026-07-08T09:00:00Z",
              repo: { name: "spockey4711/portfolio2" },
              payload: { commits: [{ sha: "cafe42", message: "fix: real commit" }] },
            },
          ]),
          { status: 200 },
        ),
      ),
    );

    await expect(fetchLatestCommit()).resolves.toEqual({
      message: "fix: real commit",
      repo: "spockey4711/portfolio2",
      url: "https://github.com/spockey4711/portfolio2/commit/cafe42",
      committedAt: "2026-07-08T09:00:00Z",
    });
  });

  it("skips a push whose head commit message is blank", async () => {
    stubFetch(() =>
      Promise.resolve(
        new Response(
          JSON.stringify([
            {
              type: "PushEvent",
              created_at: "2026-07-08T08:00:00Z",
              repo: { name: "spockey4711/portfolio2" },
              payload: { commits: [{ sha: "abc123", message: "   \n" }] },
            },
          ]),
          { status: 200 },
        ),
      ),
    );

    await expect(fetchLatestCommit()).resolves.toBeNull();
  });

  it("throws when the payload is not an array", async () => {
    stubFetch(() =>
      Promise.resolve(new Response(JSON.stringify({ message: "Not Found" }), { status: 200 })),
    );
    await expect(fetchLatestCommit()).rejects.toThrow();
  });
});

describe("GET /api/latest-commit", () => {
  beforeEach(() => {
    vi.stubEnv("GITHUB_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns the available commit with a cache header on success", async () => {
    stubFetch(() => Promise.resolve(eventsResponse()));

    const response = await GET();
    expect(response.headers.get("Cache-Control")).toContain("s-maxage");
    await expect(response.json()).resolves.toEqual({
      available: true,
      message: "feat: add signals feed",
      repo: "spockey4711/portfolio2",
      url: "https://github.com/spockey4711/portfolio2/commit/b1c2d3",
      committedAt: "2026-07-08T10:00:00Z",
    });
  });

  it("degrades to an unavailable state and logs when the upstream fails", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(() => Promise.reject(new Error("network")));

    const response = await GET();
    await expect(response.json()).resolves.toEqual({ available: false });
    // The failure is observable, not silent.
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining("[widget:latest-commit]"));
  });

  it("serves the fallback without logging when there is no recent push", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(() =>
      Promise.resolve(new Response(JSON.stringify([{ type: "WatchEvent" }]), { status: 200 })),
    );

    const response = await GET();
    await expect(response.json()).resolves.toEqual({ available: false });
    // An empty window is a normal quiet state, not an outage to signal.
    expect(errorLog).not.toHaveBeenCalled();
  });

  it("degrades quietly, without logging, when no token is configured", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("GITHUB_TOKEN", "");
    stubFetch(() => Promise.resolve(eventsResponse()));

    const response = await GET();
    await expect(response.json()).resolves.toEqual({ available: false });
    // An unconfigured optional feature is expected, not a failure to signal.
    expect(errorLog).not.toHaveBeenCalled();
  });
});
