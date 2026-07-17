// Extends Vitest's expect with Testing Library's DOM matchers
// (toBeInTheDocument, toHaveTextContent, ...) and auto-cleans the DOM
// between tests.
import "@testing-library/jest-dom/vitest";

// jsdom ships no window.matchMedia; provide a sane default (no match, no-op
// listeners) so components that read prefers-color-scheme / reduced-motion - e.g.
// the theme-aware command palette - render in tests. Individual tests can still
// override the resolved value with vi.stubGlobal("matchMedia", ...).
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
