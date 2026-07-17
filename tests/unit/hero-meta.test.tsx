import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HeroMeta } from "@/components/sections/hero/HeroMeta";
import { copy } from "@/content/copy";

const { meta } = copy.hero.status;

function stubWeather(body: unknown, status = 200) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
}

describe("HeroMeta", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the fixed location", () => {
    stubWeather({ available: false });
    render(<HeroMeta meta={meta} />);

    expect(screen.getByText(new RegExp(meta.location))).toBeInTheDocument();
  });

  it("shows the live temperature when the weather route reports it", async () => {
    stubWeather({ available: true, temperatureC: 7 });
    render(<HeroMeta meta={meta} />);

    await waitFor(() => expect(screen.getByText(/7°C/)).toBeInTheDocument());
  });

  it("keeps the static temperature fallback when the route is unavailable", async () => {
    stubWeather({ available: false });
    render(<HeroMeta meta={meta} />);

    // The effect resolves without changing the temperature; the fallback stays.
    await waitFor(() => expect(screen.getByText(new RegExp(meta.location))).toBeInTheDocument());
    expect(screen.getByText(new RegExp(meta.temperature))).toBeInTheDocument();
  });
});
