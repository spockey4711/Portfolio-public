#!/usr/bin/env node
/**
 * Insert a row into the release-log table in docs/engineering/releases.md.
 *
 * Called by the tag-release.yml workflow after a release lands on master, to
 * record the promotion (runbook step 7). The row goes directly under the table
 * header, so the newest release stays on top. It is idempotent: if a row for the
 * given tag already exists, nothing is written (safe to re-run).
 *
 * Inputs come from the environment so the workflow can pass them without shell
 * quoting games:
 *   RELEASE_DATE  ISO date, e.g. 2026-07-16
 *   RELEASE_TAG   version tag, e.g. v0.4.0
 *   RELEASE_PR    PR reference, e.g. #150 (or - when unknown)
 *   RELEASE_NOTE  free-text note for the last column
 *   RELEASE_LOG   path to the doc (default docs/engineering/releases.md)
 *
 * Usage: RELEASE_DATE=... RELEASE_TAG=... RELEASE_PR=... RELEASE_NOTE=... \
 *          node scripts/append-release-log.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`missing required env ${name}`);
  return value;
}

const date = required("RELEASE_DATE");
const tag = required("RELEASE_TAG");
const pr = process.env.RELEASE_PR || "-";
const note = required("RELEASE_NOTE");
const path = process.env.RELEASE_LOG || "docs/engineering/releases.md";

const lines = readFileSync(path, "utf8").split("\n");

// Anchor on the release-log table header (Date | Version | PR | Notes) so other
// tables in the doc are never touched; the next line is the |---| divider.
const header = lines.findIndex(
  (line) => /^\|\s*Date\s*\|/.test(line) && /Version/.test(line) && /PR/.test(line),
);
if (header === -1) throw new Error(`release-log table header not found in ${path}`);

// Idempotency: bail if this tag is already recorded.
if (lines.some((line) => line.startsWith("|") && line.includes(`| ${tag} `))) {
  console.log(`${tag} already recorded in ${path} - nothing to do.`);
  process.exit(0);
}

const row = `| ${date} | ${tag} | ${pr} | ${note} |`;
lines.splice(header + 2, 0, row);
writeFileSync(path, lines.join("\n"));
console.log(`Recorded ${tag} in ${path}.`);
