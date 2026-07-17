/**
 * The "uses" inventory for the /uses page (S3-4): the hardware, editor, stack and
 * tools actually in use, grouped and honest in the spirit of uses.tech - no
 * affiliate links, no aspirational kit. Every entry here is grounded in what this
 * repo and machine really run (macOS, pnpm, Next.js, Docker, a Contabo VPS); an
 * optional one-line note says why it earns its place.
 *
 * Like content/skills.ts, the group titles and notes are translatable, so the
 * locales are kept as two parallel lists rather than a base plus overrides;
 * language-neutral product names (Next.js, TypeScript, Docker, pnpm) stay
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
    items: [{ name: "MacBook", note: "täglicher Rechner, macOS" }],
  },
  {
    title: "Editor",
    items: [
      { name: "VS Code", note: "Haupt-Editor" },
      { name: "Claude Code", note: "KI-Pair-Programming im Terminal" },
      { name: "zsh", note: "Shell im Terminal" },
    ],
  },
  {
    title: "Stack",
    items: [
      { name: "Next.js", note: "App Router" },
      { name: "TypeScript", note: "strikt, keine any-Ausnahmen" },
      { name: "React" },
      { name: "Tailwind CSS", note: "CSS-first, Version 4" },
      { name: "MDX", note: "für die Blog-Beiträge" },
    ],
  },
  {
    title: "Werkzeuge",
    items: [
      { name: "pnpm", note: "Paketmanager" },
      { name: "Git & GitHub", note: "Versionierung und Reviews" },
      { name: "Docker", note: "reproduzierbare Builds" },
      { name: "GitHub Actions", note: "CI und Deploy" },
      { name: "Vitest & Playwright", note: "Unit- und E2E-Tests" },
      { name: "ESLint & Prettier", note: "Lint und Format" },
      { name: "Nginx & Contabo VPS", note: "Hosting" },
    ],
  },
] as const;

const en: readonly UsesGroup[] = [
  {
    title: "Hardware",
    items: [{ name: "MacBook", note: "daily driver, macOS" }],
  },
  {
    title: "Editor",
    items: [
      { name: "VS Code", note: "main editor" },
      { name: "Claude Code", note: "AI pair programming in the terminal" },
      { name: "zsh", note: "shell in the terminal" },
    ],
  },
  {
    title: "Stack",
    items: [
      { name: "Next.js", note: "App Router" },
      { name: "TypeScript", note: "strict, no any escape hatches" },
      { name: "React" },
      { name: "Tailwind CSS", note: "CSS-first, version 4" },
      { name: "MDX", note: "for the blog posts" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "pnpm", note: "package manager" },
      { name: "Git & GitHub", note: "version control and reviews" },
      { name: "Docker", note: "reproducible builds" },
      { name: "GitHub Actions", note: "CI and deploy" },
      { name: "Vitest & Playwright", note: "unit and E2E tests" },
      { name: "ESLint & Prettier", note: "lint and format" },
      { name: "Nginx & Contabo VPS", note: "hosting" },
    ],
  },
] as const;

const usesGroupsByLocale: Record<Locale, readonly UsesGroup[]> = { de, en };

/** The grouped "uses" inventory for a locale. */
export function getUsesGroups(locale: Locale): readonly UsesGroup[] {
  return usesGroupsByLocale[locale];
}
