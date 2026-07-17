/**
 * The interactive terminal's command core (P2-1). Pure, DOM-free command
 * handlers: each takes the parsed args plus a context (the locale's copy model,
 * the project data and the status labels) and returns output lines, so the whole
 * surface is unit testable without rendering. The client island
 * (components/widgets/terminal) only echoes input, dispatches through `runCommand`
 * (./run) and paints the returned lines - it holds no command logic and no
 * language literals.
 *
 * A line's `tone` maps to a `--term-*` colour in the component: `text` (bright
 * values), `muted` (default body), `faint` (secondary / errors), `green`
 * (prompt / "ok"). See docs/design/handoff/README.md (Terminal / Dark-Kontext).
 */

import type { Copy } from "@/content/copy";
import { type ExperienceEntry } from "@/content/experience";
import { type Project, type ProjectStatus } from "@/content/projects";
import { type SkillGroup } from "@/content/skills";

export type LineTone = "text" | "muted" | "faint" | "green";

export interface OutputLine {
  text: string;
  tone?: LineTone;
}

export interface CommandResult {
  lines: OutputLine[];
  /** `clear` empties the log instead of appending output. */
  clear?: boolean;
}

type TerminalCopy = Copy["terminal"];

/** Injected so handlers stay pure - tests can pass their own copy/projects. */
export interface TerminalContext {
  copy: TerminalCopy;
  projects: readonly Project[];
  /** Localized project status labels, so the pure core holds no locale data. */
  statusLabels: Record<ProjectStatus, string>;
  /** The grouped tech stack, shared with the Skills section (content/skills.ts). */
  skillGroups: readonly SkillGroup[];
  /** Study and work entries, shared with the Experience section (content/experience.ts). */
  experience: readonly ExperienceEntry[];
}

export type CommandHandler = (args: readonly string[], ctx: TerminalContext) => CommandResult;

const line = (text: string, tone: LineTone = "muted"): OutputLine => ({ text, tone });

/**
 * The command registry. Keys are the first input token (lower-cased); `sudo`
 * dispatches on its sub-argument so `sudo hire-me` (the pitch) and `sudo rm ...`
 * (a safe refusal) are single conceptual commands. Handlers listed in
 * `copy.terminal.help.entries` are the advertised set; `ls`/`coffee`/`echo` and
 * the `sudo` variants are hidden easter eggs.
 */
export const commands: Record<string, CommandHandler> = {
  help: (_args, { copy }) => ({
    lines: [
      line(copy.help.heading, "text"),
      ...Object.entries(copy.help.entries).map(([name, description]) =>
        line(`  ${name.padEnd(14)}${description}`),
      ),
      line(copy.help.eggHint, "faint"),
    ],
  }),

  whoami: (_args, { copy }) => ({
    lines: [line(copy.whoami[0], "text"), line(copy.whoami[1]), line(copy.whoami[2], "green")],
  }),

  projects: (_args, { copy, projects, statusLabels }) => ({
    lines: [
      line(copy.projects.heading, "text"),
      ...projects.map((project) =>
        line(`  ${project.name.padEnd(18)}${statusLabels[project.status]}`),
      ),
      line(copy.projects.footer, "faint"),
    ],
  }),

  skills: (_args, { copy, skillGroups }) => ({
    lines: [
      line(copy.skills.heading, "text"),
      ...skillGroups.map((group) => line(`  ${group.title.padEnd(20)}${group.items.join(" · ")}`)),
      line(copy.skills.footer, "faint"),
    ],
  }),

  experience: (_args, { copy, experience }) => ({
    lines: [
      line(copy.experience.heading, "text"),
      ...experience.flatMap((entry) => {
        const period = entry.current
          ? `${entry.period} · ${copy.experience.current}`
          : entry.period;
        return [line(`  ${entry.role} - ${entry.org}`, "text"), line(`    ${period}`)];
      }),
      line(copy.experience.footer, "faint"),
    ],
  }),

  contact: (_args, { copy }) => ({
    lines: [line(copy.contact.heading, "text"), ...copy.contact.lines.map((l) => line(l, "text"))],
  }),

  // `sudo hire-me` is the payoff pitch (tone-mapped per line); any `sudo rm ...`
  // gets a safe refusal; every other `sudo` gets the cheeky fallback.
  sudo: (args, { copy }) => {
    if (args[0] === "hire-me") {
      const tones: readonly LineTone[] = ["faint", "muted", "green", "text"];
      return { lines: copy.hireMe.map((l, i) => line(l, tones[i] ?? "text")) };
    }
    if (args[0] === "rm") {
      return { lines: copy.rmrf.map((l) => line(l, "faint")) };
    }
    return { lines: [line(copy.sudo)] };
  },

  clear: () => ({ lines: [], clear: true }),

  // Hidden easter eggs.
  ls: (_args, { copy }) => ({ lines: [line(copy.ls)] }),
  coffee: (_args, { copy }) => ({ lines: [line(copy.coffee, "green")] }),
  echo: (args) => ({ lines: [line(args.join(" "))] }),
};
