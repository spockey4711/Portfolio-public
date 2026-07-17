import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useScrollProgress } from "@/lib/hooks/use-scroll-progress";

function setLayout(scrollHeight: number, innerHeight: number, scrollY: number) {
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: innerHeight });
  Object.defineProperty(window, "scrollY", { configurable: true, value: scrollY });
}

describe("useScrollProgress", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits the initial ratio synchronously on mount", () => {
    setLayout(2000, 1000, 0);
    const onProgress = vi.fn();

    renderHook(() => useScrollProgress(onProgress));

    expect(onProgress).toHaveBeenLastCalledWith(0);
  });

  it("reports clamped progress on scroll", () => {
    // Capture the batched frame and flush it by hand, so the assertions see the
    // same ordering as a real (async) requestAnimationFrame.
    let rafCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallback = cb;
      return 1;
    });
    const flushFrame = () => {
      const cb = rafCallback;
      rafCallback = null;
      cb?.(0);
    };

    setLayout(2000, 1000, 500);
    const onProgress = vi.fn();

    renderHook(() => useScrollProgress(onProgress));

    window.dispatchEvent(new Event("scroll"));
    flushFrame();
    expect(onProgress).toHaveBeenLastCalledWith(0.5);

    // Past the bottom the ratio clamps to 1 rather than overshooting.
    setLayout(2000, 1000, 99999);
    window.dispatchEvent(new Event("scroll"));
    flushFrame();
    expect(onProgress).toHaveBeenLastCalledWith(1);
  });

  it("snaps to the exact ends within a pixel tolerance", () => {
    let rafCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallback = cb;
      return 1;
    });
    const flushFrame = () => {
      const cb = rafCallback;
      rafCallback = null;
      cb?.(0);
    };

    const onProgress = vi.fn();

    // A short page: the browser rests scrollY a pixel short of `scrollable`
    // (sub-pixel/momentum), which on a small range would stall the bar under
    // 100%. Within the tolerance it snaps to a full 1.
    setLayout(1308, 800, 507); // scrollable 508, one px from the bottom
    renderHook(() => useScrollProgress(onProgress));
    expect(onProgress).toHaveBeenLastCalledWith(1);

    // Symmetrically, a pixel from the top snaps to a clean 0.
    setLayout(1308, 800, 1);
    window.dispatchEvent(new Event("scroll"));
    flushFrame();
    expect(onProgress).toHaveBeenLastCalledWith(0);

    // Between the ends the raw ratio is untouched.
    setLayout(1308, 800, 254);
    window.dispatchEvent(new Event("scroll"));
    flushFrame();
    expect(onProgress).toHaveBeenLastCalledWith(0.5);
  });

  it("reports 0 when the page is not scrollable", () => {
    setLayout(800, 1000, 0);
    const onProgress = vi.fn();

    renderHook(() => useScrollProgress(onProgress));

    expect(onProgress).toHaveBeenLastCalledWith(0);
  });

  it("re-measures when the document height changes so the bottom stays exact", () => {
    // Capture the ResizeObserver callback so the test can drive a height change
    // that never fires a `resize` event (fonts settling, images loading).
    let observerCallback: ResizeObserverCallback | null = null;
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: ResizeObserverCallback) {
          observerCallback = cb;
        }
        observe() {}
        unobserve() {}
        disconnect = disconnect;
      },
    );

    let rafCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallback = cb;
      return 1;
    });
    const flushFrame = () => {
      const cb = rafCallback;
      rafCallback = null;
      cb?.(0);
    };

    // Mounted while the page is still tall; scrolled to what is then the bottom.
    setLayout(3000, 1000, 2000);
    const onProgress = vi.fn();

    const { unmount } = renderHook(() => useScrollProgress(onProgress));
    expect(onProgress).toHaveBeenLastCalledWith(1);

    // The page shrinks (content collapses) without a `resize`: the same scrollY
    // is no longer the bottom. Without re-measuring the ratio would still read 1.
    setLayout(2000, 1000, 500);
    observerCallback!([], {} as ResizeObserver);
    flushFrame();
    expect(onProgress).toHaveBeenLastCalledWith(0.5);

    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("observes the body, not the clipped root, so document growth re-measures", () => {
    // The root has `overflow-x: clip` (globals.css), which makes it a scroll
    // container whose own box is pinned to the viewport height and never reports
    // document growth. Observing it would silently never fire, leaving the ratio
    // stale so the bar hits 100% before the true bottom (R-1). The body box tracks
    // content height, so it must be the observed node.
    const observe = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = observe;
        unobserve() {}
        disconnect() {}
      },
    );

    setLayout(2000, 1000, 0);
    renderHook(() => useScrollProgress(vi.fn()));

    expect(observe).toHaveBeenCalledWith(document.body);
    expect(observe).not.toHaveBeenCalledWith(document.documentElement);
  });
});
