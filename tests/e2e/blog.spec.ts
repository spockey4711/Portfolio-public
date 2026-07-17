import { expect, test } from "@playwright/test";

// The blog (P3-7): reached from the footer (a page-level link, not the scroll-only
// nav), the index links into each post, and a post renders its MDX body and links
// back to the index. This smoke test walks that path and checks the RSS feed.

test("blog index links into a post that renders and links back", async ({ page }) => {
  await page.goto("/blog");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Notizen");

  // Open the first post from its card. Scope to the post list so we skip the
  // other /blog/* links in main - the back-to-home link and the "RSS abonnieren"
  // subscribe anchor to /blog/feed.xml (S5-4), which precedes the cards.
  const firstPost = page.locator('main ul a[href^="/blog/"]').first();
  await firstPost.click();

  await expect(page).toHaveURL(/\/blog\/.+/);
  // The MDX body rendered: the post has an h1 (title) and prose h2 headings.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();

  await page.getByRole("link", { name: "Zurück zum Blog", exact: true }).click();
  await expect(page).toHaveURL(/\/blog$/);
});

test("blog is reachable from the footer", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("contentinfo").getByRole("link", { name: "Blog", exact: true }).click();

  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Notizen");
});

test("serves an RSS feed with the posts", async ({ request }) => {
  const response = await request.get("/blog/feed.xml");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/rss+xml");

  const body = await response.text();
  expect(body).toContain("<rss");
  expect(body).toContain("<item>");
});
