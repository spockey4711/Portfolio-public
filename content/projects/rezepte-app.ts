import type { Project } from "./types";

/**
 * Rezepte App - a private recipe, weekly-plan and shopping-list web app. A lean
 * entry: it appears as a row on the projects index and has no detail page, so it
 * carries only the flat facts. `kind` and `year` come from its own repository
 * (Next.js 16 / React 19 / Supabase, first commits July 2026).
 */
export const rezepteApp: Project = {
  slug: "rezepte-app",
  name: "Rezepte App",
  tagline: "App zum Sammeln, Ordnen und Wiederfinden von Rezepten.",
  status: "live",
  kind: "web",
  year: 2026,
  order: 4,
};
