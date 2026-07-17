import { describe, expect, it } from "vitest";

import { copy, getCopy } from "@/content/copy";
import { buildPaletteCommands, filterCommands } from "@/lib/command-palette/commands";

const commands = buildPaletteCommands(copy);

describe("buildPaletteCommands", () => {
  it("lists navigation before terminal commands", () => {
    const firstRun = commands.findIndex((c) => c.kind === "run");
    const lastNavigate = commands.map((c) => c.kind).lastIndexOf("navigate");
    expect(lastNavigate).toBeLessThan(firstRun);
  });

  it("includes the home route, the section anchors, the projects index and the blog", () => {
    const hrefs = commands.filter((c) => c.kind === "navigate").map((c) => c.href);
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/projekte");
    expect(hrefs).toContain("/blog");
    for (const { href } of copy.nav.links) {
      expect(hrefs).toContain(href);
    }
  });

  it("tags section anchors and page routes differently", () => {
    const projekteSection = commands.find((c) => c.href === "/#projekte");
    const blogPage = commands.find((c) => c.href === "/blog");
    expect(projekteSection?.hint).toBe(copy.commandPalette.hints.section);
    expect(blogPage?.hint).toBe(copy.commandPalette.hints.page);
  });

  it("surfaces every advertised terminal command as a run entry", () => {
    const runCommands = commands.filter((c) => c.kind === "run").map((c) => c.command);
    expect(runCommands).toEqual(Object.keys(copy.terminal.help.entries));
    // The German help text rides along as the secondary description.
    const whoami = commands.find((c) => c.command === "whoami");
    expect(whoami?.description).toBe(copy.terminal.help.entries.whoami);
  });

  it("appends the theme toggle as the last action entry", () => {
    const theme = commands.find((c) => c.id === "action:toggle-theme");
    expect(theme).toMatchObject({
      kind: "action",
      action: "toggle-theme",
      label: copy.commandPalette.actions.theme,
      hint: copy.commandPalette.hints.action,
    });
    // Actions come after both navigation and terminal commands.
    const lastRun = commands.map((c) => c.kind).lastIndexOf("run");
    const firstAction = commands.findIndex((c) => c.kind === "action");
    expect(lastRun).toBeLessThan(firstAction);
  });

  it("gives every entry a unique id", () => {
    const ids = commands.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("builds English navigation hrefs from the English copy (no /en leakage to German paths)", () => {
    const enCommands = buildPaletteCommands(getCopy("en"));
    const enHrefs = enCommands.filter((c) => c.kind === "navigate").map((c) => c.href);
    // The English palette routes into the /en tree, not the German canonical paths.
    expect(enHrefs).toContain("/en");
    expect(enHrefs).toContain("/en/projects");
    expect(enHrefs).toContain("/en/blog");
    expect(enHrefs).not.toContain("/projekte");
    expect(enHrefs).not.toContain("/blog");
  });
});

describe("filterCommands", () => {
  it("returns everything for a blank query", () => {
    expect(filterCommands(commands, "")).toHaveLength(commands.length);
    expect(filterCommands(commands, "   ")).toHaveLength(commands.length);
  });

  it("matches labels case-insensitively", () => {
    const result = filterCommands(commands, "PROJEKTE");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => `${c.label} ${c.command ?? ""}`.toLowerCase().includes("projekte")));
  });

  it("matches the raw command string so 'sudo' surfaces the multi-word command", () => {
    const result = filterCommands(commands, "sudo");
    expect(result.map((c) => c.command)).toContain("sudo hire-me");
  });

  it("preserves the original order of matches", () => {
    const filtered = filterCommands(commands, "e");
    const filteredIds = filtered.map((c) => c.id);
    const expected = commands.filter((c) => filteredIds.includes(c.id)).map((c) => c.id);
    expect(filteredIds).toEqual(expected);
  });

  it("returns nothing when the query matches no entry", () => {
    expect(filterCommands(commands, "zzz-nope")).toHaveLength(0);
  });
});
