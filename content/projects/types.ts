/**
 * The project data model shared by every per-project file and the barrel that
 * aggregates them (content/projects/index.ts). One project lives in one file;
 * this module only holds the type and the localized status labels. See
 * docs/content/projects.md for the model and the per-project source material.
 */

import { type Locale } from "@/lib/i18n/locale";

export type ProjectStatus = "live" | "mvp" | "concept" | "experiment";

/**
 * What kind of thing a project is - the "type" column of the projects index.
 * A closed set rather than free text so both locales get a label from one place
 * and two projects can never describe the same shape differently.
 */
export type ProjectKind = "web" | "web-ios" | "ios" | "macos" | "cli";

/** Build state of a single feature in a case study's feature list. */
export type FeatureStatus = "done" | "in-progress" | "planned";

/** One feature line, shown with a status dot and an optional tier tag. */
export interface ProjectFeature {
  /** Short German label, e.g. "Coach-Portal". */
  label: string;
  status: FeatureStatus;
  /** Optional tier/context, e.g. "Pro" or "Coach". */
  tag?: string;
}

/** A named layer of the tech stack (e.g. "Backend") and its technologies. */
export interface TechLayer {
  name: string;
  items: string[];
}

/** One engineering challenge and how it was solved. */
export interface ProjectChallenge {
  title: string;
  problem: string;
  solution: string;
}

/** A single headline number (e.g. value "269", label "Commits"). */
export interface ProjectMetric {
  value: string;
  label: string;
}

/** Compact evidence used only by the curated project cards on the onepager. */
export interface ProjectOnepager {
  /** One sentence: the featured problem or a secondary project's defining decision. */
  statement: string;
  /** A deliberately short, evidenced stack for secondary cards. */
  stack?: string[];
}

/**
 * One real screenshot of the running product, shown in the detail page's
 * screenshot section. `alt` and `caption` are both required: the alt text is
 * what a screen reader gets instead of the image, and the caption is what the
 * shot is meant to prove. A shot without either would be decoration, and
 * ADR-0011 asks for evidence.
 */
export interface ProjectScreenshot {
  /** Path in public/images, e.g. "/images/fuelivo_calculator.png". */
  src: string;
  /** Describes the image itself for assistive tech; never empty. */
  alt: string;
  /** Short line under the shot saying what it shows. */
  caption: string;
}

/** One phase on the project timeline. */
export interface TimelinePhase {
  /** Period label, e.g. "März 2026". */
  period: string;
  title: string;
  description: string;
}

/**
 * The optional long-form story for a project's detail page. Every field is
 * optional so the detail page degrades gracefully: a project with only a
 * `summary` shows just that, fuelivo fills the whole thing. Kept as a nested
 * object so the flat Project fields (used by the onepager card and the index)
 * stay small and stable.
 */
export interface CaseStudy {
  /** Lead paragraph under the cover - a fuller version of the tagline. */
  summary?: string;
  /** The core idea and how the calculation works. */
  solution?: {
    intro: string;
    highlights?: string[];
  };
  features?: ProjectFeature[];
  /**
   * Real screenshots of the running product, rendered between the features and
   * the architecture. ADR-0011 makes them part of what "carried" means, so they
   * are evidence and never placeholders or generated art. Omitted or empty
   * renders no section at all.
   */
  screenshots?: readonly ProjectScreenshot[];
  /** Tech stack grouped by layer; when set, replaces the flat `stack` pills. */
  techStack?: TechLayer[];
  architecture?: {
    intro: string;
    points?: string[];
  };
  challenges?: ProjectChallenge[];
  /** Headline numbers (scope of the project). */
  metrics?: ProjectMetric[];
  timeline?: TimelinePhase[];
  /**
   * When true, the detail page mounts the project's bespoke interactive proof
   * widget under the solution (S4-5). Only fuelivo has one today; the widget is
   * wired in ProjectDetail.tsx.
   */
  interactiveProof?: boolean;
}

