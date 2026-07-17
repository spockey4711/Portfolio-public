import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GithubActivity } from "@/components/widgets/github-activity/GithubActivity";
import { copy } from "@/content/copy";

const gh = copy.githubActivity;

function stubActivity(body: unknown, status = 200) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
}

describe("GithubActivity", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the static fallback caption before any data arrives", () => {
    stubActivity({ available: false });
    render(<GithubActivity locale="de" />);

    expect(screen.getAllByText(new RegExp(gh.fallback)).length).toBeGreaterThan(0);
  });

  it("shows the total and summary once the route reports a calendar", async () => {
    const total = 1204;
    stubActivity({
      available: true,
      totalContributions: total,
      weeks: [[{ date: "2026-06-02", count: 9, level: 4 }]],
    });
    render(<GithubActivity locale="de" />);

    const expected = new RegExp(`${total.toLocaleString("de-DE")} ${gh.summary}`);
    await waitFor(() => expect(screen.getAllByText(expected).length).toBeGreaterThan(0));
  });

  it("keeps the fallback when the route reports unavailable", async () => {
    stubActivity({ available: false });
    render(<GithubActivity locale="de" />);

    await waitFor(() =>
      expect(screen.getAllByText(new RegExp(gh.fallback)).length).toBeGreaterThan(0),
    );
    expect(screen.queryByText(new RegExp(gh.summary))).not.toBeInTheDocument();
  });
});
