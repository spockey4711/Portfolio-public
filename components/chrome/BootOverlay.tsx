"use client";

import { useEffect, useRef, useState } from "react";

import { BOOT_ATTR, BOOT_PLAY, BOOT_STORAGE_KEY } from "@/lib/chrome/boot";

/**
 * The boot overlay: a once-per-session terminal splash. Six mono lines fade in
 * on a stagger, then the fullscreen `--term-bg` overlay fades out and unmounts,
 * so the hero reveal follows the boot end (docs/design/animation-and-motion.md).
 *
 * Whether it plays at all is decided before first paint by the guard script in
 * `app/layout.tsx`, which sets `data-boot="play"` on <html> only on a first,
 * motion-allowed visit of the session. The overlay is `display:none` until that
 * marker is present (globals.css), so a returning or reduced-motion visitor
 * never sees a flash. This component then, on the play path only, records the
 * session guard and drives the timed fade-out; on any other path it simply drops
 * itself from the tree. It is `aria-hidden`: a decorative splash, not content.
 */

// Overlay fades out ~2350ms in (after the last line has settled), over 0.7s,
// then unmounts. Both timings are from the binding motion spec.
const BOOT_LEAVE_AT_MS = 2350;
const BOOT_FADE_MS = 700;

// Per-line reveal delays (seconds), binding from the design handoff.
const LINE_DELAYS = [0.1, 0.45, 0.8, 1.15, 1.5, 1.85] as const;

// The six lines, in order. `ok` and the `▸` prompt render in term-green; the
// values (version, handle, "ready") highlight in bright term text.
const BOOT_LINES = [
  <>
    <span className="text-term-green">▸</span> booting portfolio.os{" "}
    <span className="text-term-text">v2.4</span>
  </>,
  <span className="flex justify-between" key="modules">
    <span>loading modules</span>
    <span className="text-term-green">ok</span>
  </span>,
  <span className="flex justify-between" key="projects">
    <span>mounting /projects</span>
    <span className="text-term-green">ok</span>
  </span>,
  <span className="flex justify-between" key="uplink">
    <span>establishing uplink</span>
    <span className="text-term-green">ok</span>
  </span>,
  <>
    whoami <span className="text-term-text-faint">→</span>{" "}
    <span className="text-term-text">yannik.wuenker</span>
  </>,
  <>
    <span className="text-term-green">▸</span> <span className="text-term-text">ready</span>
    <span className="text-term-green motion-safe:animate-blink">▮</span>
  </>,
];

export function BootOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const timers: number[] = [];

    if (root.getAttribute(BOOT_ATTR) !== BOOT_PLAY) {
      // Skip path (guard already set this session, or reduced motion): the guard
      // never opted in, so the overlay is already hidden by CSS. Drop it from the
      // tree on the next tick - a synchronous state update in the effect body
      // would trigger a cascading render.
      timers.push(window.setTimeout(() => setDone(true), 0));
    } else {
      // Record the play so a reload within the session skips straight to the hero.
      try {
        window.sessionStorage.setItem(BOOT_STORAGE_KEY, "1");
      } catch {
        // Storage can be unavailable (private mode / blocked). The overlay still
        // plays this once; it just will not be suppressed on the next load.
      }

      timers.push(
        window.setTimeout(() => {
          overlayRef.current?.setAttribute("data-leaving", "");
        }, BOOT_LEAVE_AT_MS),
      );
      timers.push(
        window.setTimeout(() => {
          root.removeAttribute(BOOT_ATTR);
          setDone(true);
        }, BOOT_LEAVE_AT_MS + BOOT_FADE_MS),
      );
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  if (done) {
    return null;
  }

  return (
    // No Tailwind display utility here: `display` is owned by the guard CSS in
    // globals.css (none until data-boot="play"), which is what keeps the overlay
    // from flashing for returning / reduced-motion visitors.
    <div
      ref={overlayRef}
      data-boot-overlay
      aria-hidden
      className="fixed inset-0 z-[100] flex-col items-center justify-center bg-term-bg px-8"
    >
      <div className="w-full max-w-[320px] font-mono text-[13px] leading-[2.1] text-term-text-muted">
        {BOOT_LINES.map((line, i) => (
          <div
            // Lines rest hidden and reveal on a stagger only when motion is
            // allowed; the overlay is skipped outright under reduced motion.
            key={i}
            className="opacity-0 motion-safe:animate-bootline"
            style={{ animationDelay: `${LINE_DELAYS[i]}s` }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
