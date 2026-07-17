import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Hero } from "@/components/sections/hero/Hero";
import { copy } from "@/content/copy";

const { hero } = copy;

describe("Hero", () => {
  it("renders the headline, kicker and sub from the content model", () => {
    render(<Hero locale="de" />);

    const { lead, accent } = hero.headline;
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(`${lead} ${accent}`);
    expect(screen.getByText(hero.kicker)).toBeInTheDocument();
    expect(screen.getByText(hero.sub)).toBeInTheDocument();
  });

  it("wires the primary and GitHub CTAs to their targets", () => {
    render(<Hero locale="de" />);

    const projects = screen.getByRole("link", { name: new RegExp(hero.ctas.primary.label) });
    expect(projects).toHaveAttribute("href", hero.ctas.primary.href);

    const github = screen.getByRole("link", { name: new RegExp(hero.ctas.github.label) });
    expect(github).toHaveAttribute("href", hero.ctas.github.href);
    // External link opens safely in a new tab.
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("does not render the live-status module (it lives in the bento grid)", () => {
    render(<Hero locale="de" />);

    expect(screen.queryByTestId("hero-live-status")).not.toBeInTheDocument();
  });

  it("exposes the #top anchor the nav wordmark links to", () => {
    const { container } = render(<Hero locale="de" />);

    expect(container.querySelector("section#top")).not.toBeNull();
  });
});
