import type { Project } from "./types";

/**
 * Mail Classifier - a local Python tool that sorts an IMAP mailbox with a
 * DistilBERT model. A lean entry: it appears as a row on the projects index and
 * has no detail page, so it carries only the flat facts. `kind` and `year` come
 * from its own repository (a Typer CLI, March 2026).
 */
export const mailClassifier: Project = {
  slug: "mail-classifier",
  name: "Mail Classifier",
  tagline: "Kleines Tool, das eingehende Mails automatisch einsortiert.",
  status: "experiment",
  kind: "cli",
  year: 2026,
  order: 6,
};
