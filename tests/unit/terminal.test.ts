import { describe, expect, it } from "vitest";

import { copy } from "@/content/copy";
import { getExperience } from "@/content/experience";
import { getProjectStatusLabels, projects } from "@/content/projects";
import { getSkillGroups } from "@/content/skills";
import type { TerminalContext } from "@/lib/terminal/commands";
import { runCommand } from "@/lib/terminal/run";

const skillGroups = getSkillGroups("de");
const experience = getExperience("de");
const ctx: TerminalContext = {
  copy: copy.terminal,
  projects,
  statusLabels: getProjectStatusLabels("de"),
  skillGroups,
  experience,
};
const term = copy.terminal;

// Flatten a result's line texts for easy substring assertions.
const texts = (raw: string) => runCommand(raw, ctx).lines.map((l) => l.text);

describe("runCommand parsing", () => {
  it("returns no output for blank input", () => {
    expect(runCommand("", ctx).lines).toEqual([]);
    expect(runCommand("   ", ctx).lines).toEqual([]);
  });

  it("trims and lower-cases the command before dispatching", () => {
    expect(texts("  WHOAMI  ")).toContain(term.whoami[0]);
  });

  it("reports unknown commands with the original casing and a hint", () => {
    const { lines } = runCommand("Foo", ctx);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ tone: "faint" });
    expect(lines[0].text).toBe(`${term.notFound}: Foo - ${term.hint}`);
  });
});

describe("advertised commands", () => {
  it("help lists every advertised command in order plus the egg hint", () => {
    const lines = texts("help");
    expect(lines[0]).toBe(term.help.heading);
    for (const name of Object.keys(term.help.entries)) {
      expect(lines.some((l) => l.includes(name))).toBe(true);
    }
    expect(lines.at(-1)).toBe(term.help.eggHint);
  });

  it("whoami returns the identity lines from the copy model", () => {
    expect(texts("whoami")).toEqual([...term.whoami]);
  });

  it("projects lists every project name and its status label", () => {
    const lines = texts("projects");
    for (const project of projects) {
      expect(lines.some((l) => l.includes(project.name))).toBe(true);
    }
  });

  it("skills lists every group and its items from the shared stack", () => {
    const lines = texts("skills");
    expect(lines[0]).toBe(term.skills.heading);
    for (const group of skillGroups) {
      expect(lines.some((l) => l.includes(group.title) && l.includes(group.items[0]))).toBe(true);
    }
    expect(lines.at(-1)).toBe(term.skills.footer);
  });

  it("experience lists every entry and marks the current ones", () => {
    const lines = texts("experience");
    expect(lines[0]).toBe(term.experience.heading);
    for (const entry of experience) {
      expect(lines.some((l) => l.includes(entry.role) && l.includes(entry.org))).toBe(true);
    }
    // At least one entry is ongoing, so the current marker must appear.
    expect(lines.some((l) => l.includes(term.experience.current))).toBe(true);
    expect(lines.at(-1)).toBe(term.experience.footer);
  });

  it("contact surfaces the contact channels", () => {
    const lines = texts("contact");
    expect(lines).toEqual([term.contact.heading, ...term.contact.lines]);
  });

  it("clear signals a log reset with no output lines", () => {
    expect(runCommand("clear", ctx)).toEqual({ lines: [], clear: true });
  });
});

describe("sudo dispatch and easter eggs", () => {
  it("sudo hire-me returns the hire pitch with the grant line in green", () => {
    const { lines } = runCommand("sudo hire-me", ctx);
    expect(lines.map((l) => l.text)).toEqual([...term.hireMe]);
    // The third beat is the access grant, tone-mapped to green.
    expect(lines[2]).toMatchObject({ tone: "green" });
  });

  it("sudo rm -rf / refuses safely and stays out of help", () => {
    expect(texts("sudo rm -rf /")).toEqual([...term.rmrf]);
    expect(texts("help").join("\n")).not.toContain(term.rmrf[0]);
  });

  it("bare sudo returns the cheeky fallback, not the pitch", () => {
    expect(texts("sudo")).toEqual([term.sudo]);
  });

  it("hidden ls and coffee eggs respond but stay out of help", () => {
    expect(texts("ls")).toEqual([term.ls]);
    expect(texts("coffee")).toEqual([term.coffee]);
    expect(texts("help").join("\n")).not.toContain("coffee");
  });

  it("echo returns its joined arguments", () => {
    expect(texts("echo hallo welt")).toEqual(["hallo welt"]);
  });
});
