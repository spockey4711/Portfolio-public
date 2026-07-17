import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Wakatime } from "@/components/widgets/wakatime/Wakatime";
import { copy } from "@/content/copy";

const wk = copy.wakatime;

function stubStats(body: unknown, status = 200) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
}

describe("Wakatime", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the static fallback caption before any data arrives", () => {
    stubStats({ available: false });
    render(<Wakatime locale="de" />);

    expect(screen.getAllByText(new RegExp(wk.fallback)).length).toBeGreaterThan(0);
  });

  it("shows the total, summary and projects once the route reports stats", async () => {
    stubStats({
      available: true,
      humanReadableTotal: "10 hrs 2 mins",
      projects: [{ name: "Portfolio2", percent: 62.5, text: "6 hrs 20 mins" }],
    });
    render(<Wakatime locale="de" />);

    const expected = new RegExp(`10 hrs 2 mins ${wk.summary}`);
    await waitFor(() => expect(screen.getAllByText(expected).length).toBeGreaterThan(0));
    expect(screen.getByText("Portfolio2")).toBeInTheDocument();
    expect(screen.getByText("6 hrs 20 mins")).toBeInTheDocument();
  });

  it("shows the empty-projects caption when stats hold no projects", async () => {
    stubStats({ available: true, humanReadableTotal: "0 secs", projects: [] });
    render(<Wakatime locale="de" />);

    await waitFor(() =>
      expect(screen.getAllByText(new RegExp(wk.emptyProjects)).length).toBeGreaterThan(0),
    );
  });

  it("keeps the fallback when the route reports unavailable", async () => {
    stubStats({ available: false });
    render(<Wakatime locale="de" />);

    await waitFor(() =>
      expect(screen.getAllByText(new RegExp(wk.fallback)).length).toBeGreaterThan(0),
    );
    expect(screen.queryByText(new RegExp(wk.summary))).not.toBeInTheDocument();
  });
});
