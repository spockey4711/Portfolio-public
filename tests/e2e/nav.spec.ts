import { expect, test } from "@playwright/test";

// Verifies the P1-3 acceptance criteria against the real rendered nav: it is
// fixed, exposes the logo and section links, and its live percentage counts up
// as the page scrolls.

test("nav is fixed and exposes the logo and section links", async ({ page }) => {
  await page.goto("/");

  // Scope to the primary nav by its accessible name: the footer's legal links
  // are a second navigation landmark, so an unnamed match would be ambiguous.
  const nav = page.getByRole("navigation", { name: "Hauptnavigation" });
  await expect(nav).toBeVisible();
  await expect(page.locator("header")).toHaveCSS("position", "fixed");

  // Scope the link queries to the nav and match names exactly, so page content
  // (e.g. the hero's "Projekte ansehen" CTA) never collides with the nav links.
  await expect(nav.getByRole("link", { name: /yannik\.wuenker/ })).toHaveAttribute("href", "/#top");
  await expect(nav.getByRole("link", { name: "Projekte", exact: true })).toHaveAttribute(
    "href",
    "/#projekte",
  );
  await expect(nav.getByRole("link", { name: "Über", exact: true })).toHaveAttribute(
    "href",
    "/#ueber",
  );
  await expect(nav.getByRole("link", { name: "Kontakt", exact: true })).toHaveAttribute(
    "href",
    "/#kontakt",
  );

  // Page-level destinations live behind the desktop "Mehr" disclosure (ADR-0005),
  // so the blog is revealed only once it is opened, and it points at its own
  // route rather than a `/#`-anchor.
  await nav.getByRole("button", { name: "Mehr", exact: true }).click();
  await expect(nav.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute(
    "href",
    "/blog",
  );
});

test("the nav blog link navigates to the blog page", async ({ page }) => {
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Hauptnavigation" });
  // The blog link is grouped under the desktop "Mehr" menu, so open it first.
  await nav.getByRole("button", { name: "Mehr", exact: true }).click();
  await nav.getByRole("link", { name: "Blog", exact: true }).click();

  await expect(page).toHaveURL(/\/blog$/);
});

test("nav links navigate home and reach the section from a project detail page", async ({
  page,
}) => {
  // The nav renders on the detail pages too, where the home sections do not
  // exist. Root-relative links must take the user back home and to the anchor.
  await page.goto("/projekte/fuelivo");

  const nav = page.getByRole("navigation", { name: "Hauptnavigation" });
  await nav.getByRole("link", { name: "Projekte", exact: true }).click();

  await expect(page).toHaveURL(/\/#projekte$/);
  await expect(page.locator("#projekte")).toBeInViewport();
});

test("scroll percentage counts up to 100% at the bottom of the page", async ({ page }) => {
  await page.goto("/");

  const percent = page.getByRole("navigation", { name: "Hauptnavigation" }).getByText(/^\d+%$/);
  await expect(percent).toHaveText("0%");

  // The placeholder home page is not tall enough to scroll; add content and
  // fire a resize so the hook re-measures the scrollable height.
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "300vh";
    document.body.appendChild(spacer);
    window.dispatchEvent(new Event("resize"));
  });

  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );

  await expect(percent).toHaveText("100%");
});
