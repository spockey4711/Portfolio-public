import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SignalsOfLife, type SignalsPost } from "@/components/widgets/signals/SignalsOfLife";
import { getCopy } from "@/content/copy";

const signals = getCopy("de").signals;

const post: SignalsPost = {
  title: "Warum dieses Portfolio",
  href: "/blog/warum-dieses-portfolio",
  dateLabel: "6. Juli 2026",
  dateIso: "2026-07-06",
};

// Route each signal request to a body (or an error status) by matching its path, so
// one source can fail while the others resolve - the per-source degradation the
// feed promises.
function stubRoutes(map: Record<string, { body?: unknown; status?: number }>) {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: unknown) => {
      const url = String(input);
      const key = Object.keys(map).find((path) => url.includes(path));
      const entry = key ? map[key] : undefined;
      const status = entry?.status ?? (entry ? 200 : 404);
      return Promise.resolve(new Response(JSON.stringify(entry?.body ?? {}), { status }));
    }),
  );
}

describe("SignalsOfLife", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the server-side post row and each live source's fallback first", () => {
    stubRoutes({});
    render(<SignalsOfLife locale="de" latestPost={post} />);

    expect(screen.getByText(signals.title)).toBeInTheDocument();
    // The post signal is static content, present on first render.
    expect(screen.getByText(post.title)).toBeInTheDocument();
    // The live rows start on their fallbacks.
    expect(screen.getByText(signals.commit.fallback)).toBeInTheDocument();
    expect(screen.getByText(signals.github.fallback)).toBeInTheDocument();
  });

  it("fills each live row when its route resolves", async () => {
    stubRoutes({
      "/api/latest-commit": {
        body: {
          available: true,
          message: "feat: add signals feed",
          repo: "spockey4711/portfolio2",
          url: "https://github.com/spockey4711/portfolio2/commit/abc",
          committedAt: "2026-07-08T10:00:00Z",
        },
      },
      "/api/github-activity": { body: { available: true, totalContributions: 1204 } },
    });

    render(<SignalsOfLife locale="de" latestPost={post} />);

    await waitFor(() => expect(screen.getByText("feat: add signals feed")).toBeInTheDocument());
    expect(screen.getByText(`1.204 ${signals.github.summary}`)).toBeInTheDocument();
  });

  it("degrades each source independently: a failing commit route never blanks the rest", async () => {
    stubRoutes({
      "/api/latest-commit": { status: 500 },
      "/api/github-activity": { body: { available: true, totalContributions: 42 } },
    });

    render(<SignalsOfLife locale="de" latestPost={post} />);

    // The other source resolves...
    await waitFor(() =>
      expect(screen.getByText(`42 ${signals.github.summary}`)).toBeInTheDocument(),
    );
    // ...while the commit row stays on its fallback.
    expect(screen.getByText(signals.commit.fallback)).toBeInTheDocument();
  });

  it("shows the post fallback when there is no published post", () => {
    stubRoutes({});
    render(<SignalsOfLife locale="de" latestPost={null} />);

    expect(screen.getByText(signals.post.fallback)).toBeInTheDocument();
  });
});
