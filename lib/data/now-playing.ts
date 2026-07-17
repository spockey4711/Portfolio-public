/**
 * Server-only Spotify "now playing" source for the hero widget (P3-1, P3-8).
 *
 * Spotify has no long-lived read token, so this refreshes a stored OAuth refresh
 * token into a short-lived access token on each call, then reads playback. When
 * nothing is currently playing it falls back to the most recently played track
 * (P3-8) so the widget still shows something real before the static placeholder.
 * All three secrets (SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET /
 * SPOTIFY_REFRESH_TOKEN) are read from server env and never reach the client;
 * when any is missing the module throws so the feature stays optional and the
 * build succeeds with no secrets set.
 *
 * The recently-played read needs the `user-read-recently-played` scope on the
 * refresh token (the P3-1 token only had `user-read-currently-playing`). If the
 * token lacks it Spotify answers 403, the read throws and the caller degrades to
 * the static placeholder - so an un-regenerated token never breaks the widget.
 *
 * This module must stay server-only. It is consumed by the /api/now-playing route
 * handler (app/api/now-playing/route.ts); the client widget calls that same-origin
 * endpoint, never Spotify directly. See docs/architecture/rendering-and-data.md.
 */

import { WidgetNotConfiguredError } from "@/lib/observability/widget-failure";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

/**
 * The shape the /api/now-playing route returns to the client widget: a live
 * track, the last played track, or nothing (idle - the widget keeps its static
 * placeholder).
 */
export type NowPlayingResult =
  | { state: "playing"; track: string; artist: string }
  | { state: "recent"; track: string; artist: string }
  | { state: "idle" };

type SpotifyCredentials = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

type TokenResponse = { access_token?: unknown };

type Track = { name?: unknown; artists?: { name?: unknown }[] } | null | undefined;

type CurrentlyPlayingResponse = {
  is_playing?: unknown;
  item?: Track;
};

type RecentlyPlayedResponse = {
  items?: { track?: Track }[];
};

/** A resolved track/artist pair, the payload behind a playing or recent state. */
type TrackInfo = { track: string; artist: string };

/**
 * Reads the three server-only Spotify secrets. Throws if any is missing so the
 * caller degrades to the static fallback - the feature is optional and must not
 * break a build or a preview that has no secrets set.
 */
function readCredentials(): SpotifyCredentials {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new WidgetNotConfiguredError("Spotify now-playing is not configured");
  }

  return { clientId, clientSecret, refreshToken };
}

/**
 * Exchanges the stored refresh token for a fresh access token. The token is never
 * cached (`no-store`) - it is short-lived and must never sit in a shared cache.
 */
async function fetchAccessToken({
  clientId,
  clientSecret,
  refreshToken,
}: SpotifyCredentials): Promise<string> {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Spotify token endpoint responded ${response.status}`);
  }

  const data = (await response.json()) as TokenResponse;
  if (typeof data.access_token !== "string" || data.access_token.length === 0) {
    throw new Error("Spotify token response is missing an access_token");
  }

  return data.access_token;
}

/**
 * Pulls the track name and first artist off a Spotify track object, or null when
 * either is missing (e.g. during an ad, or on a malformed payload).
 */
function readTrack(item: Track): TrackInfo | null {
  const track = item?.name;
  const artist = item?.artists?.[0]?.name;
  if (typeof track !== "string" || typeof artist !== "string") {
    return null;
  }
  return { track, artist };
}

/**
 * Reads the currently playing track. Returns it when Spotify reports live
 * playback, or null when playback is stopped, paused or has no track item (204,
 * `is_playing: false`, or a missing item - e.g. during an ad). Throws on a
 * non-OK response so the caller can degrade.
 */
async function fetchCurrentlyPlaying(accessToken: string): Promise<TrackInfo | null> {
  const response = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  // 204 No Content: playback is stopped or idle.
  if (response.status === 204) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Spotify now-playing endpoint responded ${response.status}`);
  }

  const data = (await response.json()) as CurrentlyPlayingResponse;
  if (data.is_playing !== true) {
    return null;
  }
  return readTrack(data.item);
}

/**
 * Reads the most recently played track. Returns it when Spotify has history, or
 * null when the history is empty. Throws on a non-OK response (including the 403
 * Spotify returns when the refresh token lacks the `user-read-recently-played`
 * scope) so the caller degrades to the static placeholder.
 */
async function fetchRecentlyPlayed(accessToken: string): Promise<TrackInfo | null> {
  const response = await fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify recently-played endpoint responded ${response.status}`);
  }

  const data = (await response.json()) as RecentlyPlayedResponse;
  return readTrack(data.items?.[0]?.track);
}

/**
 * Resolves what the hero widget should show: the live track if something is
 * playing, otherwise the most recently played track, otherwise an idle state
 * (the widget keeps its static placeholder). Throws on a network error, a non-OK
 * response or a missing configuration so the caller can decide how to degrade; it
 * never returns a bogus track.
 */
export async function fetchNowPlaying(): Promise<NowPlayingResult> {
  const credentials = readCredentials();
  const accessToken = await fetchAccessToken(credentials);

  const current = await fetchCurrentlyPlaying(accessToken);
  if (current) {
    return { state: "playing", ...current };
  }

  const recent = await fetchRecentlyPlayed(accessToken);
  if (recent) {
    return { state: "recent", ...recent };
  }

  return { state: "idle" };
}
