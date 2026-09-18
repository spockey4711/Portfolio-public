import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Automated accessibility gate (S6-3): an axe-core scan of every key route asserts
// zero WCAG 2.0/2.1 A + AA violations. This complements the Lighthouse a11y score
// (a single aggregate number) with rule-level findings that fail the PR and name the
// exact node, and the keyboard/focus acceptance in a11y.spec.ts.
//
// Reduced motion is emulated so the hero rise-up is settled from the first frame -
// otherwise axe can sample a colour mid-transition and
// report a false contrast violation (the same reason the Lighthouse a11y floor is 0.95,
// see docs/engineering/quality-and-testing.md).

// One representative page per template. Detail slugs come from content/projects and
// content/blog; keep this list in sync when a template (not just an entry) is added.
const ROUTES = [
  "/",
  "/projekte",
  "/projekte/fuelivo",
  "/blog",
  "/blog/warum-dieses-portfolio",
  "/jetzt",
  "/uses",
  "/impressum",
  "/datenschutz",
] as const;

// WCAG 2.0/2.1 Level A and AA - the conformance target documented in
// docs/design/accessibility.md.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

for (const route of ROUTES) {
  test(`${route} has no axe accessibility violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);

    // Let webfonts settle so text nodes are measured against their final metrics
    // rather than the fallback face.
    await page.evaluate(() => document.fonts.ready);

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    expect(results.violations).toEqual([]);
  });
}
