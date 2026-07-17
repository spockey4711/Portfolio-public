/**
 * The grouped tech stack for the Skills section (P1-10). Presented "uses"-style,
 * grouped and honest - no rating bars, no logo soup. Groups and items come from
 * docs/content/content-and-voice.md.
 *
 * Almost every field here is translatable (group titles and several practice
 * items), so the locales are kept as two parallel lists rather than a base plus
 * overrides; language-neutral technologies (Python, Git, SQL, D3, Excel) stay
 * identical across both. Read via getSkillGroups(locale). See docs/content/i18n.md.
 */

import { type Locale } from "@/lib/i18n/locale";

export interface SkillGroup {
  /** Group label, e.g. "Languages & data". */
  title: string;
  /** Technologies or practices in the group, plain text. */
  items: string[];
}

const de: readonly SkillGroup[] = [
  {
    title: "Sprachen & Daten",
    items: ["Python", "Java", "SQL", "D3"],
  },
  {
    title: "Praxis",
    items: ["App-Entwicklung", "Web-Entwicklung", "API-Arbeit", "Prozessoptimierung"],
  },
  {
    title: "Werkzeuge & Themen",
    items: ["Git", "Excel", "KI-Tools", "Local AI"],
  },
  {
    title: "Produkt & Prozess",
    items: [
      "Prozessanalyse",
      "Produktdenken",
      "Datenmodellierung",
      "Requirements",
      "Dokumentation",
    ],
  },
] as const;

const en: readonly SkillGroup[] = [
  {
    title: "Languages & data",
    items: ["Python", "Java", "SQL", "D3"],
  },
  {
    title: "Practice",
    items: ["App development", "Web development", "API work", "Process optimization"],
  },
  {
    title: "Tools & topics",
    items: ["Git", "Excel", "AI tools", "Local AI"],
  },
  {
    title: "Product & process",
    items: [
      "Process analysis",
      "Product thinking",
      "Data modeling",
      "Requirements",
      "Documentation",
    ],
  },
] as const;

const skillGroupsByLocale: Record<Locale, readonly SkillGroup[]> = { de, en };

/** The grouped tech stack for a locale. */
export function getSkillGroups(locale: Locale): readonly SkillGroup[] {
  return skillGroupsByLocale[locale];
}
