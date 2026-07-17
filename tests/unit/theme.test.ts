import { describe, expect, it } from "vitest";

import {
  DEFAULT_THEME,
  THEME_ATTR,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  isTheme,
  nextTheme,
} from "@/lib/chrome/theme";

describe("theme helpers", () => {
  it("narrows only the two valid themes", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(undefined)).toBe(false);
  });

  it("toggles between light and dark", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
  });
});

describe("THEME_INIT_SCRIPT", () => {
  it("references the shared storage key and DOM attribute", () => {
    expect(THEME_INIT_SCRIPT).toContain(THEME_STORAGE_KEY);
    expect(THEME_INIT_SCRIPT).toContain(THEME_ATTR);
  });

  it("falls back to the default theme and is guarded from throwing", () => {
    // Dark mode is off by default: the script never consults the OS preference and
    // resolves an absent choice to the light default (ADR-0007).
    expect(THEME_INIT_SCRIPT).not.toContain("prefers-color-scheme");
    expect(THEME_INIT_SCRIPT).not.toContain("matchMedia");
    expect(THEME_INIT_SCRIPT).toContain(`"${DEFAULT_THEME}"`);
    expect(THEME_INIT_SCRIPT).toContain("try");
    expect(THEME_INIT_SCRIPT).toContain("catch");
  });

  it("defaults to light with no stored choice (smoke-run in jsdom)", () => {
    document.documentElement.removeAttribute(THEME_ATTR);
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    new Function(THEME_INIT_SCRIPT)();
    expect(document.documentElement.getAttribute(THEME_ATTR)).toBe("light");
    document.documentElement.removeAttribute(THEME_ATTR);
  });

  it("resolves and applies a theme before paint (smoke-run in jsdom)", () => {
    document.documentElement.removeAttribute(THEME_ATTR);
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    // The script is the exact string injected inline in the document head.
    new Function(THEME_INIT_SCRIPT)();
    expect(document.documentElement.getAttribute(THEME_ATTR)).toBe("dark");
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute(THEME_ATTR);
  });
});
