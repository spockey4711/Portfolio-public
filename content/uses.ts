/**
 * The "uses" inventory for the /uses page (S3-4): the hardware, editor, stack and
 * tools actually in use, grouped and honest in the spirit of uses.tech - no
 * affiliate links, no aspirational kit. Every entry here is grounded in what this
 * repo and machine really run (macOS, Zed, Docker, a Contabo VPS); an
 * optional one-line note says why it earns its place.
 *
 * Like content/skills.ts, the group titles and notes are translatable, so the
 * locales are kept as two parallel lists rather than a base plus overrides;
 * language-neutral product names (Zed, Warp, Docker, MDX) stay
 * identical across both. Read via getUsesGroups(locale). See docs/content/i18n.md.
 *
 * This is a living list, kept honest and current by hand - refine the exact
 * hardware and any tool that changes rather than letting it drift.
 */

import { type Locale } from "@/lib/i18n/locale";

export interface UsesItem {
  /** The product or tool name, plain text (e.g. "Next.js"). */
  name: string;
  /** An optional one-line reason it is here; kept short and honest. */
  note?: string;
}

export interface UsesGroup {
  /** Group label, e.g. "Editor". */
  title: string;
  /** The items in the group, in rough order of importance. */
  items: UsesItem[];
}

const de: readonly UsesGroup[] = [
  {
    title: "Hardware",
    items: [
      { name: "MacBook Pro M4 Pro", note: "täglicher Rechner, macOS" },
      { name: "Contabo VPS", note: "für Builds und Hosting" },
    ],
  },
  {
    title: "Editor",
    items: [
      { name: "Zed", note: "Haupt-Editor" },
      { name: "Warp", note: "Terminal-of-Choice" },
    ],
  },
  {
    title: "Stack",
    items: [
      { name: "Java", note: "Uniprojekte" },
      { name: "MDX", note: "für die Blog-Beiträge" },
    ],
  },
  {
    title: "Werkzeuge",
    items: [
      { name: "Git & GitHub", note: "Versionierung und Reviews" },
      { name: "Claude Code", note: "KI-Pair-Programming im Terminal" },
      { name: "Docker", note: "Builds auf dem VPS" },
      { name: "GitHub Actions", note: "CI und Deploy" },
    ],
  },
] as const;

const en: readonly UsesGroup[] = [
  {
    title: "Hardware",
    items: [
      { name: "MacBook Pro M4 Pro", note: "daily driver, macOS" },
      { name: "Contabo VPS", note: "for builds and hosting" },
    ],
  },
  {
    title: "Editor",
    items: [
      { name: "Zed", note: "main editor" },
      { name: "Warp", note: "terminal of choice" },
    ],
  },
  {
    title: "Stack",
    items: [
      { name: "Java", note: "university projects" },
      { name: "MDX", note: "for the blog posts" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "Git & GitHub", note: "version control and reviews" },
      { name: "Claude Code", note: "AI pair programming in the terminal" },
      { name: "Docker", note: "builds on the VPS" },
      { name: "GitHub Actions", note: "CI and deploy" },
    ],
  },
] as const;

const usesGroupsByLocale: Record<Locale, readonly UsesGroup[]> = { de, en };

/** The grouped "uses" inventory for a locale. */
export function getUsesGroups(locale: Locale): readonly UsesGroup[] {
  return usesGroupsByLocale[locale];
}
