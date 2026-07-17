import { expect, test } from "@playwright/test";

// Verifies the P1-4 acceptance criteria against the real rendered spine: it is
// fixed at left:71px, its fill and node track scroll progress, and the value is
// synced to the nav percentage. The default 1280px viewport is above the 1100px
// desktop threshold, so the spine is visible.

// The spine is the aria-hidden body-level chrome that is not the boot overlay
// (which is also an aria-hidden body child, P1-5).
const spine = "body > div[aria-hidden]:not([data-boot-overlay])";

test("spine is fixed at left:71px and starts empty", async ({ page }) => {
  await page.goto("/");

  const track = page.locator(spine);
  await expect(track).toBeVisible();
  await expect(track).toHaveCSS("position", "fixed");
  await expect(track).toHaveCSS("left", "71px");

  // At the top the fill has no height and the node rides at 0%.
  const fillHeight = await track
    .locator("> div")
    .first()
    .evaluate((el) => el.clientHeight);
  expect(fillHeight).toBe(0);
});

test("fill and node track progress to the bottom, synced to the nav percent", async ({ page }) => {
  await page.goto("/");

  // The placeholder home page is not tall enough to scroll; add content and
  // fire a resize so the shared scroll driver re-measures the scrollable height.
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "300vh";
    document.body.appendChild(spacer);
    window.dispatchEvent(new Event("resize"));
  });

  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );

  // Nav reads 100% and the spine agrees: its --progress reaches 1 and the fill
  // spans the full track height.
  await expect(page.locator("nav").getByText(/^\d+%$/)).toHaveText("100%");

  const track = page.locator(spine);
  await expect
    .poll(async () => track.evaluate((el) => getComputedStyle(el).getPropertyValue("--progress")))
    .toBe("1");

  const [fillHeight, trackHeight] = await track.evaluate((el) => {
    const fill = el.firstElementChild as HTMLElement;
    return [fill.clientHeight, el.clientHeight];
  });
  expect(fillHeight).toBe(trackHeight);
});
