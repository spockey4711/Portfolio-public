import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Footer } from "@/components/chrome/Footer";
import { copy } from "@/content/copy";

const { footer } = copy;

describe("Footer", () => {
  it("renders the owner line with the current year", () => {
    render(<Footer locale="de" />);

    const year = String(new Date().getFullYear());
    expect(screen.getByText(new RegExp(`${year}.*${footer.owner}`))).toBeInTheDocument();
  });

  it("links every legal page correctly", () => {
    render(<Footer locale="de" />);

    const legalNav = screen.getByRole("navigation", { name: footer.label });
    for (const link of footer.legal) {
      expect(within(legalNav).getByRole("link", { name: link.label })).toHaveAttribute(
        "href",
        link.href,
      );
    }
  });

  it("exposes the page-level explore links (e.g. the blog)", () => {
    render(<Footer locale="de" />);

    const exploreNav = screen.getByRole("navigation", { name: footer.explore.label });
    for (const link of footer.explore.links) {
      expect(within(exploreNav).getByRole("link", { name: link.label })).toHaveAttribute(
        "href",
        link.href,
      );
    }
  });

  it("is exposed as the page's contentinfo landmark", () => {
    render(<Footer locale="de" />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
