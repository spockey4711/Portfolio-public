import { expect, test } from "@playwright/test";

// Verifies the P1-13 acceptance: the legal pages are reachable, linked from the
// footer on every page, and kept out of the index. Content assertions stay loose
// so copy tweaks do not make the suite brittle.

test("legal pages are reachable and noindex", async ({ page }) => {
  for (const [path, heading] of [
    ["/impressum", "Impressum"],
    ["/datenschutz", "Datenschutzerklärung"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});

test("the footer links from the home page to both legal pages", async ({ page }) => {
  await page.goto("/");

  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "Impressum" })).toHaveAttribute(
    "href",
    "/impressum",
  );

  await footer.getByRole("link", { name: "Datenschutz" }).click();
  await expect(page).toHaveURL(/\/datenschutz$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Datenschutzerklärung");

  // The back link returns to the onepager.
  await page.getByRole("link", { name: /Zurück zur Startseite/ }).click();
  await expect(page).toHaveURL(/\/$/);
});
