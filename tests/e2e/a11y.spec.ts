import { expect, test } from "@playwright/test";

// Keyboard-accessibility acceptance for P1-15: the skip link is the first tab
// stop, becomes visible on focus and moves focus to <main>; focused elements
// show the signal focus-visible ring. Reduced motion is emulated so the boot
// overlay is skipped and the page is stable from the first frame.

test("the skip link is the first tab stop and jumps to main", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Zum Inhalt springen" });

  // Off-screen (sr-only) until focused: the first Tab reveals and focuses it.
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  // Activating it moves keyboard focus onto the main landmark, past the nav.
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("keyboard focus shows the signal focus-visible ring", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Zum Inhalt springen" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();

  // The global :focus-visible rule draws a 2px solid ring in the signal accent
  // (#157a45 = rgb(21, 122, 69)).
  const ring = await skipLink.evaluate((el) => {
    const s = getComputedStyle(el);
    return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor };
  });
  expect(ring.style).toBe("solid");
  expect(ring.width).toBe("2px");
  expect(ring.color).toBe("rgb(21, 122, 69)");
});
