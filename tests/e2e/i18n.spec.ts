import { type Locator, expect, test } from "@playwright/test";

import { ROUTES } from "./routes";

// Verifies the S5-1h acceptance against the real rendered documents: every live
// English route advertises the correct <html lang>, canonical and
// de-DE/en/x-default alternates, and the language toggle round-trips each route
// between German and English without a 404 or German content under /en. The copy
// helpers (counterpartPath, alternatesFor) are unit-tested in tests/unit; this
// suite proves the end-to-end wiring in the browser. Host is asserted by path
// suffix so the checks hold whatever siteUrl the metadata resolves to. The route
// pairs live in ./routes, shared with the global warm-up.

/** A regex asserting a URL ends with the given path (host-agnostic). */
const endsWith = (path: string) => new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);

/** Absolute-URL matcher for a route's German canonical, tolerating the trailing-slash-free root. */
const deUrl = (path: string) => (path === "/" ? /^https?:\/\/[^/]+\/?$/ : endsWith(path));

/**
 * Open the desktop "Mehr"/"More" disclosure (ADR-0005) and wait for a revealed
 * element. The disclosure is a React onClick, and right after a full-document
 * navigation the dev server may still be hydrating, so a single click can land
 * before the handler is attached; retry opening (guarded by aria-expanded so it
 * never toggles an already-open menu shut) until the content appears.
 */
async function openMoreMenu(nav: Locator, label: string, revealed: Locator) {
  const button = nav.getByRole("button", { name: label, exact: true });
  await expect(async () => {
    if ((await button.getAttribute("aria-expanded")) !== "true") {
      await button.click();
    }
    await expect(revealed).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
}

test.describe("EN routes: lang, canonical and hreflang", () => {
  for (const route of ROUTES) {
    test(`${route.name} advertises English lang and reciprocal alternates`, async ({ page }) => {
      const response = await page.goto(route.en);
      // The EN route resolves (the toggle target from German is never a 404).
      expect(response?.ok()).toBeTruthy();

      await expect(page.locator("html")).toHaveAttribute("lang", "en");

      // Canonical points at this EN path; German stays x-default.
      await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
        "href",
        endsWith(route.en),
      );

      const enHref = await page
        .locator('head link[rel="alternate"][hreflang="en"]')
        .getAttribute("href");
      const deHref = await page
        .locator('head link[rel="alternate"][hreflang="de-DE"]')
        .getAttribute("href");
      const xDefault = await page
        .locator('head link[rel="alternate"][hreflang="x-default"]')
        .getAttribute("href");

      expect(enHref).toMatch(endsWith(route.en));
      expect(deHref).toMatch(deUrl(route.de));
      // German is the x-default, so it mirrors the de-DE alternate, never the EN one.
      expect(xDefault).toBe(deHref);
      expect(xDefault).not.toBe(enHref);
    });
  }
});

test.describe("language toggle round-trips without a 404 or German under /en", () => {
  for (const route of ROUTES) {
    test(`${route.name} toggles German -> English and back`, async ({ page }) => {
      await page.goto(route.de);

      const deNav = page.getByRole("navigation", { name: "Hauptnavigation" });
      const toEnglish = deNav.getByRole("link", { name: "Zu Englisch wechseln" });
      await openMoreMenu(deNav, "Mehr", toEnglish);
      await expect(toEnglish).toHaveAttribute("href", endsWith(route.en));

      await toEnglish.click();
      await expect(page).toHaveURL(endsWith(route.en));
      await expect(page.locator("html")).toHaveAttribute("lang", "en");

      // And back: the English "More" menu's toggle returns to the German twin.
      const enNav = page.getByRole("navigation", { name: "Main navigation" });
      const toGerman = enNav.getByRole("link", { name: "Switch to German" });
      await openMoreMenu(enNav, "More", toGerman);
      await expect(toGerman).toHaveAttribute("href", endsWith(route.de));

      await toGerman.click();
      await expect(page).toHaveURL(deUrl(route.de));
      await expect(page.locator("html")).toHaveAttribute("lang", "de-DE");
    });
  }

  test("toggling an untranslated route falls back to the English home (never a 404)", async ({
    page,
  }) => {
    // /primitives has no English variant, so the toggle must land on /en, not a
    // 404 and not a German page under /en (counterpartPath's home fallback).
    await page.goto("/primitives");

    const nav = page.getByRole("navigation", { name: "Hauptnavigation" });
    const toEnglish = nav.getByRole("link", { name: "Zu Englisch wechseln" });
    await openMoreMenu(nav, "Mehr", toEnglish);
    await expect(toEnglish).toHaveAttribute("href", endsWith("/en"));

    const response = await page.goto("/en");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

test("the command palette renders in English on /en (no German leakage)", async ({ page }) => {
  await page.goto("/en");

  // Open the palette via its trigger in the English "More" menu, then assert an
  // English-only navigation entry is listed (the German equivalent would be
  // "Startseite"). Guards the S5-1h palette localization against regression.
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  const trigger = nav.getByRole("button", { name: "Open command palette" });
  await openMoreMenu(nav, "More", trigger);
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog.getByRole("option", { name: /Home/ })).toBeVisible();
  await expect(dialog.getByRole("option", { name: /Startseite/ })).toHaveCount(0);
});
