import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProjekteIndexPage from "@/app/(de)/projekte/page";
import { copy } from "@/content/copy";
import { projects } from "@/content/projects";

// The projects index (IA level 2, P3-9): unlike the onepager teaser it lists every
// project, carries the standalone-page chrome, and links back up to the section.
describe("Projekte index page", () => {
  const { index } = copy.projects;

  it("renders the index title as the h1 with its intro", () => {
    render(<ProjekteIndexPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(index.title);
    expect(screen.getByText(index.intro)).toBeInTheDocument();
  });

  it("lists every project, not just the teaser", () => {
    render(<ProjekteIndexPage />);

    expect(projects.length).toBeGreaterThan(3);
    for (const project of projects) {
      expect(screen.getByRole("heading", { name: project.name })).toBeInTheDocument();
    }
  });

  it("links back up to the onepager projects section", () => {
    render(<ProjekteIndexPage />);

    const back = screen.getByRole("link", { name: index.backToOnepager.label });
    // next/link renders the { pathname, hash } object as the "/#projekte" href.
    expect(back).toHaveAttribute("href", index.backToOnepager.href);
  });
});
