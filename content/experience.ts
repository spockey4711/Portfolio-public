/**
 * Study and work entries for the Experience/Werdegang section (P1-11). Kept
 * accurate and non-confidential; the exact wording of the working-student tasks
 * is an open question (see docs/content/content-and-voice.md) and stays general.
 *
 * Nearly every field is translatable (role, period phrasing, description), so the
 * locales are two parallel lists rather than a base plus overrides. Proper names
 * that read the same in both languages (the "Institut der deutschen Wirtschaft")
 * are kept as-is. Read via getExperience(locale). See docs/content/i18n.md.
 */

import { type Locale } from "@/lib/i18n/locale";

export type ExperienceKind = "study" | "work";

export interface ExperienceEntry {
  kind: ExperienceKind;
  /** Role or degree, e.g. "Information Systems". */
  role: string;
  /** Organisation, e.g. "University of Cologne". */
  org: string;
  /** Human-readable period, e.g. "since October 2024". */
  period: string;
  /** True while ongoing; lets the section mark current entries. */
  current?: boolean;
  /** One short, plain line on the focus. */
  description?: string;
}

// Newest/most relevant first.
const de: readonly ExperienceEntry[] = [
  {
    kind: "study",
    role: "Wirtschaftsinformatik",
    org: "Universität zu Köln",
    period: "seit Oktober 2024",
    current: true,
    description:
      "Datenanalyse, Prozessoptimierung, Softwareentwicklung, Produktmanagement und KI-Anwendungen - mit Fokus darauf, mit KI effizienter zu arbeiten.",
  },
  {
    kind: "work",
    role: "Werkstudent",
    org: "Institut der deutschen Wirtschaft",
    period: "seit März 2025",
    current: true,
    description: "Arbeit an einem Patentdatenbank-Projekt: Datenanalyse und Prozessoptimierung.",
  },
] as const;

const en: readonly ExperienceEntry[] = [
  {
    kind: "study",
    role: "Information Systems",
    org: "University of Cologne",
    period: "since October 2024",
    current: true,
    description:
      "Data analysis, process optimization, software development, product management and AI applications - focused on working more efficiently with AI.",
  },
  {
    kind: "work",
    role: "Working student",
    org: "Institut der deutschen Wirtschaft",
    period: "since March 2025",
    current: true,
    description: "Work on a patent-database project: data analysis and process optimization.",
  },
] as const;

const experienceByLocale: Record<Locale, readonly ExperienceEntry[]> = { de, en };

/** The study and work entries for a locale, newest first. */
export function getExperience(locale: Locale): readonly ExperienceEntry[] {
  return experienceByLocale[locale];
}
