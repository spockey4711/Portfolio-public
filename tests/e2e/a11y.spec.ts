import { expect, test } from "@playwright/test";

// Keyboard-accessibility acceptance for P1-15: the skip link is the first tab
// stop, becomes visible on focus and moves focus to <main>; focused elements
// show the signal focus-visible ring. Reduced motion is emulated so the hero
// rise-up is skipped and the page is stable from the first frame.

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

  // The global :focus-visible rule draws a 2px solid ring in the --focus accent.
  // We resolve --focus through a probe element rather than hard-coding a color
  // string: the token is an oklch() value, which browsers serialize as lab(), so
  // an exact literal would be brittle across engine versions. Reading both the
  // outline and the probe through getComputedStyle keeps the assertion pinned to
  // the token itself.
  const ring = await skipLink.evaluate((el) => {
    const s = getComputedStyle(el);
    const probe = document.createElement("span");
    probe.style.color = "var(--focus)";
    document.body.appendChild(probe);
    const focusColor = getComputedStyle(probe).color;
    probe.remove();
    return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor, focusColor };
  });
  expect(ring.style).toBe("solid");
  expect(ring.width).toBe("2px");
  expect(ring.color).toBe(ring.focusColor);
});
