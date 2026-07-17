import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LiveStatus } from "@/components/sections/hero/LiveStatus";
import { copy } from "@/content/copy";

const { hero } = copy;

/**
 * The live-status module (now-playing + time/weather meta + availability) used to
 * live in the hero; on the bento landing it is its own tile (Onepager.tsx). These
 * cover the behaviour the hero tests used to assert against it.
 */
describe("LiveStatus", () => {
  // The meta widget fetches /api/weather on mount; keep the tests offline.
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ available: false }), { status: 200 })),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("shows the meta line", () => {
    render(<LiveStatus copy={hero} />);

    // The live meta widget renders the fixed location plus a time/temperature line.
    expect(screen.getByText(new RegExp(hero.status.meta.location))).toBeInTheDocument();
  });

  it("hides the availability indicator unless SHOW_AVAILABILITY is set", () => {
    render(<LiveStatus copy={hero} />);

    expect(screen.queryByText(hero.status.availability)).not.toBeInTheDocument();
  });

  it("shows the availability indicator when SHOW_AVAILABILITY is enabled", () => {
    vi.stubEnv("SHOW_AVAILABILITY", "true");
    render(<LiveStatus copy={hero} />);

    expect(screen.getByText(hero.status.availability)).toBeInTheDocument();
  });
});
