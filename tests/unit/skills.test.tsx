import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skills } from "@/components/sections/skills/Skills";
import { copy } from "@/content/copy";
import { getSkillGroups } from "@/content/skills";

const skillGroups = getSkillGroups("de");

describe("Skills", () => {
  it("shows the section kicker", () => {
    render(<Skills locale="de" />);

    expect(screen.getAllByText(copy.skills.title).length).toBeGreaterThan(0);
  });

  it("renders every group as a term with all its items", () => {
    render(<Skills locale="de" />);

    for (const group of skillGroups) {
      const term = screen.getByText(group.title).closest("dt");
      expect(term).not.toBeNull();

      const description = term?.parentElement?.querySelector("dd");
      expect(description).not.toBeNull();

      for (const item of group.items) {
        expect(within(description as HTMLElement).getByText(item)).toBeInTheDocument();
      }
    }
  });

  it("exposes the #skills anchor, labelled by its heading", () => {
    const { container } = render(<Skills locale="de" />);

    const section = container.querySelector("section#skills");
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("aria-labelledby", "skills-title");
  });
});
