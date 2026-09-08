import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectDetail } from "@/components/sections/projects/ProjectDetail";
import { copy, getCopy } from "@/content/copy";
import { detailProjects, getDetailProject } from "@/content/projects";

// The dedicated project page (P3-3): renders the warranted project's story as a
// standalone route with a back link, the fields it has, and its outbound links.
describe("ProjectDetail", () => {
  const project = detailProjects[0];

  it("renders the project name as the h1 with its tagline", () => {
    render(<ProjectDetail project={project} locale="de" />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(project.name);
    expect(screen.getByText(project.tagline)).toBeInTheDocument();
  });

  it("links back to the projects index (its parent)", () => {
    render(<ProjectDetail project={project} locale="de" />);

    const back = screen.getByRole("link", { name: copy.projects.detail.backToProjects.label });
    expect(back).toHaveAttribute("href", copy.projects.detail.backToProjects.href);
  });

  it("shows the problem, role and learnings fields it has", () => {
    render(<ProjectDetail project={project} locale="de" />);
    const { labels } = copy.projects;

    // "Problem" is both the section eyebrow and the inline label inside each
    // challenge card of a full case study, so it can appear more than once.
    if (project.problem) expect(screen.getAllByText(labels.problem).length).toBeGreaterThan(0);
    if (project.role) expect(screen.getByText(labels.role)).toBeInTheDocument();
    if (project.learnings?.length) expect(screen.getByText(labels.learnings)).toBeInTheDocument();
  });

  it("links out to the live site when present", () => {
    render(<ProjectDetail project={project} locale="de" />);

    if (project.links?.live) {
      const live = screen.getByRole("link", {
        name: new RegExp(copy.projects.detail.links.live, "i"),
      });
      expect(live).toHaveAttribute("href", project.links.live);
      expect(live).toHaveAttribute("target", "_blank");
      expect(live).toHaveAttribute("rel", "noreferrer");
    }
  });

  it("omits fields a project does not have", () => {
    // A lean project (no case study either) shows neither the problem section
    // nor the learnings section.
    render(
      <ProjectDetail
        project={{ ...project, problem: undefined, learnings: undefined, caseStudy: undefined }}
        locale="de"
      />,
    );
    const { labels } = copy.projects;

    expect(screen.queryByText(labels.problem)).toBeNull();
    expect(screen.queryByText(labels.learnings)).toBeNull();
  });

  it("mounts the interactive proof when the case study opts in (S4-5)", () => {
    render(<ProjectDetail project={project} locale="de" />);

    // fuelivo's case study sets interactiveProof, so the proof widget renders.
    if (project.caseStudy?.interactiveProof) {
      expect(screen.getByText(copy.projects.proof.eyebrow)).toBeInTheDocument();
    }
  });

  it("omits the proof when the case study does not opt in", () => {
    render(
      <ProjectDetail
        project={{
          ...project,
          caseStudy: project.caseStudy
            ? { ...project.caseStudy, interactiveProof: false }
            : undefined,
        }}
        locale="de"
      />,
    );

    expect(screen.queryByText(copy.projects.proof.eyebrow)).toBeNull();
  });

  // ADR-0011: a carried project shows real screenshots between the features and
  // the architecture. The list is empty everywhere today, so these render from a
  // fixture case study spread onto the real project.
  describe("screenshots section (ADR-0011)", () => {
    const screenshots = [
      { src: "/images/shot-a.png", alt: "Der Rechner mit Beispielwerten", caption: "Der Rechner." },
      { src: "/images/shot-b.png", alt: "Das Coach-Portal mit Kaderliste", caption: "Das Portal." },
    ];
    const withShots = {
      ...project,
      caseStudy: { ...project.caseStudy, screenshots },
    };

    it("renders a captioned figure per screenshot", () => {
      render(<ProjectDetail project={withShots} locale="de" />);

      expect(screen.getByText(copy.projects.labels.screenshots)).toBeInTheDocument();
      for (const shot of screenshots) {
        // The alt text carries the image for assistive tech, the caption says
        // what the shot proves - both are required, and they differ.
        expect(screen.getByRole("img", { name: shot.alt })).toBeInTheDocument();
        expect(screen.getByText(shot.caption)).toBeInTheDocument();
      }
    });

    it("sits between the features and the architecture", () => {
      render(<ProjectDetail project={withShots} locale="de" />);
      const { labels } = copy.projects;

      const order = [labels.features, labels.screenshots, labels.architecture].map((label) =>
        screen.getByText(label),
      );
      for (const [index, heading] of order.slice(1).entries()) {
        expect(
          order[index]!.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
      }
    });

    it("renders nothing when the list is empty", () => {
      render(
        <ProjectDetail
          project={{ ...project, caseStudy: { ...project.caseStudy, screenshots: [] } }}
          locale="de"
        />,
      );

      expect(screen.queryByText(copy.projects.labels.screenshots)).toBeNull();
    });

    it("renders nothing when the field is missing", () => {
      // The real content today: a case study with no screenshots key at all.
      render(<ProjectDetail project={project} locale="de" />);

      expect(project.caseStudy?.screenshots).toBeUndefined();
      expect(screen.queryByText(copy.projects.labels.screenshots)).toBeNull();
    });
  });

  // S5-1b: the English detail route renders the same body with locale="en", so
  // its chrome (back link, eyebrow) and interactive proof must read in English
  // with no German leakage.
  describe("in English (S5-1b)", () => {
    const enProject = getDetailProject(project.slug, "en");
    const enCopy = getCopy("en").projects;

    it("renders the English back link and section eyebrow", () => {
      render(<ProjectDetail project={enProject!} locale="en" />);

      const back = screen.getByRole("link", { name: enCopy.detail.backToProjects.label });
      expect(back).toHaveAttribute("href", enCopy.detail.backToProjects.href);
      expect(screen.getByText(enCopy.detail.eyebrow)).toBeInTheDocument();
    });

    it("localizes the interactive proof when the case study opts in (S4-5)", () => {
      render(<ProjectDetail project={enProject!} locale="en" />);

      if (enProject!.caseStudy?.interactiveProof) {
        expect(screen.getByText(enCopy.proof.eyebrow)).toBeInTheDocument();
        // The German proof eyebrow must not leak onto the English page.
        expect(screen.queryByText(copy.projects.proof.eyebrow)).toBeNull();
      }
    });
  });
});
