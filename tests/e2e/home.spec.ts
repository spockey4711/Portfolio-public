import { expect, test } from "@playwright/test";

// Smoke test verifying the Playwright wiring and that the app boots and serves
// the hero (P1-7). Deeper user-flow coverage (nav jumps, legal pages) arrives
// with those features.
test("home page renders the hero", async ({ page }) => {
  await page.goto("/");

  // The name is the page's one h1 (PORT-48): who, before anything else.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Yannik Wünker");

  // The two CTAs sit above the fold: the jump to the projects section and the CV
  // download. Scope to the main landmark so the nav's own "Projekte" link (which
  // points at the root-relative /#projekte) is not matched too, and match the labels
  // exactly so the "Alle Projekte ansehen" tile stays out of it (P3-9). The CV is
  // offered again below the Werdegang timeline, hence `.first()`.
  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: "Projekte", exact: true })).toHaveAttribute(
    "href",
    "#projekte",
  );
  await expect(
    main.getByRole("link", { name: "Lebenslauf (PDF)", exact: true }).first(),
  ).toHaveAttribute("href", "/cv/yannik-wuenker.pdf");
});
