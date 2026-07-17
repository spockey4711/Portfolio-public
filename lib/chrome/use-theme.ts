"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  DEFAULT_THEME,
  THEME_ATTR,
  THEME_STORAGE_KEY,
  type Theme,
  isTheme,
  nextTheme,
} from "@/lib/chrome/theme";

/**
 * Client theme controller for dark mode (S4-2). The `data-theme` attribute on
 * <html> - set by the pre-paint script (lib/chrome/theme.ts) before this hook ever
 * runs - is the source of truth; the hook is a `useSyncExternalStore` view over it,
 * so there is no derived React state to fall out of sync and no flash on mount.
 *
 * It exposes the resolved theme and a `toggleTheme` the command palette and the nav
 * menu wire to their theme controls; toggling persists an explicit choice to
 * `localStorage`. Dark mode is off by default and the OS `prefers-color-scheme` is
 * deliberately ignored (ADR-0007), so a visitor with no stored choice always resolves
 * to light until they flip the toggle.
 */

// Fired on <html> theme changes so the external-store subscribers re-render; our own
// toggle is the only source of change now that the OS preference is not followed.
const THEME_CHANGE_EVENT = "pf-theme-change";

/** The active theme: the attribute the pre-paint script set, else the default. */
function resolvedTheme(): Theme {
  const current = document.documentElement.getAttribute(THEME_ATTR);
  return isTheme(current) ? current : DEFAULT_THEME;
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute(THEME_ATTR, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  // Server render (and hydration) assumes the default; the client store immediately
  // reports the real resolved theme. The theme controls only mount client-side (the
  // nav menus render on demand and the palette does not render `theme` into markup),
  // so this assumption never causes a hydration mismatch.
  const theme = useSyncExternalStore(subscribe, resolvedTheme, () => DEFAULT_THEME);

  const toggleTheme = useCallback(() => {
    const target = nextTheme(resolvedTheme());
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, target);
    } catch {
      // Persistence is best-effort; the in-session theme still switches.
    }
    applyTheme(target);
  }, []);

  return { theme, toggleTheme };
}
