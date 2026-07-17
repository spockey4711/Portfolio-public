"use client";

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import { getCopy } from "@/content/copy";
import { getExperience } from "@/content/experience";
import { getProjectStatusLabels, getProjects } from "@/content/projects";
import { getSkillGroups } from "@/content/skills";
import { type Locale } from "@/lib/i18n/locale";
import type { LineTone, OutputLine, TerminalContext } from "@/lib/terminal/commands";
import { runCommand } from "@/lib/terminal/run";
import { cn } from "@/lib/utils/cn";

/**
 * The interactive terminal (P2-1): a full content-width dark strip below the hero
 * (design handoff README section 4, "Terminal-Hint-Strip"). It echoes typed
 * commands and paints the output of the pure core in lib/terminal - all command
 * logic and German copy live there and in content/copy.ts, so this island only
 * owns input, history and presentation.
 *
 * Focus-safe by design (docs/design/accessibility.md): the input is a normal tab
 * stop with a visible focus ring, never autofocused (the strip sits below the
 * fold, so autofocus would scroll the page on load). Escape blurs it; Tab moves
 * on - no focus trap. The log is an `aria-live` region so new output is announced.
 *
 * The caret is custom: the real <input> is transparent (text and caret), and a
 * mirror span renders the typed value followed by a block cursor that blinks only
 * under `motion-safe`, so reduced-motion users get a static cursor. IBM Plex Mono
 * is monospace, so the mirror lines up with the hidden input exactly.
 */

interface Line extends OutputLine {
  /** Input echoes render with the green prompt glyph ahead of the text. */
  prompt?: boolean;
}

const TONE_CLASS: Record<LineTone, string> = {
  text: "text-term-text",
  muted: "text-term-text-muted",
  faint: "text-term-text-faint",
  green: "text-term-green",
};

export function Terminal({ locale }: { locale: Locale }) {
  // The copy, projects, skills and experience are all locale-stable, so the
  // command context is memoised once per locale and passed to the pure core.
  const term = getCopy(locale).terminal;
  const ctx: TerminalContext = useMemo(
    () => ({
      copy: getCopy(locale).terminal,
      projects: getProjects(locale),
      statusLabels: getProjectStatusLabels(locale),
      skillGroups: getSkillGroups(locale),
      experience: getExperience(locale),
    }),
    [locale],
  );

  // The log opens with the intro hint, styled like any faint output line.
  const [lines, setLines] = useState<Line[]>(() => [{ text: term.intro, tone: "faint" }]);
  const [value, setValue] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  // Entered commands (oldest first) for ArrowUp/ArrowDown recall, plus a cursor
  // into that list (null = editing a fresh line). Refs: recall must not re-render.
  const historyRef = useRef<string[]>([]);
  const cursorRef = useRef<number | null>(null);

  // Keep the newest output in view. Direct scrollTop is instant, so it needs no
  // reduced-motion guard (unlike the smooth anchor scrolling in globals.css).
  useEffect(() => {
    const log = logRef.current;
    if (log) {
      log.scrollTop = log.scrollHeight;
    }
  }, [lines]);

  function submit() {
    if (value.trim() === "") {
      return;
    }

    const result = runCommand(value, ctx);
    historyRef.current.push(value);
    cursorRef.current = null;

    if (result.clear) {
      setLines([]);
    } else {
      const echo: Line = { text: value, tone: "text", prompt: true };
      setLines((prev) => [...prev, echo, ...result.lines]);
    }
    setValue("");
  }

  // ArrowUp/ArrowDown walk the entered-command history; stepping past the newest
  // returns to an empty, fresh input line.
  function recall(step: -1 | 1) {
    const history = historyRef.current;
    if (history.length === 0) {
      return;
    }

    const current = cursorRef.current ?? history.length;
    const next = current + step;

    if (next >= history.length) {
      cursorRef.current = null;
      setValue("");
      return;
    }

    const clamped = Math.max(next, 0);
    cursorRef.current = clamped;
    setValue(history[clamped]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      recall(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      recall(1);
    } else if (event.key === "Escape") {
      inputRef.current?.blur();
    }
  }

  // Clicking the strip focuses the input, unless the user is selecting log text.
  function focusInput() {
    if (window.getSelection()?.toString()) {
      return;
    }
    inputRef.current?.focus();
  }

  return (
    <section aria-label={term.regionLabel} className="flex h-full min-w-0 flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-card border-2 border-ink bg-term-bg font-mono text-sm shadow-widget focus-within:ring-2 focus-within:ring-signal">
        {/* Chrome bar: two inert dots, one green, and the working-directory caption. */}
        <div className="flex items-center gap-2 border-b border-term-border px-4 py-3">
          <span aria-hidden className="size-2.5 rounded-full bg-term-border" />
          <span aria-hidden className="size-2.5 rounded-full bg-term-border" />
          <span aria-hidden className="size-2.5 rounded-full bg-term-green" />
          <span className="ml-2 text-[11px] tracking-[0.5px] text-term-text-faint">
            {term.title}
          </span>
        </div>

        {/* Body: the scrollable output log and the live prompt row. */}
        <div className="flex-1 cursor-text p-4 leading-[1.7]" onClick={focusInput}>
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            // A reserved min-height keeps the strip comfortably tall from first paint
            // (before any output fills it); max-h caps the growth and hands scrolling
            // to the log itself once the history runs long.
            className="max-h-[26rem] min-h-64 overflow-y-auto"
          >
            {lines.map((line, i) => (
              <div
                key={i}
                className={cn("break-words whitespace-pre-wrap", TONE_CLASS[line.tone ?? "muted"])}
              >
                {line.prompt ? <span className="text-term-green">{term.prompt} </span> : null}
                {line.text}
              </div>
            ))}
          </div>

          <div className="mt-1 flex items-start gap-2">
            <span aria-hidden className="text-term-green">
              {term.prompt}
            </span>
            <span className="relative min-w-0 flex-1 overflow-hidden">
              {/* Visible mirror: typed value plus the custom block cursor. */}
              <span aria-hidden className="block whitespace-pre text-term-text">
                {value}
                <span className="text-term-green motion-safe:animate-blink">▮</span>
              </span>
              {/* Real input, laid over the mirror and made invisible (text + caret). */}
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-label={term.inputLabel}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none"
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
