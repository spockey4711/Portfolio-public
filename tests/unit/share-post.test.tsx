import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SharePost, type SharePostLabels } from "@/components/sections/blog/SharePost";

// The share affordances are cookieless and script-free (S5-4): a progressively
// enhanced Web Share button plus a universal copy-link fallback. The tests drive
// the two capability paths and the graceful-failure branches.
const labels: SharePostLabels = {
  heading: "Diesen Beitrag teilen",
  native: "Teilen",
  copy: "Link kopieren",
  copied: "Link kopiert",
};

const url = "https://yannikwuenker.de/blog/mein-post";
const title = "Mein Post - Yannik Wünker";

function setShare(value: unknown): void {
  Object.defineProperty(navigator, "share", { value, configurable: true, writable: true });
}

function setClipboard(value: unknown): void {
  Object.defineProperty(navigator, "clipboard", { value, configurable: true, writable: true });
}

describe("SharePost", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setShare(undefined);
    setClipboard(undefined);
  });

  it("always renders the copy-link button and hides native share without support", () => {
    setShare(undefined);
    render(<SharePost url={url} title={title} labels={labels} />);

    expect(screen.getByRole("button", { name: labels.copy })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: labels.native })).not.toBeInTheDocument();
  });

  it("reveals the native share button when supported and forwards the title and url", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setShare(share);
    const user = userEvent.setup();
    render(<SharePost url={url} title={title} labels={labels} />);

    const shareButton = await screen.findByRole("button", { name: labels.native });
    await user.click(shareButton);

    expect(share).toHaveBeenCalledWith({ title, url });
  });

  it("copies the url to the clipboard and confirms", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    setClipboard({ writeText });
    render(<SharePost url={url} title={title} labels={labels} />);

    await user.click(screen.getByRole("button", { name: labels.copy }));

    expect(writeText).toHaveBeenCalledWith(url);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: labels.copied })).toBeInTheDocument(),
    );
  });

  it("fails quietly when the clipboard write is rejected", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const user = userEvent.setup();
    setClipboard({ writeText });
    render(<SharePost url={url} title={title} labels={labels} />);

    await user.click(screen.getByRole("button", { name: labels.copy }));

    expect(writeText).toHaveBeenCalledWith(url);
    // No confirmation, no throw - the idle label stays put.
    expect(screen.getByRole("button", { name: labels.copy })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: labels.copied })).not.toBeInTheDocument();
  });
});
