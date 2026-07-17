/**
 * The command palette's pure core (S2-6). DOM-free helpers that build the unified
 * command registry and filter it, so the whole surface is unit testable without
 * rendering. The client island (components/widgets/command-palette) owns focus,
 * keyboard handling and presentation; it holds no command data and no German
 * literals - those live here and in content/copy.ts.
 *
 * The palette unifies two existing sources without duplicating their logic:
 *  - navigation: the same section anchors and page routes the Nav already uses
 *    (content/copy.ts nav.links / nav.pageLinks), plus the home route and the
 *    full projects index;
 *  - commands: the advertised terminal set (content/copy.ts terminal.help.entries),
 *    dispatched at run time through runCommand (lib/terminal/run).
 *
 * The registry is a flat list, which is what let S4-2 (dark mode) drop in the
 * theme toggle as one `action` entry without reshaping this module.
 */

import type { copy } from "@/content/copy";

/**
 * Window event that opens the palette. Any trigger (e.g. the Nav's ⌘K chip)
 * dispatches it and the palette island listens, so the two stay decoupled - no
 * shared state, no magic string duplicated across islands.
 */
export const COMMAND_PALETTE_OPEN_EVENT = "command-palette:open";

/**
 * `navigate` closes the palette and routes; `run` dispatches a terminal command;
 * `action` runs a client-side side effect (e.g. toggling the theme).
 */
export type PaletteKind = "navigate" | "run" | "action";

/** Stable action identifiers the client island maps to a handler (S4-2). */
export type PaletteAction = "toggle-theme";

export interface PaletteCommand {
  /** Stable, unique key (`nav:/#projekte`, `run:whoami`) - also the React key. */
  id: string;
  /** German primary label shown in the list. */
  label: string;
  /** German secondary line (the terminal command's help text); absent for nav. */
  description?: string;
  /** Right-aligned tag: section anchor, page route, terminal command, or action. */
  hint: string;
  kind: PaletteKind;
  /** navigate: the target href (`/`, `/#projekte`, `/blog`, `/projekte`). */
  href?: string;
  /** run: the raw command string dispatched through runCommand. */
  command?: string;
  /** action: the side effect the client island performs on selection. */
  action?: PaletteAction;
}

/** The copy slices the builder needs - injected so tests can pass their own. */
export type PaletteCopy = Pick<typeof copy, "nav" | "terminal" | "commandPalette">;

/**
 * Assemble the unified, ordered command list from existing copy. Navigation comes
 * first (home, the section anchors, the projects index, the blog), then the
 * advertised terminal commands, then the standalone actions (the theme toggle).
 * Section anchors (hrefs with a `#`) are tagged differently from page routes so a
 * selection's outcome is never ambiguous (ADR-0005, same rationale as the Nav's
 * divider).
 */
export function buildPaletteCommands(copy: PaletteCopy): PaletteCommand[] {
  const { nav, terminal, commandPalette } = copy;
  const { hints } = commandPalette;

  const navTargets = [
    commandPalette.navigate.home,
    ...nav.links,
    commandPalette.navigate.projects,
    ...nav.pageLinks,
  ];

  const navigate: PaletteCommand[] = navTargets.map(({ href, label }) => ({
    id: `nav:${href}`,
    label,
    hint: href.includes("#") ? hints.section : hints.page,
    kind: "navigate",
    href,
  }));

  const run: PaletteCommand[] = Object.entries(terminal.help.entries).map(
    ([command, description]) => ({
      id: `run:${command}`,
      label: command,
      description,
      hint: hints.command,
      kind: "run",
      command,
    }),
  );

  const action: PaletteCommand[] = [
    {
      id: "action:toggle-theme",
      label: commandPalette.actions.theme,
      hint: hints.action,
      kind: "action",
      action: "toggle-theme",
    },
  ];

  return [...navigate, ...run, ...action];
}

/**
 * Case-insensitive substring filter over label, description and command, in the
 * original order. A blank query returns everything (the palette opens showing the
 * full list). Matching the raw command string lets "sudo" surface `sudo hire-me`.
 */
export function filterCommands(
  commands: readonly PaletteCommand[],
  query: string,
): PaletteCommand[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") {
    return [...commands];
  }

  return commands.filter((command) => {
    const haystack = [command.label, command.description, command.command]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}
