"use client";

import { useRouter } from "next/navigation";
import {
  Fragment,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getCopy } from "@/content/copy";
import { getExperience } from "@/content/experience";
import { getProjectStatusLabels, getProjects } from "@/content/projects";
import { getSkillGroups } from "@/content/skills";
import { useTheme } from "@/lib/chrome/use-theme";
import {
  COMMAND_PALETTE_OPEN_EVENT,
  type PaletteCommand,
  buildPaletteCommands,
  filterCommands,
} from "@/lib/command-palette/commands";
import { type Locale } from "@/lib/i18n/locale";
import type { LineTone, OutputLine, TerminalContext } from "@/lib/terminal/commands";
import { runCommand } from "@/lib/terminal/run";
import { cn } from "@/lib/utils/cn";

/**
 * The command palette (S2-6): a ⌘K/Ctrl-K launcher that unifies section/route
 * navigation and the terminal command parser. Opening it is global (a document
 * keydown for ⌘K plus a decoupled `command-palette:open` window event the Nav
 * trigger dispatches), so it works on every route, including sub-routes.
 *
 * It is a controlled `role="dialog"` overlay rather than a native `<dialog>`:
 * jsdom implements neither `showModal` nor the dialog's Escape/focus-restore, so a
 * controlled overlay is both fully testable and fully under our control. The a11y
 * outcome is the same as a native modal - `aria-modal`, Escape always closes,
 * focus is restored to the opener, and Tab is contained so a keyboard user is
 * never dropped behind the overlay (escapable at any time via Escape, so it is
 * never a dead-end trap; docs/design/accessibility.md).
 *
 * The result list follows the ARIA combobox/listbox pattern: focus stays on the
 * input and ArrowUp/Down move a highlighted option via `aria-activedescendant`.
 * Selecting a navigation entry closes the palette and routes; selecting a command
 * runs it through the same pure `runCommand` as the terminal widget and paints the
 * output inline. The open/close rise is `motion-safe` only, so reduced motion gets
 * a static appearance.
 */

// Inline output tones for the light palette surface. The terminal widget's own
// TONE_CLASS targets its dark strip, so its near-white `text` tone would be
// invisible here; these map the same LineTone to the site's light-surface tokens.
const TONE_CLASS: Record<LineTone, string> = {
  text: "text-ink",
  muted: "text-ink-soft",
  faint: "text-muted",
  green: "text-signal",
};

const LIST_ID = "command-palette-list";
const optionId = (index: number) => `command-palette-option-${index}`;

interface OutputRow extends OutputLine {
  /** Command echoes render with the prompt glyph ahead of the text. */
  prompt?: boolean;
}

