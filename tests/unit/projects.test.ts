import { describe, expect, it } from "vitest";

import {
  detailProjects,
  getDetailProject,
  getProjectKindLabels,
  getProjectStatusLabels,
  projects,
  type ProjectKind,
  type ProjectStatus,
} from "@/content/projects";

// Labels are locale-invariant in shape; the German set is enough to assert the
// per-status mapping is total (slugs and ordering are locale-invariant too).
const projectStatusLabels = getProjectStatusLabels("de");

// The Projects section (P1-8) relies on these invariants: fuelivo is featured
// and first, slugs/orders are unique, and every status has a German label.
describe("projects content", () => {
  it("has exactly one featured project and it is fuelivo", () => {
    const featured = projects.filter((project) => project.featured);
    expect(featured).toHaveLength(1);
    expect(featured[0]?.slug).toBe("fuelivo");
  });

  it("lists the featured project first by order", () => {
    const byOrder = [...projects].sort((a, b) => a.order - b.order);
    expect(byOrder[0]?.featured).toBe(true);
  });

  it("uses unique slugs and orders", () => {
    const slugs = projects.map((project) => project.slug);
    const orders = projects.map((project) => project.order);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("uses url-safe slugs without umlauts", () => {
    for (const project of projects) {
      expect(project.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("has a German label for every project status", () => {
    for (const project of projects) {
      expect(projectStatusLabels[project.status]).toBeTruthy();
    }
  });

  it("maps every status value to a label", () => {
    const statuses: ProjectStatus[] = ["live", "mvp", "concept", "experiment"];
    for (const status of statuses) {
      expect(projectStatusLabels[status]).toBeTruthy();
    }
  });
});

// The projects index states a type and a year for every entry. Both are facts
// taken from the project's own repository, so the guard here is that they are
// present and plausible in both locales rather than guessed or left blank.
describe("project type and year", () => {
  it("maps every kind value to a label in both locales", () => {
    const kinds: ProjectKind[] = ["web", "web-ios", "ios", "macos", "cli"];
    for (const locale of ["de", "en"] as const) {
      const labels = getProjectKindLabels(locale);
      for (const kind of kinds) {
        expect(labels[kind]).toBeTruthy();
      }
    }
  });

  it("gives every project a labelled kind and a plausible year", () => {
    for (const project of projects) {
      expect(getProjectKindLabels("de")[project.kind]).toBeTruthy();
      expect(getProjectKindLabels("en")[project.kind]).toBeTruthy();
      // Wide but real bounds: the work exists and is not dated in the future.
      expect(project.year).toBeGreaterThanOrEqual(2020);
      expect(project.year).toBeLessThanOrEqual(new Date().getFullYear());
    }
  });
});

// The detail-page selection (P3-3): only flagged projects get a /projekte/<slug>
// route, and each carries enough to justify a page (a tagline plus at least one
// outbound link so the page is never a dead end).
describe("project detail pages", () => {
  it("exposes exactly the flagged projects via detailProjects", () => {
    expect(detailProjects.map((project) => project.slug)).toEqual(
      projects.filter((project) => project.detailPage).map((project) => project.slug),
    );
    expect(detailProjects.length).toBeGreaterThan(0);
  });

  it("resolves a warranted slug and rejects an unwarranted one", () => {
    for (const project of detailProjects) {
      expect(getDetailProject(project.slug, "de")?.slug).toBe(project.slug);
    }
    // A project without the flag has no page.
    const withoutPage = projects.find((project) => !project.detailPage);
    if (withoutPage) {
      expect(getDetailProject(withoutPage.slug, "de")).toBeUndefined();
    }
    expect(getDetailProject("does-not-exist", "de")).toBeUndefined();
  });

  it("gives every detail page a tagline and at least one outbound link", () => {
    for (const project of detailProjects) {
      expect(project.tagline).toBeTruthy();
      const links = project.links ?? {};
      expect(Boolean(links.live || links.repo || links.demo)).toBe(true);
    }
  });
});

// The English detail route (S5-1b) resolves via getDetailProject(slug, "en"),
// which deep-merges the translated case-study prose onto the German base while
// inheriting the locale-invariant facts, so the page reads in English with no
// German leakage and the two locales can never drift on the shared facts.
describe("English project localization (S5-1b)", () => {
  it("translates the case-study prose for every detail page", () => {
    for (const project of detailProjects) {
      const de = getDetailProject(project.slug, "de");
      const en = getDetailProject(project.slug, "en");
      // Every warranted project ships a full, translated case study.
      expect(en?.caseStudy?.summary).toBeTruthy();
      expect(en?.caseStudy?.summary).not.toBe(de?.caseStudy?.summary);
      expect(en?.caseStudy?.solution?.intro).not.toBe(de?.caseStudy?.solution?.intro);
    }
  });

  it("inherits the locale-invariant feature build-states from the German base", () => {
    for (const project of detailProjects) {
      const de = getDetailProject(project.slug, "de");
      const en = getDetailProject(project.slug, "en");
      // Feature `status` and `interactiveProof` are the only inherited facts; the
      // labels are overlaid element-wise, so the two feature lists share length
      // and order and only the status carries over untouched.
      expect(en?.caseStudy?.features?.map((feature) => feature.status)).toEqual(
        de?.caseStudy?.features?.map((feature) => feature.status),
      );
      expect(en?.caseStudy?.interactiveProof).toBe(de?.caseStudy?.interactiveProof);
    }
  });

  it("translates the tech stack and reformats metric values", () => {
    for (const project of detailProjects) {
      const de = getDetailProject(project.slug, "de");
      const en = getDetailProject(project.slug, "en");
      // The tech stack carries German prose (layer names, descriptive items), so
      // it is translated, not inherited; the layer count stays the same.
      expect(en?.caseStudy?.techStack?.length).toBe(de?.caseStudy?.techStack?.length);
      expect(en?.caseStudy?.techStack).not.toEqual(de?.caseStudy?.techStack);
      // Metric values use German thousands separators ("."), reformatted for
      // English (","), so no English metric value may contain a German separator.
      for (const metric of en?.caseStudy?.metrics ?? []) {
        expect(metric.value).not.toMatch(/\d\.\d{3}/);
      }
    }
  });
});
