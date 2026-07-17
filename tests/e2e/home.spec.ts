import { expect, test } from "@playwright/test";

// Smoke test verifying the Playwright wiring and that the app boots and serves
// the hero (P1-7). Deeper user-flow coverage (nav jumps, legal pages) arrives
// with those features.
test("home page renders the hero", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Ich entwickle Software, die meine eigenen Probleme löst.",
  );

  // The primary CTA jumps to the projects section. Match the label exactly so it
  // does not also resolve the section teaser's "Alle Projekte ansehen" link (P3-9).
  await expect(page.getByRole("link", { name: "Projekte ansehen", exact: true })).toHaveAttribute(
    "href",
    "#projekte",
  );
});
