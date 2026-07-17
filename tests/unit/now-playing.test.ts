import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/now-playing/route";
import { fetchNowPlaying } from "@/lib/data/now-playing";
import { WidgetNotConfiguredError } from "@/lib/observability/widget-failure";

const TOKEN_URL = "https://accounts.spotify.com/api/token";

type Upstream = { status: number; body?: unknown };

/**
 * Stubs the upstream calls fetchNowPlaying makes: the token refresh, then the
 * currently-playing read and (when nothing is playing) the recently-played read.
 * The token response is shared; each test supplies the playback responses it
 * needs by URL.
 */
function stubSpotify(responses: { current: Upstream; recent?: Upstream }) {
  const answer = ({ status, body }: Upstream) =>
    Promise.resolve(new Response(body === undefined ? null : JSON.stringify(body), { status }));

  const mock = vi.fn((input: unknown) => {
    const url = String(input);
    if (url === TOKEN_URL) {
      return answer({ status: 200, body: { access_token: "test-access-token" } });
    }
    if (url.includes("me/player/recently-played")) {
      return answer(responses.recent ?? { status: 200, body: { items: [] } });
    }
    return answer(responses.current);
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

const PLAYING_BODY = {
  is_playing: true,
  item: { name: "Weightless", artists: [{ name: "Marconi Union" }] },
};

const RECENT_BODY = {
  items: [{ track: { name: "Intro", artists: [{ name: "The xx" }] } }],
};

describe("fetchNowPlaying", () => {
  beforeEach(() => {
    vi.stubEnv("SPOTIFY_CLIENT_ID", "client-id");
    vi.stubEnv("SPOTIFY_CLIENT_SECRET", "client-secret");
    vi.stubEnv("SPOTIFY_REFRESH_TOKEN", "refresh-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns the playing track and artist from Spotify", async () => {
    const mock = stubSpotify({ current: { status: 200, body: PLAYING_BODY } });

    await expect(fetchNowPlaying()).resolves.toEqual({
      state: "playing",
      track: "Weightless",
      artist: "Marconi Union",
    });

    // Refreshes the token, reads playback, and never touches recently-played
    // while something is playing.
    expect(String(mock.mock.calls[0]?.[0])).toBe(TOKEN_URL);
    expect(String(mock.mock.calls[1]?.[0])).toContain("me/player/currently-playing");
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("falls back to the recently played track on a 204 No Content", async () => {
    const mock = stubSpotify({
      current: { status: 204 },
      recent: { status: 200, body: RECENT_BODY },
    });

    await expect(fetchNowPlaying()).resolves.toEqual({
      state: "recent",
      track: "Intro",
      artist: "The xx",
    });
    expect(String(mock.mock.calls[2]?.[0])).toContain("me/player/recently-played");
  });

  it("falls back to the recently played track when Spotify is paused", async () => {
    stubSpotify({
      current: { status: 200, body: { ...PLAYING_BODY, is_playing: false } },
      recent: { status: 200, body: RECENT_BODY },
    });
    await expect(fetchNowPlaying()).resolves.toEqual({
      state: "recent",
      track: "Intro",
      artist: "The xx",
    });
  });

  it("falls back to the recently played track when there is no live item (e.g. an ad)", async () => {
    stubSpotify({
      current: { status: 200, body: { is_playing: true, item: null } },
      recent: { status: 200, body: RECENT_BODY },
    });
    await expect(fetchNowPlaying()).resolves.toEqual({
      state: "recent",
      track: "Intro",
      artist: "The xx",
    });
  });

  it("reports idle when nothing is playing and there is no play history", async () => {
    stubSpotify({ current: { status: 204 }, recent: { status: 200, body: { items: [] } } });
    await expect(fetchNowPlaying()).resolves.toEqual({ state: "idle" });
  });

  it("throws on a non-OK currently-playing response", async () => {
    stubSpotify({ current: { status: 503, body: {} } });
    await expect(fetchNowPlaying()).rejects.toThrow();
  });

  it("throws on a non-OK recently-played response (e.g. 403 missing scope)", async () => {
    stubSpotify({ current: { status: 204 }, recent: { status: 403, body: {} } });
    await expect(fetchNowPlaying()).rejects.toThrow();
  });

  it("throws WidgetNotConfiguredError when the feature is unconfigured", async () => {
    vi.unstubAllEnvs();
    await expect(fetchNowPlaying()).rejects.toThrow(WidgetNotConfiguredError);
  });

  it("throws when the token refresh itself fails (never reads playback)", async () => {
    const mock = vi.fn<(input: unknown) => Promise<Response>>(() =>
      Promise.resolve(new Response("", { status: 401 })),
    );
    vi.stubGlobal("fetch", mock);

    await expect(fetchNowPlaying()).rejects.toThrow();
    // It fails at the token step, so it never calls a playback endpoint.
    expect(mock).toHaveBeenCalledTimes(1);
    expect(String(mock.mock.calls[0]?.[0])).toBe(TOKEN_URL);
  });

  it("throws when the token response carries no access_token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({}), { status: 200 }))),
    );

    await expect(fetchNowPlaying()).rejects.toThrow();
  });
});

describe("GET /api/now-playing", () => {
  beforeEach(() => {
    vi.stubEnv("SPOTIFY_CLIENT_ID", "client-id");
    vi.stubEnv("SPOTIFY_CLIENT_SECRET", "client-secret");
    vi.stubEnv("SPOTIFY_REFRESH_TOKEN", "refresh-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns the playing track with a cache header on success", async () => {
    stubSpotify({ current: { status: 200, body: PLAYING_BODY } });

    const response = await GET();
    expect(response.headers.get("Cache-Control")).toContain("s-maxage");
    await expect(response.json()).resolves.toEqual({
      state: "playing",
      track: "Weightless",
      artist: "Marconi Union",
    });
  });

  it("returns the recently played track when nothing is playing", async () => {
    stubSpotify({ current: { status: 204 }, recent: { status: 200, body: RECENT_BODY } });

    const response = await GET();
    expect(response.headers.get("Cache-Control")).toContain("stale-while-revalidate");
    await expect(response.json()).resolves.toEqual({
      state: "recent",
      track: "Intro",
      artist: "The xx",
    });
  });

  it("degrades to an idle state and logs when the upstream fails", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    stubSpotify({ current: { status: 500, body: {} } });

    const response = await GET();
    await expect(response.json()).resolves.toEqual({ state: "idle" });
    // A genuine upstream failure is observable, not silent.
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining("[widget:now-playing]"));
  });

  it("degrades quietly, without logging, when the feature is unconfigured", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.unstubAllEnvs();

    const response = await GET();
    await expect(response.json()).resolves.toEqual({ state: "idle" });
    // An unconfigured optional feature is expected, not a failure to signal.
    expect(errorLog).not.toHaveBeenCalled();
  });
});
