import { expect, test } from "@playwright/test";

// The quality doc requires a browser check that a mounted live widget keeps its
// fallback when its API route reports unavailable. The GitHub heatmap is the only
// live widget mounted on a page (components/sections/Onepager.tsx). The route's
// unavailable body is HTTP 200 `{ available: false }` (app/api/github-activity/route.ts);
// the widget leaves the static caption in place unless `available` is true.

const CASES = [
  {
    path: "/",
    region: "GitHub-Aktivität",
    fallback: "Aktivität derzeit nicht verfügbar",
    summary: "Beiträge im letzten Jahr",
  },
  {
    path: "/en",
    region: "GitHub activity",
    fallback: "Activity currently unavailable",
    summary: "contributions in the last year",
  },
] as const;

for (const item of CASES) {
  test(`${item.path} heatmap keeps the fallback caption when GitHub activity is unavailable`, async ({
    page,
  }) => {
    await page.route("**/api/github-activity", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ available: false }),
      });
    });

    // The caption is the fallback on the server and the first client render, then the
    // effect applies the route. Asserting before that response returns would pass even
    // if the widget then replaced the caption with a live total.
    const unavailable = page.waitForResponse("**/api/github-activity");
    await page.goto(item.path);
    await unavailable;

    const region = page.getByRole("region", { name: item.region });
    await expect(async () => {
      await expect(region.getByRole("img", { name: item.fallback })).toBeVisible();
      await expect(region.getByText(item.summary)).toHaveCount(0);
    }).toPass();
  });
}
