/**
 * Theme tokens for dark mode (S4-2, unparks P3-4). The palette is a pure token
 * swap (ADR-0003): the dark values live in app/globals.css under
 * `html[data-theme="dark"]`, and everything here is the shared, DOM-free contract
 * both the pre-paint init script and the client `useTheme` hook agree on - the
 * storage key, the `<html>` attribute, and the two resolved themes. Keeping it
 * dependency-free lets the layout embed the init script and the tests exercise the
 * resolution logic without a DOM (see docs/design/design-system.md).
 */

// localStorage key holding the user's explicit choice ("light" | "dark"). Absent
// means "no choice yet", which resolves to the default theme (light) - the OS
// `prefers-color-scheme` is deliberately not consulted, so the site opens light for
// everyone until they flip the toggle. localStorage (not sessionStorage) so the
// choice persists across visits.
export const THEME_STORAGE_KEY = "pf_theme";

// Attribute written on <html> with the resolved theme. globals.css scopes the dark
// token overrides to `html[data-theme="dark"]`; the pre-paint script always sets it
// (to the stored choice, else the default) before first paint, so there is never a
// flash of the wrong theme.
export const THEME_ATTR = "data-theme";

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

// The theme a visitor with no stored choice gets: dark mode is off by default and
// the OS preference is ignored, so the first paint is always light (ADR-0007).
export const DEFAULT_THEME: Theme = "light";

/** Narrow an unknown value (localStorage / DOM attribute) to a valid Theme. */
export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** The opposite theme - the target of a toggle. */
export function nextTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

/**
 * Pre-paint init, injected as an inline script in the document (see SiteChrome) so
 * it runs before the first paint. It resolves the active theme - the persisted
 * choice if any, otherwise the default (light) - and writes it to `data-theme` on
 * <html>, so the correct tokens apply with no flash. Dependency-free and wrapped in
 * try/catch because it runs before hydration and Storage can throw in locked-down
 * contexts.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var c=window.localStorage.getItem("${THEME_STORAGE_KEY}");var t=(c==="light"||c==="dark")?c:"${DEFAULT_THEME}";document.documentElement.setAttribute("${THEME_ATTR}",t);}catch(e){}})();`;
