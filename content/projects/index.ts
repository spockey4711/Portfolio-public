/**
 * The projects barrel: aggregates the per-project files into the stable public
 * API consumed via "@/content/projects" (the Projects section, the
 * /projekte/<slug> pages, the sitemap and the terminal). One project = one file
 * in this directory; this module is the single place that decides ordering and
 * membership. See docs/content/projects.md for the model.
 */

import { type Locale } from "@/lib/i18n/locale";

import { aurelian } from "./aurelian";
import { dailyDashboard } from "./daily-dashboard";
import { devblueprint } from "./devblueprint";
import { type CaseStudyOverride, enProjectContent } from "./en";
import { fuelivo } from "./fuelivo";
import { mailClassifier } from "./mail-classifier";
import { rezepteApp } from "./rezepte-app";

import type { CaseStudy, Project } from "./types";

export type {
  CaseStudy,
  FeatureStatus,
  Project,
  ProjectChallenge,
  ProjectFeature,
  ProjectKind,
  ProjectMetric,
  ProjectOnepager,
  ProjectScreenshot,
  ProjectStatus,
  TechLayer,
  TimelinePhase,
} from "./types";
export { getFeatureStatusLabels, getProjectKindLabels, getProjectStatusLabels } from "./types";

/**
 * All projects in German (the canonical base), sorted by `order` so the featured
 * entry is first (the Projects section relies on that). This explicit list is the
 * aggregation point where the cross-project invariants - unique slugs/orders,
 * exactly one featured - are enforced by tests/unit/projects.test.ts. Rendering
 * reads a locale-resolved view via getProjects(locale); slugs and ordering are
 * locale-invariant, so param generation and the sitemap use this list directly.
 */
export const projects: readonly Project[] = [
  fuelivo,
  aurelian,
  devblueprint,
  rezepteApp,
  dailyDashboard,
  mailClassifier,
].sort((a, b) => a.order - b.order);

/**
 * Overlay an English list onto its German base element-by-element, so an override
 * supplies only the translatable keys of each item (e.g. a feature's `label`) and
 * inherits the locale-invariant ones (its `status`) from the base. The two arrays
 * are authored in lockstep, so they share length and order; a missing override
 * entry simply leaves the German item untouched.
 */
function overlayList<T>(base: readonly T[], override: readonly Partial<T>[]): T[] {
  return base.map((item, index) => ({ ...item, ...override[index] }));
}

/**
 * Deep-merge an English case-study override onto the German base. The override
 * carries the translated prose; the only facts inherited from the base are each
 * feature's build-state (`status`) and the `interactiveProof` flag, which are
 * truly locale-invariant. Everything else is translated - including the tech
 * stack (its layer names and descriptive items are German prose) and the metric
 * values (which use German number formatting, e.g. "16.100" -> "16,100"). Fully
 * translatable lists are replaced wholesale; the feature and screenshot lists are
 * overlaid so their inherited facts - a feature's `status`, a screenshot's `src` -
 * never have to be repeated in en.ts.
 */
function mergeCaseStudy(base: CaseStudy, override: CaseStudyOverride): CaseStudy {
  const merged: CaseStudy = { ...base };
  if (override.summary !== undefined) merged.summary = override.summary;
  if (override.solution && base.solution) {
    merged.solution = { ...base.solution, ...override.solution };
  }
  if (override.architecture && base.architecture) {
    merged.architecture = { ...base.architecture, ...override.architecture };
  }
  if (override.features && base.features) {
    merged.features = overlayList(base.features, override.features);
  }
  if (override.screenshots && base.screenshots) {
    merged.screenshots = overlayList(base.screenshots, override.screenshots);
  }
  if (override.techStack) merged.techStack = override.techStack;
  if (override.challenges) merged.challenges = override.challenges;
  if (override.metrics) merged.metrics = override.metrics;
  if (override.timeline) merged.timeline = override.timeline;
  return merged;
}

/**
 * Resolve a project's translatable fields for a locale. German is the base and is
 * returned untouched; English shallow-merges the slug's flat fields from
 * content/projects/en.ts and deep-merges its case-study prose onto the German
 * base (see docs/content/i18n.md and the en.ts header).
 */
function localizeProject(project: Project, locale: Locale): Project {
  if (locale === "de") return project;
  const override = enProjectContent[project.slug];
  if (!override) return project;
  const { caseStudy: caseStudyOverride, ...flat } = override;
  const localized: Project = { ...project, ...flat };
  if (caseStudyOverride && project.caseStudy) {
    localized.caseStudy = mergeCaseStudy(project.caseStudy, caseStudyOverride);
  }
  return localized;
}

/** All projects for a locale, ordered (featured first). */
export function getProjects(locale: Locale): readonly Project[] {
  return projects.map((project) => localizeProject(project, locale));
}

/**
 * The projects that warrant their own /projekte/<slug> page (P3-3). The single
 * source of truth shared by the route's generateStaticParams and the sitemap;
 * membership and slugs are locale-invariant, so this list stays language-neutral.
 */
export const detailProjects: readonly Project[] = projects.filter((project) => project.detailPage);

/** The detail-page project for a slug in a locale, or undefined if none is warranted. */
export function getDetailProject(slug: string, locale: Locale): Project | undefined {
  const project = detailProjects.find((entry) => entry.slug === slug);
  return project ? localizeProject(project, locale) : undefined;
}
