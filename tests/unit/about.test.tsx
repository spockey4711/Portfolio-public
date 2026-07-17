import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { About } from "@/components/sections/about/About";
import { copy } from "@/content/copy";

const { about } = copy;

describe("About", () => {
  it("renders the headline from the content model as the section's h2", () => {
    render(<About locale="de" />);

    const { lead, accent, tail } = about.headline;
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      `${lead} ${accent} ${tail}`,
    );
  });

  it("renders every body paragraph", () => {
    render(<About locale="de" />);

    for (const paragraph of about.body) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  it("shows the section kicker", () => {
    render(<About locale="de" />);

    expect(screen.getByText(about.title)).toBeInTheDocument();
  });

  it("exposes the #ueber anchor the nav links to, labelled by its heading", () => {
    const { container } = render(<About locale="de" />);

    const section = container.querySelector("section#ueber");
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("aria-labelledby", "ueber-title");
  });
});
