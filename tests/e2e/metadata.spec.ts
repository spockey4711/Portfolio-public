import { expect, test } from "@playwright/test";

// Verifies the P1-1 acceptance criteria against the real rendered document:
// the head carries the correct meta/OG tags and the sitemap and robots routes
// resolve. Content assertions stay loose (substring/attribute presence) so copy
// tweaks do not make the suite brittle.

test("home head carries the core SEO and Open Graph tags", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Yannik Wünker/);

  const description = page.locator('head meta[name="description"]');
  await expect(description).toHaveAttribute("content", /Portfolio/);

  const canonical = page.locator('head link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", /^https?:\/\//);

  await expect(page.locator('head meta[property="og:type"]')).toHaveAttribute("content", "website");
  await expect(page.locator('head meta[property="og:locale"]')).toHaveAttribute("content", "de_DE");
  await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/og\/default\.png$/,
  );
  await expect(page.locator('head meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});

test("html advertises the German locale", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "de-DE");
});

test("robots.txt resolves and references the segmented sitemap index", async ({ request }) => {
  const response = await request.get("/robots.txt");

  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain("User-Agent: *");
  expect(body).toMatch(/Sitemap:\s*https?:\/\/\S+\/sitemap-index\.xml/);
});

test("the sitemap index resolves and references the per-type segment sitemaps", async ({
  request,
}) => {
  const response = await request.get("/sitemap-index.xml");

  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain("<sitemapindex");
  expect(body).toMatch(/<loc>https?:\/\/\S+\/sitemap\/pages\.xml<\/loc>/);
  expect(body).toMatch(/<loc>https?:\/\/\S+\/sitemap\/projects\.xml<\/loc>/);
  expect(body).toMatch(/<loc>https?:\/\/\S+\/sitemap\/blog\.xml<\/loc>/);
});

test("each segment sitemap resolves and lists its routes", async ({ request }) => {
  const pages = await request.get("/sitemap/pages.xml");
  expect(pages.ok()).toBeTruthy();
  const pagesBody = await pages.text();
  expect(pagesBody).toContain("<urlset");
  expect(pagesBody).toMatch(/<loc>https?:\/\/\S+<\/loc>/);

  const blog = await request.get("/sitemap/blog.xml");
  expect(blog.ok()).toBeTruthy();
  expect(await blog.text()).toContain("<urlset");
});
