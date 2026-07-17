import { afterEach, describe, expect, it, vi } from "vitest";

import {
  hrefToString,
  prefersReducedMotion,
  shouldAnimateViewTransition,
  supportsViewTransitions,
} from "@/lib/motion/view-transitions";

describe("hrefToString", () => {
  it("passes string hrefs through unchanged", () => {
    expect(hrefToString("/projekte")).toBe("/projekte");
    expect(hrefToString("/projekte/aurelian")).toBe("/projekte/aurelian");
  });

  it("joins the { pathname, hash } object form used for home-anchor back links", () => {
    expect(hrefToString({ pathname: "/", hash: "projekte" })).toBe("/#projekte");
    expect(hrefToString({ pathname: "/", hash: "#top" })).toBe("/#top");
  });

  it("omits an empty hash", () => {
    expect(hrefToString({ pathname: "/projekte" })).toBe("/projekte");
  });

  it("serialises a query object into a search string", () => {
    expect(hrefToString({ pathname: "/projekte", query: { tag: "web", sort: "new" } })).toBe(
      "/projekte?tag=web&sort=new",
    );
  });

  it("skips null and undefined query values", () => {
    expect(hrefToString({ pathname: "/p", query: { a: "1", b: undefined, c: null } })).toBe(
      "/p?a=1",
    );
  });

  it("expands array query values into repeated params", () => {
    expect(hrefToString({ pathname: "/p", query: { tag: ["a", "b"] } })).toBe("/p?tag=a&tag=b");
  });

  it("normalises an explicit search string and prefers it over query", () => {
    expect(hrefToString({ pathname: "/p", search: "x=1" })).toBe("/p?x=1");
    expect(hrefToString({ pathname: "/p", search: "?x=1" })).toBe("/p?x=1");
  });
});

describe("view transition support gates", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    // startViewTransition is not part of jsdom; remove any stub we added.
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
  });

  function stubReducedMotion(reduce: boolean) {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: reduce }) as unknown as typeof window.matchMedia,
    );
  }

  it("reports no support when the API is absent (default jsdom)", () => {
    expect(supportsViewTransitions()).toBe(false);
  });

  it("reports support once document exposes startViewTransition", () => {
    (document as unknown as { startViewTransition: () => void }).startViewTransition = () => {};
    expect(supportsViewTransitions()).toBe(true);
  });

  it("reads the reduced-motion media query", () => {
    stubReducedMotion(true);
    expect(prefersReducedMotion()).toBe(true);

    stubReducedMotion(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("animates only when supported and motion is welcome", () => {
    (document as unknown as { startViewTransition: () => void }).startViewTransition = () => {};

    stubReducedMotion(false);
    expect(shouldAnimateViewTransition()).toBe(true);

    stubReducedMotion(true);
    expect(shouldAnimateViewTransition()).toBe(false);
  });

  it("does not animate when the API is unavailable, even without reduced motion", () => {
    stubReducedMotion(false);
    expect(shouldAnimateViewTransition()).toBe(false);
  });
});
