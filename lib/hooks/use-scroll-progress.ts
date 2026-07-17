"use client";

import { useEffect, useRef } from "react";

/**
 * Reports vertical scroll progress (0..1) off the React render path.
 *
 * `scroll` fires far more often than the browser paints, so the work is batched
 * into a single `requestAnimationFrame` and delivered through `onProgress`. That
 * callback is meant to mutate the DOM directly - set `textContent`, write a CSS
 * variable - and must NOT call `setState`: driving scroll-linked UI through React
 * state would re-render on every frame. Layout is measured once, then re-measured
 * on `resize` and whenever the document's height changes - the latter via a
 * `ResizeObserver`, not on every scroll tick.
 *
 * The `ResizeObserver` matters: the page grows and shrinks after mount without a
 * `resize` event (web fonts settling, images loading, expanding content). A stale
 * `scrollable` throws the ratio off at the extremes, so the fill would stop short
 * of - or overshoot - 100% at the true bottom of the page. Re-measuring on every
 * height change keeps progress exact all the way to the end.
 *
 * The observed node must be `document.body`, not `document.documentElement`: the
 * root has `overflow-x: clip` (globals.css), which makes it a scroll container
 * whose own box is pinned to the viewport height, so it never reports a size
 * change when the document grows taller - the observer would silently never fire.
 * The body box tracks content height, so observing it catches every height change.
 *
 * This is the shared scroll driver for the nav percentage (P1-3) and, later, the
 * scroll spine (P1-4). The latest `onProgress` is held in a ref so the listeners
 * are attached once and callers need not memoise the callback.
 *
 * Progress = clamp(scrollY / (scrollHeight - innerHeight), 0, 1), snapped to the
 * exact ends within a small pixel tolerance so the fill reaches 100% (and 0%)
 * even where the browser rests `scrollY` a hair short of the bottom - which is a
 * visible slice of the bar on short pages. See docs/design/animation-and-motion.md.
 */
export function useScrollProgress(onProgress: (ratio: number) => void): void {
  const callbackRef = useRef(onProgress);

  // Keep the ref pointing at the latest callback without re-subscribing the
  // listeners below (which stay attached for the component's lifetime).
  useEffect(() => {
    callbackRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    let frame = 0;
    let scrollable = 0;
    // Distance from either end, in pixels, treated as fully at that end. See the
    // note in `emit` for why the raw ratio stalls short of the extremes.
    const SNAP_PX = 2;

    const measure = () => {
      scrollable = document.documentElement.scrollHeight - window.innerHeight;
    };

    const emit = () => {
      frame = 0;
      let ratio = 0;
      if (scrollable > 0) {
        const y = window.scrollY;
        // The browser caps the resting `scrollY` a hair below `scrollable`:
        // sub-pixel on fractional-DPR (Retina) displays, a few pixels when a
        // momentum scroll settles. On a tall page that gap is invisible, but on
        // a short one it is a visible slice of the bar, stalling progress just
        // under 100% (and, symmetrically, just above 0%). Snapping within a
        // small pixel tolerance of either end keeps the fill honest at the
        // extremes without touching the ratio anywhere in between.
        ratio = y >= scrollable - SNAP_PX ? 1 : y <= SNAP_PX ? 0 : y / scrollable;
      }
      callbackRef.current(ratio);
    };

    const schedule = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(emit);
      }
    };

    const remeasure = () => {
      measure();
      schedule();
    };

    measure();
    emit(); // Seed the initial value before the first scroll.

    // Height changes that never fire `resize` (fonts settling, images loading,
    // expanding content) would leave `scrollable` stale; observe the body so the
    // ratio stays exact at the bottom of the page. The body box tracks content
    // height, whereas the `overflow-x: clip` root is pinned to the viewport and
    // never reports document growth (see the note above).
    const heightObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(remeasure) : null;
    heightObserver?.observe(document.body);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      heightObserver?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
    };
  }, []);
}
