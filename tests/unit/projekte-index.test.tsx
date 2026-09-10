import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProjekteIndexPage from "@/app/(de)/projekte/page";
import { copy } from "@/content/copy";
import { getProjectKindLabels, getProjectStatusLabels, projects } from "@/content/projects";

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

// The index is a featured proof card followed by a typographic list. The card is
// the one entry whose real product shot earns the space; every other project is a
// row of facts. Before this, a card grid gave the projects without a screenshot a
// framed placeholder that read as an unfinished template (ADR-0011).
describe("Projekte index layout", () => {
  const ordered = [...projects].sort((a, b) => a.order - b.order);
  const [featured, ...rest] = ordered;
  const kindLabels = getProjectKindLabels("de");
  const statusLabels = getProjectStatusLabels("de");

  it("leads with the featured project as the first h2", () => {
    render(<ProjekteIndexPage />);

    // Directly under the page h1, so the outline has no gap: h1 -> h2, h2, ...
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings[0]).toHaveTextContent(featured!.name);
    expect(headings).toHaveLength(ordered.length);
  });

  it("shows no image and no slug placeholder outside the featured card", () => {
    render(<ProjekteIndexPage />);

    // The featured project's real screenshot is the only image on the page, and
    // the striped "[ slug ]" placeholder frame appears nowhere at all.
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAccessibleName(`${copy.projects.labels.coverAlt} ${featured!.name}`);

    for (const project of ordered) {
      expect(screen.queryByText(`[ ${project.slug} ]`)).toBeNull();
    }
  });

  it("gives every listed project its type, year, status and one line", () => {
    render(<ProjekteIndexPage />);

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(rest.length);

    for (const [i, project] of rest.entries()) {
      const row = within(rows[i]!);
      expect(row.getByRole("heading", { level: 2 })).toHaveTextContent(project.name);
      expect(row.getByText(`${kindLabels[project.kind]} · ${project.year}`)).toBeInTheDocument();
      expect(row.getByText(statusLabels[project.status])).toBeInTheDocument();
      expect(row.getByText(project.tagline)).toBeInTheDocument();
    }
  });

  it("makes a row a link only when the project has somewhere to go", () => {
    render(<ProjekteIndexPage />);

    const rows = screen.getAllByRole("listitem");

    for (const [i, project] of rest.entries()) {
      const row = within(rows[i]!);
      const links = row.queryAllByRole("link");

      if (project.detailPage) {
        // The whole row links to the detail page - the internal route wins over
        // an external live/repo link, so the case study is never bypassed.
        expect(links).toHaveLength(1);
        expect(links[0]).toHaveAttribute("href", `/projekte/${project.slug}`);
      } else if (project.links?.live ?? project.links?.demo ?? project.links?.repo) {
        expect(links).toHaveLength(1);
      } else {
        // A project with no destination stays listed and readable, but is not a
        // link that goes nowhere.
        expect(links).toHaveLength(0);
      }
    }
  });
});
