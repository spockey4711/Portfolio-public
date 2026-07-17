import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NowPlaying } from "@/components/sections/hero/NowPlaying";
import { copy } from "@/content/copy";

const { nowPlaying } = copy.hero.visual;

function stubRoute(body: unknown, status = 200) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
}

describe("NowPlaying", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the label and the static placeholder track", () => {
    stubRoute({ state: "idle" });
    render(<NowPlaying copy={nowPlaying} />);

    expect(screen.getByText(nowPlaying.label)).toBeInTheDocument();
    expect(screen.getByText(nowPlaying.track)).toBeInTheDocument();
  });

  it("shows the live track and artist when Spotify reports playback", async () => {
    stubRoute({ state: "playing", track: "Weightless", artist: "Marconi Union" });
    render(<NowPlaying copy={nowPlaying} />);

    await waitFor(() => expect(screen.getByText("Weightless - Marconi Union")).toBeInTheDocument());
    expect(screen.getByText(nowPlaying.label)).toBeInTheDocument();
  });

  it("shows the last played track labelled as last played when nothing is playing", async () => {
    stubRoute({ state: "recent", track: "Intro", artist: "The xx" });
    render(<NowPlaying copy={nowPlaying} />);

    await waitFor(() => expect(screen.getByText("Intro - The xx")).toBeInTheDocument());
    expect(screen.getByText(nowPlaying.lastPlayedLabel)).toBeInTheDocument();
  });

  it("keeps the static placeholder when the state is idle", async () => {
    stubRoute({ state: "idle" });
    render(<NowPlaying copy={nowPlaying} />);

    // The effect resolves without a track; the placeholder stays put.
    await waitFor(() => expect(screen.getByText(nowPlaying.label)).toBeInTheDocument());
    expect(screen.getByText(nowPlaying.track)).toBeInTheDocument();
  });

  it("keeps the static placeholder when the route is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));
    render(<NowPlaying copy={nowPlaying} />);

    await waitFor(() => expect(screen.getByText(nowPlaying.label)).toBeInTheDocument());
    expect(screen.getByText(nowPlaying.track)).toBeInTheDocument();
  });
});
