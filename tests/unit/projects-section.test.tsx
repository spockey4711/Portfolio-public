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
    expect(headings[0].className).toContain("text-4xl");
  });

  it("keeps the onepager compact while the detail-page story stays in project data", () => {
    render(<Projects locale="de" />);

    const { labels } = copy.projects;
    expect(screen.queryByText(labels.role)).toBeNull();
    expect(screen.queryByText(labels.learnings)).toBeNull();

    for (const project of visible) {
      expect(project.problem).toBeTruthy();
      expect(project.role).toBeTruthy();
      expect(project.learnings?.length).toBeGreaterThan(0);
      expect(
        screen.getByText(project.onepager?.statement ?? "missing statement"),
      ).toBeInTheDocument();
    }
  });

  it("shows exactly three headline metrics for the featured project", () => {
    const { container } = render(<Projects locale="de" />);
    const metrics = container.querySelectorAll("#projekte dl > div");

    expect(metrics).toHaveLength(3);
    const sourceMetrics = visible[0].caseStudy?.metrics ?? [];
    for (const metric of metrics) {
      expect(
        sourceMetrics.some(
          (source) =>
            metric.textContent?.includes(source.value) && metric.textContent.includes(source.label),
        ),
      ).toBe(true);
    }
  });

  it("shows an evidenced short stack on each teaser", () => {
    render(<Projects locale="de" />);

    for (const project of visible.slice(1)) {
      expect(project.onepager?.stack?.length).toBeGreaterThan(0);
      for (const tech of project.onepager?.stack ?? []) {
        expect(screen.getByText(tech)).toBeInTheDocument();
      }
    }
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

    // The featured proof exposes its live product as the secondary CTA.
    const links = screen.getAllByRole("link", { name: new RegExp(copy.projects.liveLink, "i") });
    expect(links.some((link) => link.getAttribute("href") === "https://fuelivo.de")).toBe(true);
  });

  it("links the featured project to its detail page (P3-3)", () => {
    render(<Projects locale="de" />);

    // Each card exposes a compact Case Study CTA; assert fuelivo's resolves to
    // its detail route.
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

  it("gives the three cards distinct wide, upright and typographic shapes", () => {
    const { container } = render(<Projects locale="de" />);

    expect(container.querySelector('[data-project-shape="wide"]')).not.toBeNull();
    expect(container.querySelector('[data-project-shape="upright"]')).not.toBeNull();
    expect(container.querySelector('[data-project-shape="typographic"]')).not.toBeNull();
  });

  it("exposes the section for the nav anchor and a labelled heading", () => {
    const { container } = render(<Projects locale="de" />);

    const section = container.querySelector("#projekte");
    expect(section).not.toBeNull();
    const region = within(section as HTMLElement);
    expect(region.getByRole("heading", { level: 2 })).toHaveTextContent(copy.projects.title);
  });
});