export function CommandPalette({ locale }: { locale: Locale }) {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  // Copy, projects, skills and experience are all locale-stable (getCopy and the
  // content accessors return the same singleton per locale), so the palette copy,
  // the command registry and the terminal execution context are memoised per
  // locale - the same pattern the terminal widget uses (components/widgets/terminal).
  const palette = getCopy(locale).commandPalette;
  const PROMPT = getCopy(locale).terminal.prompt;
  const allCommands = useMemo(() => buildPaletteCommands(getCopy(locale)), [locale]);
  // The terminal command core is pure; the palette reuses it verbatim to execute.
  const terminalCtx = useMemo<TerminalContext>(
    () => ({
      copy: getCopy(locale).terminal,
      projects: getProjects(locale),
      statusLabels: getProjectStatusLabels(locale),
      skillGroups: getSkillGroups(locale),
      experience: getExperience(locale),
    }),
    [locale],
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [output, setOutput] = useState<OutputRow[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Mirrors `open` for the document listener (which has no reactive closure), and
  // records whatever was focused when the palette opened to restore it on close.
  const openRef = useRef(false);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => filterCommands(allCommands, query), [allCommands, query]);

  const close = useCallback(() => {
    openRef.current = false;
    setOpen(false);
  }, []);

  // Open from a clean slate: remember the opener (still focused at this point,
  // before the input steals focus) and reset the transient state. Resetting here,
  // in the event handler rather than an effect, keeps state changes out of render.
  const openPalette = useCallback(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    openRef.current = true;
    setQuery("");
    setActiveIndex(0);
    setOutput([]);
    setOpen(true);
  }, []);

  // Global open triggers: ⌘K/Ctrl-K toggles, and the Nav trigger's window event
  // opens. Attached once for the app's lifetime (the palette is mounted in the
  // root layout), so the shortcut works on every route.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (openRef.current) {
          close();
        } else {
          openPalette();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(COMMAND_PALETTE_OPEN_EVENT, openPalette);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(COMMAND_PALETTE_OPEN_EVENT, openPalette);
    };
  }, [close, openPalette]);

  // On open, focus the input; on close the cleanup restores focus to the opener,
  // so a keyboard user lands back where they started - no lost focus. No setState
  // here, so the effect only synchronises the DOM (focus), not React state. The
  // highlight never goes stale because every filter change resets it (see the
  // input's onChange), so no separate clamp effect is needed.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    return () => restoreFocusRef.current?.focus?.();
  }, [open]);

  // Keep the highlighted option scrolled into view during keyboard navigation.
  useEffect(() => {
    if (!open) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, open]);

  const navigateTo = useCallback(
    (href: string) => {
      const [rawPath, hash] = href.split("#");
      const path = rawPath || "/";
      // A same-page hash sets location.hash directly so the CSS smooth-scroll (and
      // its reduced-motion fallback) fires; anything else is a real route change.
      if (window.location.pathname === path) {
        if (hash) {
          window.location.hash = hash;
        } else {
          window.scrollTo({ top: 0 });
        }
      } else {
        router.push(href);
      }
    },
    [router],
  );

  const activate = useCallback(
    (command: PaletteCommand) => {
      if (command.kind === "navigate" && command.href) {
        close();
        navigateTo(command.href);
        return;
      }
      if (command.kind === "run" && command.command) {
        const result = runCommand(command.command, terminalCtx);
        setOutput(
          result.clear
            ? []
            : [{ text: command.command, tone: "text", prompt: true }, ...result.lines],
        );
        return;
      }
      if (command.kind === "action" && command.action === "toggle-theme") {
        // Keep the palette open: its own surface recolours with the token swap,
        // giving immediate confirmation. Escape (or a backdrop click) closes it.
        toggleTheme();
      }
    },
    [close, navigateTo, terminalCtx, toggleTheme],
  );

  // Contain Tab within the palette so focus never escapes behind the overlay. With
  // the input and the close button as the two stops, this wraps between them.
  function trapFocus(event: ReactKeyboardEvent) {
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? 0 : (i + 1) % results.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const command = results[activeIndex];
      if (command) {
        activate(command);
      }
    } else if (event.key === "Tab") {
      trapFocus(event);
    }
  }

  if (!open) {
    return null;
  }

  return (
    // The backdrop: a click on it (not on the panel) dismisses, like a modal.
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/30 px-4 pt-[15vh] backdrop-blur-sm"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={palette.label}
        onKeyDown={onKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-card border border-line bg-surface font-mono text-[13px] shadow-widget motion-safe:animate-palette-in"
      >
        {/* Search row: the prompt glyph, the combobox input and an esc affordance. */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span aria-hidden className="text-signal">
            {PROMPT}
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={LIST_ID}
            aria-activedescendant={results.length > 0 ? optionId(activeIndex) : undefined}
            aria-label={palette.label}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder={palette.placeholder}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={close}
            aria-label={palette.close}
            className="shrink-0 rounded-button border border-line px-2 py-1 text-[11px] text-muted transition-colors duration-200 hover:text-signal"
          >
            esc
          </button>
        </div>

        {/* Results: an ARIA listbox driven by the input's aria-activedescendant. */}
        <ul
          id={LIST_ID}
          role="listbox"
          aria-label={palette.label}
          className="max-h-72 overflow-y-auto py-1"
        >
          {results.length === 0 ? (
            <li role="presentation" className="px-4 py-3 text-muted">
              {palette.empty}
            </li>
          ) : (
            results.map((command, index) => {
              // The list is navigation, then commands, then actions, so a kind
              // change marks the boundary where the next group heading belongs.
              const showHeading = results[index - 1]?.kind !== command.kind;
              return (
                <Fragment key={command.id}>
                  {showHeading && (
                    <li
                      role="presentation"
                      className="px-4 pt-3 pb-1 text-[11px] tracking-[0.5px] text-muted uppercase"
                    >
                      {command.kind === "navigate"
                        ? palette.groups.navigate
                        : command.kind === "run"
                          ? palette.groups.run
                          : palette.groups.action}
                    </li>
                  )}
                  <li
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => activate(command)}
                    className={cn(
                      // The highlight glides between rows during ArrowUp/Down
                      // navigation instead of snapping (colour-only, so it needs
                      // no reduced-motion guard).
                      "flex cursor-pointer items-center justify-between gap-4 px-4 py-2 transition-colors duration-150",
                      index === activeIndex ? "bg-line/60 text-ink" : "text-ink-soft",
                    )}
                  >
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="truncate">{command.label}</span>
                      {command.description ? (
                        <span className="truncate text-muted">{command.description}</span>
                      ) : null}
                    </span>
                    <span aria-hidden className="shrink-0 text-[11px] text-muted">
                      {command.hint}
                    </span>
                  </li>
                </Fragment>
              );
            })
          )}
        </ul>

        {/* Inline output of a run command, announced like the terminal's log. */}
        {output.length > 0 ? (
          <div
            role="log"
            aria-live="polite"
            className="max-h-40 overflow-y-auto border-t border-line px-4 py-3 leading-[1.7]"
          >
            {output.map((row, i) => (
              <div
                key={i}
                className={cn("break-words whitespace-pre-wrap", TONE_CLASS[row.tone ?? "muted"])}
              >
                {row.prompt ? <span className="text-signal">{PROMPT} </span> : null}
                {row.text}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
