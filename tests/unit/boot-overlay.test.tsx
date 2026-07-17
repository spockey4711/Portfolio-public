import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BootOverlay } from "@/components/chrome/BootOverlay";
import { BOOT_GUARD_SCRIPT, BOOT_STORAGE_KEY } from "@/lib/chrome/boot";

const overlay = "[data-boot-overlay]";

function playThisSession() {
  document.documentElement.setAttribute("data-boot", "play");
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute("data-boot");
  window.sessionStorage.clear();
});

describe("BootOverlay", () => {
  it("drops itself and sets no guard when the session did not opt in", () => {
    // No data-boot marker: the pre-paint guard skipped this session (returning
    // visitor or reduced motion), so the overlay must not linger or record a play.
    vi.useFakeTimers();
    const { container } = render(<BootOverlay />);

    expect(window.sessionStorage.getItem(BOOT_STORAGE_KEY)).toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(container.querySelector(overlay)).toBeNull();
  });

  describe("on the play path", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      playThisSession();
    });

    it("renders the six boot lines and records the session guard", () => {
      const { container } = render(<BootOverlay />);

      expect(container.querySelector(overlay)).not.toBeNull();
      expect(window.sessionStorage.getItem(BOOT_STORAGE_KEY)).toBe("1");

      // The overlay is a decorative splash, hidden from assistive tech.
      expect(container.querySelector(overlay)).toHaveAttribute("aria-hidden");

      // All six lines are present, in order.
      expect(screen.getByText(/booting portfolio\.os/)).toBeInTheDocument();
      expect(screen.getByText("loading modules")).toBeInTheDocument();
      expect(screen.getByText("mounting /projects")).toBeInTheDocument();
      expect(screen.getByText("establishing uplink")).toBeInTheDocument();
      expect(screen.getByText("yannik.wuenker")).toBeInTheDocument();
      expect(screen.getByText("ready")).toBeInTheDocument();
    });

    it("fades out at ~2350ms and unmounts after the 0.7s fade", () => {
      const { container } = render(<BootOverlay />);

      // Still fully present just before the fade starts.
      act(() => vi.advanceTimersByTime(2349));
      expect(container.querySelector(`${overlay}[data-leaving]`)).toBeNull();

      // At ~2350ms the fade-out begins (data-leaving triggers the CSS opacity
      // transition); the node is still mounted through the fade.
      act(() => vi.advanceTimersByTime(1));
      expect(container.querySelector(`${overlay}[data-leaving]`)).not.toBeNull();

      // After the 0.7s fade the overlay unmounts and the marker is cleaned up.
      act(() => vi.advanceTimersByTime(700));
      expect(container.querySelector(overlay)).toBeNull();
      expect(document.documentElement.getAttribute("data-boot")).toBeNull();
    });
  });
});

describe("boot guard script", () => {
  const runGuard = () => {
    new Function(BOOT_GUARD_SCRIPT)();
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute("data-boot");
    window.sessionStorage.clear();
  });

  it("opts a first, motion-allowed visit into the animation", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));

    runGuard();

    expect(document.documentElement.getAttribute("data-boot")).toBe("play");
  });

  it("skips when the session already booted", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
    window.sessionStorage.setItem(BOOT_STORAGE_KEY, "1");

    runGuard();

    expect(document.documentElement.getAttribute("data-boot")).toBeNull();
  });

  it("skips under reduced motion", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));

    runGuard();

    expect(document.documentElement.getAttribute("data-boot")).toBeNull();
  });
});
