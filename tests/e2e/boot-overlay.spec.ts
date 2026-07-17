import { expect, test } from "@playwright/test";

// Verifies the P1-5 acceptance criteria against the real rendered overlay: it
// plays once per session (not on reload) and is skipped under reduced motion.
// Each test gets a fresh context, so sessionStorage starts empty (a first visit).

const overlay = "[data-boot-overlay]";

test("plays on the first visit of a session, then reveals the site", async ({ page }) => {
  await page.goto("/");

  const boot = page.locator(overlay);
  await expect(boot).toBeVisible();
  await expect(boot).toContainText("booting portfolio.os");
  await expect(boot).toContainText("yannik.wuenker");

  // It fades out (~2350ms + 0.7s) and unmounts, leaving the site behind.
  await expect(boot).toHaveCount(0, { timeout: 6000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("does not replay on reload within the same session", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(overlay)).toHaveCount(0, { timeout: 6000 });

  await page.reload();

  // The session guard is set, so the pre-paint script never opts in again: the
  // overlay stays hidden (no flash) instead of replaying.
  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("does not log a hydration mismatch when the boot guard opts in", async ({ page }) => {
  // The pre-paint guard sets data-boot="play" on <html> before hydration, so the
  // server HTML and client DOM differ by design. suppressHydrationWarning on
  // <html> keeps React from flagging it; guard against that regression by failing
  // if a hydration error reaches the console on a first visit.
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text())) {
      hydrationErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (/hydrat/i.test(error.message)) {
      hydrationErrors.push(error.message);
    }
  });

  await page.goto("/");
  // Wait past hydration and the boot sequence so any mismatch would have surfaced.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 6000 });

  expect(hydrationErrors).toEqual([]);
});

test("skips the boot overlay entirely under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator(overlay)).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
