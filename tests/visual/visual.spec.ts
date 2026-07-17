import { expect, test, type Page } from "@playwright/test";

// Visual-regression gate (S6-3): full-page pixel snapshots of the key templates catch
// unintended layout/style regressions that functional tests and the Lighthouse/axe
// gates miss. Baselines are rendered in a pinned Playwright container and verified in
// CI's `visual` job against that same image, so parity is exact - see
// docs/engineering/quality-and-testing.md. Run locally with `pnpm test:visual` (needs a
// prior `pnpm build`); regenerate baselines via the update-visual-snapshots workflow.
//
// Reduced motion is emulated (boot overlay skipped, hero settled) and toHaveScreenshot
// disables CSS animations, so pages are stable from the first frame.

// German accessible-names of the home page's live-data widgets - mirrors
// content/copy/de.ts (the site renders de-DE). Their content changes per request, so
// they are masked out of the snapshot; a renamed label just means the region is no
// longer masked and the diff will flag it loudly.
const HOME_LIVE_REGIONS = ["GitHub-Aktivität", "Zeichen von Leben", "Coding-Aktivität"];

// Fully static templates - one representative route each, no live data to mask.
const STATIC_PAGES = [
  { name: "projekte", path: "/projekte" },
  { name: "projekte-detail", path: "/projekte/fuelivo" },
  { name: "blog", path: "/blog" },
  { name: "impressum", path: "/impressum" },
  { name: "datenschutz", path: "/datenschutz" },
] as const;

async function open(page: Page, path: string): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(path);
  // Let webfonts settle so glyph metrics match the baseline.
  await page.evaluate(() => document.fonts.ready);
}

test("home page", async ({ page }) => {
  await open(page, "/");

  const masks = [
    page.getByTestId("hero-live-status"),
    ...HOME_LIVE_REGIONS.map((name) => page.getByRole("region", { name })),
  ];

  await expect(page).toHaveScreenshot("home.png", { fullPage: true, mask: masks });
});

for (const { name, path } of STATIC_PAGES) {
  test(name, async ({ page }) => {
    await open(page, path);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
