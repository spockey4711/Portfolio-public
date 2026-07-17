import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Projects } from "@/components/sections/projects/Projects";
import { copy } from "@/content/copy";
import { projects } from "@/content/projects";

// The section is IA level 1: a curated teaser of featured + TEASER_COUNT (2) more
// by order, not the full list. These derive the same slice the component renders,
// so the split stays in sync if the teaser count or ordering changes.
const ordered = [...projects].sort((a, b) => a.order - b.order);
const visible = ordered.slice(0, 3);
const hidden = ordered.slice(3);

// The Projects section (P1-8, teaser per P3-9): fuelivo is featured and first, a
// curated few follow, and a "view all" link leads into the full /projekte index.
describe("Projects section", () => {
  it("renders the featured project (fuelivo) first and prominently", () => {
    render(<Projects locale="de" />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    // The featured project leads and is the largest heading in the section.
    expect(headings[0]).toHaveTextContent("fuelivo");
    expect(headings[0].className).toContain("text-3xl");
  });

  it("shows every visible project's problem, role and learnings story", () => {
    render(<Projects locale="de" />);

    // Every card on the onepager now carries the full story (not just the featured
    // one): the featured project leads as a full-row card and the two teasers
    // beneath it render the same problem/role/learnings blocks their data holds.
    const { labels } = copy.projects;
    const withProblem = visible.filter((project) => project.problem).length;
    const withRole = visible.filter((project) => project.role).length;
    const withLearnings = visible.filter(
      (project) => project.learnings && project.learnings.length > 0,
    ).length;

    expect(screen.getAllByText(labels.problem)).toHaveLength(withProblem);
    expect(screen.getAllByText(labels.role)).toHaveLength(withRole);
    expect(screen.getAllByText(labels.learnings)).toHaveLength(withLearnings);
  });

  it("shows the featured project plus the teaser cards and hides the rest", () => {
    render(<Projects locale="de" />);

    // The curated few (featured + 2) are named as headings...
    for (const project of visible) {
      expect(screen.getByRole("heading", { name: project.name })).toBeInTheDocument();
    }
    // ...while the lower-order projects live only on the index, not here.
    expect(hidden.length).toBeGreaterThan(0);
    for (const project of hidden) {
      expect(screen.queryByRole("heading", { name: project.name })).toBeNull();
    }
  });

  it("renders a placeholder for visible projects without a cover image", () => {
    render(<Projects locale="de" />);

    // Visible projects with a cover show the image; the rest are captioned with
    // their slug placeholder. Hidden projects render neither.
    for (const project of visible) {
      const placeholder = screen.queryByText(`[ ${project.slug} ]`);
      if (project.media?.cover) {
        expect(placeholder).toBeNull();
      } else {
        expect(placeholder).toBeInTheDocument();
      }
    }
    for (const project of hidden) {
      expect(screen.queryByText(`[ ${project.slug} ]`)).toBeNull();
    }
  });

  it("links to the full projects index", () => {
    render(<Projects locale="de" />);

    const link = screen.getByRole("link", { name: new RegExp(copy.projects.viewAll, "i") });
    expect(link).toHaveAttribute("href", "/projekte");
  });

  it("renders the featured cover in a browser frame with the live host", () => {
    render(<Projects locale="de" />);

    // fuelivo has a cover, so it shows the screenshot (not the placeholder)...
    expect(screen.getByAltText("Vorschau von fuelivo")).toBeInTheDocument();
    // ...framed as a browser window captioned with its live domain.
    expect(screen.getByText("fuelivo.de")).toBeInTheDocument();
  });

  it("links the featured project out to its live site", () => {
    render(<Projects locale="de" />);

    // Several cards now carry a "Live ansehen" button (every project with a live
    // link), so scope to the one that points at fuelivo's site.
    const links = screen.getAllByRole("link", { name: /Live ansehen/i });
    expect(links.some((link) => link.getAttribute("href") === "https://fuelivo.de")).toBe(true);
  });

  it("links the featured project to its detail page (P3-3)", () => {
    render(<Projects locale="de" />);

    // Each card exposes its own "view details" link now; assert fuelivo's resolves
    // to its detail route.
    const links = screen.getAllByRole("link", {
      name: new RegExp(copy.projects.detailsLink, "i"),
    });
    expect(links.some((link) => link.getAttribute("href") === "/projekte/fuelivo")).toBe(true);
  });

  it("links a teaser card with a detail page to that page, not its repo (P3-3)", () => {
    render(<Projects locale="de" />);

    // DevBlueprint's only external link is its repo, but it has a detail page, so
    // the whole card must lead to /projekte/devblueprint rather than straight to
    // GitHub (regression: repo-only projects used to bypass their detail page).
    const links = screen.getAllByRole("link");
    expect(links.some((link) => link.getAttribute("href") === "/projekte/devblueprint")).toBe(true);
    expect(
      links.some((link) => link.getAttribute("href")?.includes("github.com/spockey4711")),
    ).toBe(false);
  });

  it("gives the featured project its own full-width row (R-2)", () => {
    const { container } = render(<Projects locale="de" />);

    // fuelivo now leads as a full-row "wide" card; the two teasers share the row
    // beneath it, one per column. So the featured cell spans both grid columns
    // while the teasers - now full rich cards themselves - stretch to equal height
    // in their own single columns (the grid's default align-items: stretch is
    // exactly what we want, no self-start opt-out).
    const section = container.querySelector("#projekte");
    expect(section?.className).toContain("md:col-span-2");
  });

  it("exposes the section for the nav anchor and a labelled heading", () => {
    const { container } = render(<Projects locale="de" />);

    const section = container.querySelector("#projekte");
    expect(section).not.toBeNull();
    const region = within(section as HTMLElement);
    expect(region.getByRole("heading", { level: 2 })).toHaveTextContent(copy.projects.title);
  });
});