export interface Project {
  /** URL-safe id, no umlaut, e.g. "fuelivo". */
  slug: string;
  /** Display name. */
  name: string;
  /** One line, German, plain. */
  tagline: string;
  /** Shown as a labelled badge (text + color); see projectStatusLabels. */
  status: ProjectStatus;
  /**
   * What shape the project is - a web app, a native app, a CLI. Required, so the
   * projects index can always state a type and a new entry cannot quietly ship
   * without one; see projectKindLabels for the localized text.
   */
  kind: ProjectKind;
  /**
   * The year the work happened, taken from the project's own commit history.
   * Required for the same reason as `kind`: it is the index's second fact, and a
   * guessed year on a portfolio is worse than none.
   */
  year: number;
  /** fuelivo = true. Exactly one project is featured. */
  featured?: boolean;
  /** Sort key; fuelivo = 1, the rest by maturity and interest. */
  order: number;
  /** What real problem it solves. */
  problem?: string;
  /** What Yannik did. */
  role?: string;
  /** Compact onepager copy; the full story remains on the detail page. */
  onepager?: ProjectOnepager;
  /** Technologies (confirm before publishing). */
  stack?: string[];
  /** Honest takeaways. */
  learnings?: string[];
  links?: {
    live?: string;
    repo?: string;
    demo?: string;
  };
  media?: {
    /** Path in public/images; a placeholder is allowed. */
    cover?: string;
    /**
     * Cover orientation. "landscape" (default) renders the cover in a browser
     * window frame (a web-app product shot); "portrait" renders it in a phone
     * frame instead, so a native iOS screenshot shows in its real proportions
     * rather than cropped to the landscape frame.
     */
    orientation?: "landscape" | "portrait";
  };
  /** Gets its own /projekte/<slug> page later (P3-3). */
  detailPage?: boolean;
  /** Long-form story for the detail page; only warranted projects fill it. */
  caseStudy?: CaseStudy;
}

/**
 * Localized status labels. The text is always shown, not just the color, so the
 * badge stays legible without relying on color alone (accessibility).
 */
const projectStatusLabelsByLocale: Record<Locale, Record<ProjectStatus, string>> = {
  de: { live: "Live", mvp: "MVP", concept: "Konzept", experiment: "Experiment" },
  en: { live: "Live", mvp: "MVP", concept: "Concept", experiment: "Experiment" },
};

/** The project status labels for a locale. */
export function getProjectStatusLabels(locale: Locale): Record<ProjectStatus, string> {
  return projectStatusLabelsByLocale[locale];
}

/**
 * Localized kind labels - the "type" the projects index shows next to the year.
 * Kept here rather than in en.ts because a kind is a fact about the project, not
 * prose: both locales must describe the same shape, so one table owns both.
 */
const projectKindLabelsByLocale: Record<Locale, Record<ProjectKind, string>> = {
  de: { web: "Web-App", "web-ios": "Web & iOS", ios: "iOS-App", macos: "macOS-App", cli: "CLI" },
  en: { web: "Web app", "web-ios": "Web & iOS", ios: "iOS app", macos: "macOS app", cli: "CLI" },
};

/** The project kind labels for a locale. */
export function getProjectKindLabels(locale: Locale): Record<ProjectKind, string> {
  return projectKindLabelsByLocale[locale];
}

/**
 * Localized labels for a feature's build state. Like the status badge, the text is
 * always shown next to the color dot so the state does not rely on color alone.
 */
const featureStatusLabelsByLocale: Record<Locale, Record<FeatureStatus, string>> = {
  de: { done: "fertig", "in-progress": "in Arbeit", planned: "geplant" },
  en: { done: "done", "in-progress": "in progress", planned: "planned" },
};

/** The feature build-state labels for a locale. */
export function getFeatureStatusLabels(locale: Locale): Record<FeatureStatus, string> {
  return featureStatusLabelsByLocale[locale];
}
