import type { Project } from "./types";

/**
 * Daily Dashboard - a personal productivity dashboard, still a concept. A lean
 * entry: it appears as a row on the projects index and has no detail page, so it
 * carries only the flat facts. `kind` and `year` come from its own repository
 * (a SwiftUI macOS app, April 2026).
 */
export const dailyDashboard: Project = {
  slug: "daily-dashboard",
  name: "Daily Dashboard",
  tagline: "Persönliches Dashboard für Produktivität im Tag.",
  status: "concept",
  kind: "macos",
  year: 2026,
  order: 5,
};
