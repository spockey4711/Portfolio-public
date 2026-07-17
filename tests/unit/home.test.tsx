import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Home from "@/app/(de)/page";
import { copy } from "@/content/copy";

// Smoke test that also verifies the Vitest + Testing Library + jest-dom
// wiring (jsdom render, role queries, DOM matchers). The page is the hero for
// now; its behaviour is covered in detail in hero.test.tsx.
describe("Home", () => {
  // The hero meta widget fetches /api/weather on mount; keep the smoke test offline.
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
  });

  it("renders the hero headline as the page's h1", () => {
    render(<Home />);

    const { lead, accent } = copy.hero.headline;
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(`${lead} ${accent}`);
  });
});
