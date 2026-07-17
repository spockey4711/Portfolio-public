/**
 * Parse and dispatch a raw input line to the command registry (P2-1). This is
 * the seam the unit tests target (docs/engineering/quality-and-testing.md:
 * "terminal command parsing"). Kept separate from the handlers in ./commands so
 * parsing (trim, tokenise, unknown-command fallback) stays in one place.
 */

import { type CommandResult, type TerminalContext, commands } from "./commands";

/**
 * Runs one input line. Blank input is a no-op (a bare new prompt); an unknown
 * command yields a single faint "command not found - tippe 'help'" line. Command
 * matching is case-insensitive; the reported name keeps the original casing.
 */
export function runCommand(raw: string, ctx: TerminalContext): CommandResult {
  const input = raw.trim();
  if (input === "") {
    return { lines: [] };
  }

  const tokens = input.split(/\s+/);
  const name = tokens[0];
  const args = tokens.slice(1);
  const handler = commands[name.toLowerCase()];

  if (!handler) {
    return { lines: [{ text: `${ctx.copy.notFound}: ${name} - ${ctx.copy.hint}`, tone: "faint" }] };
  }

  return handler(args, ctx);
}
